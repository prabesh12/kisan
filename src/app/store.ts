import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from '../features/auth/authSlice';
import productReducer from '../features/products/productSlice';
import filterReducer from '../features/filters/filterSlice';

const persistConfig = {
  key: 'root',
  version: 1,
  storage: (storage as any).default || storage,
  whitelist: ['auth', 'products'], // Only persist auth and products
};


const rootReducer = combineReducers({
  auth: authReducer,
  products: productReducer,
  filters: filterReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
