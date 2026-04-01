import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Category, ListingType } from '../products/productSlice';

interface FilterState {
  categories: Category[];
  listingTypes: ListingType[];
  radius: number | 'all'; // in km
  searchQuery: string;
  sortBy: 'newest' | 'price-low' | 'closest';
}

const initialState: FilterState = {
  categories: [],
  listingTypes: [],
  radius: 'all',
  searchQuery: '',
  sortBy: 'newest',
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
    resetFilters: () => initialState,
  },
});

export const { toggleCategory, toggleListingType, setRadius, setSearchQuery, setSortBy, resetFilters } = filterSlice.actions;

export default filterSlice.reducer;
