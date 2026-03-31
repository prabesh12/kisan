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
      state.items = action.payload;
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
