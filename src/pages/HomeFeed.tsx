import React, { useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { setProducts } from '../features/products/productSlice';
import { getPersistentProducts } from '../utils/storage';
import ProductCard from '../components/ProductCard';

import { Filter, Search, Map as MapIcon, SlidersHorizontal } from 'lucide-react';
import { setCategory, setListingType, setRadius, setSearchQuery, resetFilters } from '../features/filters/filterSlice';
import { calculateDistance } from '../utils/location';
import type { Category, ListingType } from '../features/products/productSlice';
import { useTranslation } from 'react-i18next';


const HomeFeed: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.auth);
  const { category, listingType, radius, searchQuery } = useAppSelector((state) => state.filters);
  const { t } = useTranslation();


  useEffect(() => {
    // If store is empty, seed with persistent data
    if (items.length === 0) {
      dispatch(setProducts(getPersistentProducts()));
    }
  }, [dispatch, items.length]);


  const filteredProducts = useMemo(() => {
    return items.filter((product) => {
      // Category filter
      if (category !== 'all' && product.category !== category) return false;

      // Listing type filter
      if (listingType !== 'all' && product.listingType !== listingType) return false;

      // Search query filter
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !product.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      // Radius filter
      if (radius !== 'all' && user?.location.coordinates) {
        const distance = calculateDistance(user.location.coordinates, product.location.coordinates);
        if (distance > radius) return false;
      }

      return true;
    });
  }, [items, category, listingType, radius, searchQuery, user]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Search */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-primary-900 tracking-tight leading-tight">
            {t('filters.freshIn')} <span className="text-primary-600">{t('filters.yourArea')}</span>
          </h2>


          <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder={t('filters.searchPlaceholder')}
              value={searchQuery}

              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400 font-medium"
            />
          </div>
        </div>

        {/* Filters - Scrollable on mobile */}
        <div className="flex items-center space-x-3 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap sm:gap-3 sm:space-x-0 no-scrollbar select-none">
          <div className="flex-shrink-0 bg-white p-2 rounded-xl border border-gray-100 flex items-center shadow-sm">
            <SlidersHorizontal size={18} className="text-primary-600 mx-2" />
          </div>
          
          {/* Category Dropdown */}
          <div className="flex-shrink-0">
            <select
              value={category}
              onChange={(e) => dispatch(setCategory(e.target.value as Category | 'all'))}
              className="bg-white border-2 border-gray-100 rounded-xl px-4 py-2 font-bold text-gray-700 focus:border-primary-500 outline-none shadow-sm cursor-pointer hover:border-gray-300 transition-all text-sm appearance-none min-w-[140px]"
            >
              <option value="all">{t('filters.allCategories')}</option>
              <option value="vegetables">{t('filters.categories.vegetables')}</option>
              <option value="fruits">{t('filters.categories.fruits')}</option>
              <option value="meat">{t('filters.categories.meat')}</option>
              <option value="dairy">{t('filters.categories.dairy')}</option>
              <option value="grains">{t('filters.categories.grains')}</option>
              <option value="other">{t('filters.categories.other')}</option>
            </select>
          </div>

          {/* Listing Type Dropdown */}
          <div className="flex-shrink-0">
            <select
              value={listingType}
              onChange={(e) => dispatch(setListingType(e.target.value as ListingType | 'all'))}
              className="bg-white border-2 border-gray-100 rounded-xl px-4 py-2 font-bold text-gray-700 focus:border-primary-500 outline-none shadow-sm cursor-pointer hover:border-gray-300 transition-all text-sm appearance-none min-w-[110px]"
            >
              <option value="all">{t('filters.allTypes')}</option>
              <option value="sell">{t('filters.types.sell')}</option>
              <option value="exchange">{t('filters.types.exchange')}</option>
              <option value="free">{t('filters.types.free')}</option>
            </select>
          </div>

          {/* Radius Dropdown */}
          <div className="flex-shrink-0">
            <select
              value={radius}
              onChange={(e) => dispatch(setRadius(e.target.value === 'all' ? 'all' : Number(e.target.value)))}
              className="bg-white border-2 border-gray-100 rounded-xl px-4 py-2 font-bold text-gray-700 focus:border-primary-500 outline-none shadow-sm cursor-pointer hover:border-gray-300 transition-all text-sm appearance-none min-w-[140px]"
            >
              <option value="all">{t('filters.anyDistance')}</option>
              <option value="5">{t('filters.within')} 5{t('filters.km')}</option>
              <option value="10">{t('filters.within')} 10{t('filters.km')}</option>
              <option value="25">{t('filters.within')} 25{t('filters.km')}</option>
              <option value="50">{t('filters.within')} 50{t('filters.km')}</option>
            </select>
          </div>

          {(category !== 'all' || listingType !== 'all' || radius !== 'all' || searchQuery) && (
            <div className="flex-shrink-0">
              <button
                onClick={() => dispatch(resetFilters())}
                className="text-primary-600 font-bold text-sm hover:underline px-2 whitespace-nowrap"
              >
                {t('filters.clear')}
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
    </div>
  );
};

export default HomeFeed;
