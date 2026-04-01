import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { toggleCategory, toggleListingType, setRadius, setSortBy, resetFilters } from '../features/filters/filterSlice';
import type { Category, ListingType } from '../features/products/productSlice';
import { ChevronDown, Crosshair, MapPin } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const FilterSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { categories, listingTypes, radius, sortBy } = useAppSelector((state) => state.filters);

  return (
    <div className="flex flex-col space-y-6">
      
      {/* Category Section */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 text-[15px]">{t('filters.allCategories')}</h4>
        <div className="space-y-3">
          {['vegetables', 'fruits', 'meat', 'dairy', 'grains', 'other'].map(cat => {
            const isChecked = categories?.includes(cat as Category) || false;
            return (
              <label key={cat} className="flex items-center space-x-3 cursor-pointer group py-0.5">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer" 
                  checked={isChecked}
                  onChange={() => dispatch(toggleCategory(cat as Category))}
                />
                <span className={cn(
                  "text-sm transition-colors", 
                  isChecked ? "text-primary-600 font-medium" : "text-gray-600 hover:text-gray-900"
                )}>
                  {t(`filters.categories.${cat}`)}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-gray-100 w-full" />

      {/* Listing Type Section */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 text-[15px]">Listing Type</h4>
        <div className="flex bg-gray-100/80 p-1 rounded-lg">
          {['sell', 'exchange', 'free'].map((type, index) => {
             const isSelected = listingTypes?.includes(type as ListingType) || false;
             return (
               <button
                 key={type}
                 onClick={() => dispatch(toggleListingType(type as ListingType))}
                 className={cn(
                   "flex-1 py-1.5 text-[13px] font-medium rounded-md transition-all capitalize",
                   isSelected 
                     ? "bg-white text-gray-900 shadow-sm border border-gray-200/50" 
                     : "text-gray-500 hover:text-gray-700"
                 )}
               >
                 {t(`filters.types.${type}`)}
               </button>
             );
          })}
        </div>
      </div>

      <div className="h-px bg-gray-100 w-full" />

      {/* Sort Section */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 text-[15px]">Sort By</h4>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => dispatch(setSortBy(e.target.value as any))}
            className="w-full appearance-none bg-gray-50/50 border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all cursor-pointer"
          >
            <option value="newest">{t('filters.sort.newest')}</option>
            <option value="price-low">{t('filters.sort.priceLow')}</option>
            <option value="closest">{t('filters.sort.closest')}</option>
          </select>
          <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="h-px bg-gray-100 w-full" />

      {/* Distance Section */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 text-[15px]">Location & Distance</h4>
        <div className="relative">
          <select
            value={radius}
            onChange={(e) => dispatch(setRadius(e.target.value === 'all' ? 'all' : Number(e.target.value)))}
            className="w-full appearance-none bg-gray-50/50 border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-[13px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all cursor-pointer"
          >
            <option value="all">{t('filters.anyDistance')}</option>
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="25">Within 25 km</option>
            <option value="50">Within 50 km</option>
          </select>
          <Crosshair size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <p className="text-xs text-gray-400 mt-1">Pick a radius from your location</p>
      </div>

    </div>
  );
};

export default FilterSidebar;
