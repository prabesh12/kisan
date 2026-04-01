import React, { useEffect, useMemo, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { useSearchParams } from 'react-router-dom';
import { Drawer } from 'vaul';
import { motion } from 'framer-motion';
import { useQuery } from '@apollo/client/react/index.js';
import { gql } from '@apollo/client/core/index.js';
import { setProducts } from '../features/products/productSlice';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import PageTransition from '../components/PageTransition';

import {
  Filter,
  Search, X
} from 'lucide-react';
import { setSearchQuery, resetFilters, setSortBy } from '../features/filters/filterSlice';

import { calculateDistance } from '../utils/location';
import { useTranslation } from 'react-i18next';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

const GET_PRODUCTS = gql`
  query GetProducts($category: String, $listingType: String, $search: String) {
    getProducts(category: $category, listingType: $listingType, search: $search) {
      id
      name
      description
      price
      unit
      quantity
      category
      listingType
      photos
      location {
        city
        coordinates {
          lat
          lng
        }
      }
      seller {
        id
        name
      }
      status
      tags
      createdAt
    }
  }
`;

interface GetProductsData {
  getProducts: any[];
}

const HomeFeed: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { categories, listingTypes, radius, searchQuery, sortBy, minPrice, maxPrice } = useAppSelector((state) => state.filters);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();
  
  const { data, loading, error } = useQuery<GetProductsData>(GET_PRODUCTS);
  
  const products = data?.getProducts || [];

  useEffect(() => {
    if (data?.getProducts) {
      const mappedProducts = data.getProducts.map((p: any) => ({
        ...p,
        sellerId: p.seller.id,
        sellerName: p.seller.name
      }));
      dispatch(setProducts(mappedProducts));
    }
  }, [data, dispatch]);

  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      dispatch(setSearchQuery(query));
    }
  }, [searchParams, dispatch]);

  // Set default sort to 'closest' if location is available
  useEffect(() => {
    if (user?.location?.coordinates && sortBy === 'newest') {
      dispatch(setSortBy('closest'));
    }
  }, [user?.location?.coordinates, dispatch, sortBy]); 


  const filteredProducts = useMemo(() => {
    let result = products.filter((product: any) => {
      if (product.status === 'sold') return false;
      if (categories && categories.length > 0 && !categories.includes(product.category)) return false;
      if (listingTypes && listingTypes.length > 0 && !listingTypes.includes(product.listingType)) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (query.startsWith('#')) {
          const tagTrigger = query.slice(1);
          if (!product.tags?.some((tag: string) => tag.toLowerCase().includes(tagTrigger))) return false;
        } else {
          if (!product.name.toLowerCase().includes(query) &&
            !product.description.toLowerCase().includes(query)) return false;
        }
      }
      if (minPrice !== null && (product.price || 0) < minPrice) return false;
      if (maxPrice !== null && (product.price || 0) > maxPrice) return false;
      if (radius !== 'all' && user?.location.coordinates) {
        const distance = calculateDistance(user.location.coordinates, product.location.coordinates);
        if (distance > radius) return false;
      }
      return true;
    });

    return [...result].sort((a: any, b: any) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'price-low') {
        const priceA = a.listingType === 'sell' ? (a.price || 0) : 0;
        const priceB = b.listingType === 'sell' ? (b.price || 0) : 0;
        return priceA - priceB;
      }
      if (sortBy === 'closest' && user?.location.coordinates) {
        const distA = calculateDistance(user.location.coordinates, a.location.coordinates);
        const distB = calculateDistance(user.location.coordinates, b.location.coordinates);
        return distA - distB;
      }
      return 0;
    });
  }, [products, categories, listingTypes, radius, searchQuery, sortBy, user, minPrice, maxPrice]);

  const activeFilterCount = (categories?.length || 0) + (listingTypes?.length || 0) + (radius !== 'all' ? 1 : 0) + (minPrice !== null || maxPrice !== null ? 1 : 0);

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="sticky top-[64px] md:top-[74px] z-30 -mx-4 px-4 py-4 sm:mx-0 sm:px-0 bg-gray-50/80 backdrop-blur-md border-b border-gray-100 sm:border-none">
          <div className="space-y-6 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-primary-900 tracking-tight font-heading">
                {t('filters.freshIn')} <span className="text-primary-600">{t('filters.yourArea')}</span>
              </h2>

              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder={t('filters.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 border-2 border-transparent bg-white rounded-xl shadow-sm focus:border-primary-500 outline-none transition-all placeholder:text-gray-400 text-sm font-medium"
                />
              </div>

              <button
                onClick={() => setIsFilterDrawerOpen(true)}
                className="lg:hidden flex-shrink-0 flex items-center space-x-2 bg-white border-2 border-gray-100 px-5 py-3 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold text-gray-700 relative active:scale-95"
              >
                <Filter size={16} className={activeFilterCount > 0 ? 'text-primary-600' : 'text-gray-500'} />
                <span>{t('filters.title')}</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-[10px] min-w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm px-1">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
          <aside className="hidden lg:block w-[280px] shrink-0 sticky top-[165px] z-10 bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 max-h-[calc(100vh-185px)] overflow-y-auto no-scrollbar">
            <FilterSidebar />
          </aside>

          <main className="flex-1 w-full min-w-0">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product: any) => (
                  <motion.div key={product.id} variants={itemVariants}>
                    <ProductCard product={product} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-24 text-center space-y-4 bg-white rounded-2xl border-2 border-dashed border-gray-100">
                  <div className="bg-primary-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-primary-200">
                    <Filter size={48} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-primary-900 font-heading">{t('filters.noProducts')}</h3>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">{t('filters.noProductsDesc')}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </main>
        </div>

        <Drawer.Root open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
            <Drawer.Content className="bg-white flex flex-col rounded-t-[1.5rem] h-[92vh] fixed bottom-0 left-0 right-0 z-[101] outline-none border-t border-gray-100">
              <div className="p-6 bg-white rounded-t-[1.5rem] flex-1 overflow-y-auto w-full max-w-md mx-auto relative no-scrollbar">
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-200 mb-8" />
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-primary-900 font-heading">{t('filters.title')}</h2>
                  <button
                    onClick={() => setIsFilterDrawerOpen(false)}
                    className="bg-gray-100 hover:bg-gray-200 p-3 rounded-xl text-gray-400 transition-colors active:scale-90"
                  >
                    <X size={20} />
                  </button>
                </div>
                <FilterSidebar />
              </div>

              <div className="p-6 bg-white border-t border-gray-50 flex gap-4 outline-none w-full max-w-md mx-auto pb-10">
                <button
                  onClick={() => { dispatch(resetFilters()); setIsFilterDrawerOpen(false); }}
                  className="flex-1 py-4 font-bold text-gray-500 border-2 border-gray-100 bg-white hover:bg-gray-50 rounded-2xl transition-all active:scale-95"
                >
                  {t('filters.clear')}
                </button>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="flex-shrink-0 w-2/3 py-4 font-black text-white bg-primary-600 hover:bg-primary-700 rounded-2xl transition-all shadow-xl shadow-primary-200 active:scale-95"
                >
                  {t('filters.apply')}
                </button>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    </PageTransition>
  );
};

export default HomeFeed;
