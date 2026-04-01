import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Category, ListingType } from '../products/productSlice';

interface FilterState {
  categories: Category[];
  listingTypes: ListingType[];
  radius: number | 'all'; // in km
  searchQuery: string;
  sortBy: 'newest' | 'price-low' | 'closest';
  minPrice: number | null;
  maxPrice: number | null;
}

const initialState: FilterState = {
  categories: [],
  listingTypes: [],
  radius: 'all',
  searchQuery: '',
  sortBy: 'newest',
  minPrice: null,
  maxPrice: null,
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    toggleCategory: (state, action: PayloadAction<Category>) => {
      if (state.categories.includes(action.payload)) {
        state.categories = state.categories.filter((c) => c !== action.payload);
      } else {
        state.categories.push(action.payload);
      }
    },
    toggleListingType: (state, action: PayloadAction<ListingType>) => {
      if (state.listingTypes.includes(action.payload)) {
        state.listingTypes = state.listingTypes.filter((t) => t !== action.payload);
      } else {
        state.listingTypes.push(action.payload);
      }
    },
    setRadius: (state, action: PayloadAction<number | 'all'>) => {
      state.radius = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSortBy: (state, action: PayloadAction<'newest' | 'price-low' | 'closest'>) => {
      state.sortBy = action.payload;
    },
    setPriceRange: (state, action: PayloadAction<{ min: number | null; max: number | null }>) => {
      state.minPrice = action.payload.min;
      state.maxPrice = action.payload.max;
    },
    resetFilters: () => initialState,
  },
});

export const { 
  toggleCategory, 
  toggleListingType, 
  setRadius, 
  setSearchQuery, 
  setSortBy, 
  setPriceRange,
  resetFilters 
} = filterSlice.actions;

export default filterSlice.reducer;
