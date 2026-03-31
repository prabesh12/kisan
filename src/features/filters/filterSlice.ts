import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Category, ListingType } from '../products/productSlice';

interface FilterState {
  category: Category | 'all';
  listingType: ListingType | 'all';
  radius: number | 'all'; // in km
  searchQuery: string;
}

const initialState: FilterState = {
  category: 'all',
  listingType: 'all',
  radius: 'all',
  searchQuery: '',
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<Category | 'all'>) => {
      state.category = action.payload;
    },
    setListingType: (state, action: PayloadAction<ListingType | 'all'>) => {
      state.listingType = action.payload;
    },
    setRadius: (state, action: PayloadAction<number | 'all'>) => {
      state.radius = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    resetFilters: () => initialState,
  },
});

export const { setCategory, setListingType, setRadius, setSearchQuery, resetFilters } = filterSlice.actions;
export default filterSlice.reducer;
