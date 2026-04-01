import React, { useEffect, useMemo, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { useSearchParams } from 'react-router-dom';
import { Drawer } from 'vaul';
import { setProducts } from '../features/products/productSlice';
import { getPersistentProducts } from '../utils/storage';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';

import {
  Filter,
  Search, X
} from 'lucide-react';
import { setSearchQuery, resetFilters } from '../features/filters/filterSlice';

import { calculateDistance } from '../utils/location';
import { useTranslation } from 'react-i18next';


const HomeFeed: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.auth);
  const { categories, listingTypes, radius, searchQuery, sortBy } = useAppSelector((state) => state.filters);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const { t } = useTranslation();



  const [searchParams] = useSearchParams();

  useEffect(() => {
    // If store is empty, seed with persistent data
    if (items.length === 0) {
      dispatch(setProducts(getPersistentProducts()));
    }
  }, [dispatch, items.length]);

  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      dispatch(setSearchQuery(query));
    }
  }, [searchParams, dispatch]);



  const filteredProducts = useMemo(() => {
    let result = items.filter((product) => {
      // Phase 2: Filter out SOLD items completely
      if (product.status === 'sold') return false;

      // Category filter (Multi-Select)
      if (categories && categories.length > 0 && !categories.includes(product.category)) return false;

      // Listing type filter (Multi-Select)
      if (listingTypes && listingTypes.length > 0 && !listingTypes.includes(product.listingType)) return false;

      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (query.startsWith('#')) {
          const tagTrigger = query.slice(1);
          if (!product.tags?.some(tag => tag.toLowerCase().includes(tagTrigger))) return false;
        } else {
          if (!product.name.toLowerCase().includes(query) &&
            !product.description.toLowerCase().includes(query)) return false;
        }
      }


      // Radius filter
      if (radius !== 'all' && user?.location.coordinates) {
        const distance = calculateDistance(user.location.coordinates, product.location.coordinates);
        if (distance > radius) return false;
      }

      return true;
    });

    // Phase 2: Global Sorting
    return [...result].sort((a, b) => {
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
  }, [items, categories, listingTypes, radius, searchQuery, sortBy, user]);

  const activeFilterCount = (categories?.length || 0) + (listingTypes?.length || 0) + (radius !== 'all' ? 1 : 0);


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Sticky Header & Search */}
      <div className="sticky top-[64px] md:top-[74px] z-30 -mx-4 px-4 py-4 sm:mx-0 sm:px-0 bg-white/95 backdrop-blur-md border-b border-gray-100 sm:border-none">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {t('filters.freshIn')} <span className="text-primary-600">{t('filters.yourArea')}</span>
            </h2>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={t('filters.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400 text-sm bg-gray-50/50"
              />
            </div>

            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="lg:hidden flex-shrink-0 flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium text-gray-700 relative active:scale-95"
            >
              <Filter size={16} className={activeFilterCount > 0 ? 'text-primary-600' : 'text-gray-500'} />
              <span>Filters</span>
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
        {/* Desktop Sidebar (Persistent) */}
        <aside className="hidden lg:block w-[260px] shrink-0 sticky top-[165px] z-10 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm max-h-[calc(100vh-185px)] overflow-y-auto no-scrollbar">
          <FilterSidebar />
        </aside>

        {/* Main Grid Content */}
        <main className="flex-1 w-full min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-24 text-center space-y-4 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-gray-300">
                  <Filter size={40} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-gray-900">{t('filters.noProducts')}</h3>
                  <p className="text-gray-500 font-medium">{t('filters.noProductsDesc')}</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Vaul Native Mobile Drawer */}
      <Drawer.Root open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-[20px] h-[92vh] fixed bottom-0 left-0 right-0 z-[101] outline-none">
            <div className="p-4 bg-white rounded-t-[20px] flex-1 overflow-y-auto w-full max-w-md mx-auto relative no-scrollbar">
              <div className="mx-auto w-12 h-1 flex-shrink-0 rounded-full bg-gray-300 mb-4" />
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <h2 className="text-[17px] font-bold text-gray-900">Filters</h2>
                </div>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="bg-gray-100/50 hover:bg-gray-100 p-2 rounded-full text-gray-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <FilterSidebar />
            </div>

            {/* Mobile Drawer Actions */}
            <div className="p-4 bg-white border-t border-gray-200/60 flex gap-3 outline-none w-full max-w-md mx-auto pb-6">
              <button
                onClick={() => { dispatch(resetFilters()); setIsFilterDrawerOpen(false); }}
                className="flex-1 py-2.5 font-medium text-sm text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 rounded-lg transition-all"
              >
                {t('filters.clear')}
              </button>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-shrink-0 w-2/3 py-2.5 font-medium text-[15px] text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-all"
              >
                Apply
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

    </div>
  );
};

export default HomeFeed;
