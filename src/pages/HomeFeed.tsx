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
      thumbnail
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
      exchangePreference
      contactNumbers
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

  const { data, loading, error, refetch } = useQuery<GetProductsData>(GET_PRODUCTS, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const products = data?.getProducts || [];

  useEffect(() => {
    refetch()
  }, [])

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


  const { items: reduxProducts } = useAppSelector((state) => state.products);

  const filteredProducts = useMemo(() => {
    let result = reduxProducts.filter((product: any) => {
      // 1. Hide user's own products from the main feed
      if (user && product.sellerId === user.id) return false;
      
      // 2. Hide sold items
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
  }, [reduxProducts, categories, listingTypes, radius, searchQuery, sortBy, user, minPrice, maxPrice]);

  const activeFilterCount = (categories?.length || 0) + (listingTypes?.length || 0) + (radius !== 'all' ? 1 : 0) + (minPrice !== null || maxPrice !== null ? 1 : 0);

  return (
    <PageTransition>
      <div className="flex flex-col w-full">

        {/* ── Sticky Top Bar: Title + Search + Filter ── */}
        <div className="sticky top-[56px] md:top-[72px] z-30 -mt-6 -mx-4 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-4 py-3">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-lg font-black text-gray-900 tracking-tight">
              {t('filters.freshIn')} <span className="text-primary-600">{t('filters.yourArea')}</span>
            </h2>
            {filteredProducts.length > 0 && (
              <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
                {filteredProducts.length} items
              </span>
            )}
          </div>

          {/* Search + Filter Row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                placeholder={t('filters.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl focus:border-primary-500 focus:bg-white outline-none transition-all placeholder:text-gray-400 text-sm font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => dispatch(setSearchQuery(''))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className={`lg:hidden flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border transition-all text-sm font-bold relative active:scale-95 ${activeFilterCount > 0
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Filter size={15} />
              <span className="hidden xs:inline">{t('filters.title')}</span>
              {activeFilterCount > 0 && (
                <span className="bg-white text-primary-600 text-[10px] min-w-4 h-4 flex items-center justify-center rounded-full font-bold px-0.5">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Main content: sidebar + grid ── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full mt-6">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[260px] shrink-0 sticky top-[160px] z-10">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm max-h-[calc(100vh-190px)] overflow-y-auto no-scrollbar">
              <FilterSidebar />
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1 w-full min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] bg-gray-100" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                      <div className="h-8 bg-gray-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product: any) => (
                    <motion.div key={product.id} variants={itemVariants}>
                      <ProductCard product={product} />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <Filter size={28} className="text-gray-300" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-gray-700">{t('filters.noProducts')}</h3>
                      <p className="text-gray-400 text-xs font-medium">{t('filters.noProductsDesc')}</p>
                    </div>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={() => dispatch(resetFilters())}
                        className="text-primary-600 text-sm font-bold underline underline-offset-2"
                      >
                        {t('filters.clear')}
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </main>
        </div>

        {/* ── Filter Bottom Drawer (mobile) ── */}
        <Drawer.Root open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
            <Drawer.Content className="bg-white flex flex-col rounded-t-[1.5rem] h-[92vh] fixed bottom-0 left-0 right-0 z-[101] outline-none">
              <div className="p-5 bg-white rounded-t-[1.5rem] flex-1 overflow-y-auto no-scrollbar">
                <div className="mx-auto w-10 h-1 flex-shrink-0 rounded-full bg-gray-200 mb-6" />
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-black text-gray-900">{t('filters.title')}</h2>
                  <button
                    onClick={() => setIsFilterDrawerOpen(false)}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all active:scale-90"
                  >
                    <X size={18} />
                  </button>
                </div>
                <FilterSidebar />
              </div>

              <div className="p-4 bg-white border-t border-gray-100 flex gap-3 pb-8">
                <button
                  onClick={() => { dispatch(resetFilters()); setIsFilterDrawerOpen(false); }}
                  className="flex-1 py-2.5 font-bold text-gray-600 border-2 border-gray-100 bg-white hover:bg-gray-50 rounded-xl transition-all active:scale-95 text-xs"
                >
                  {t('filters.clear')}
                </button>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="flex-[2] py-2.5 font-black text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all shadow-lg shadow-primary-100 active:scale-95 text-xs"
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
