import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type Category = 'vegetables' | 'fruits' | 'meat' | 'dairy' | 'grains' | 'other';
export type ListingType = 'sell' | 'exchange' | 'free';

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  name: string;
  category: Category;
  photos: string[];
  quantity: number;
  unit: string;
  listingType: ListingType;
  price?: number;
  exchangePreference?: string;
  description: string;
  location: {
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  createdAt: string;
  status: 'active' | 'sold';
  views: number;
  contactNumbers: string[];
  tags: string[];
}

interface ProductState {
  items: Product[];
}

const initialState: ProductState = {
  items: [],
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload.map(product => {
        // Migration: If product has contactNumber string but not contactNumbers array
        if (!(product as any).contactNumbers && (product as any).contactNumber) {
          return {
            ...product,
            contactNumbers: [(product as any).contactNumber]
          };
        }
        // Ensure contactNumbers is at least an empty array to prevent crashes
        return {
          ...product,
          contactNumbers: product.contactNumbers || []
        };
      });
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.items.unshift({
        ...action.payload,
        status: 'active',
        views: 0
      });
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    setSoldStatus: (state, action: PayloadAction<{ id: string; status: 'active' | 'sold' }>) => {
      const product = state.items.find((p) => p.id === action.payload.id);
      if (product) {
        product.status = action.payload.status;
      }
    },
    incrementProductViews: (state, action: PayloadAction<string>) => {
      const product = state.items.find((p) => p.id === action.payload);
      if (product) {
        product.views += 1;
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
  },
});

export const { 
  setProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  setSoldStatus, 
  incrementProductViews 
} = productSlice.actions;

export default productSlice.reducer;
