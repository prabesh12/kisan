import { MOCK_USER, MOCK_PRODUCTS } from './seedData';
import type { Product } from '../features/products/productSlice';

const USERS_KEY = 'kisan_users';
const PRODUCTS_KEY = 'kisan_products';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  location: {
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  bio: string;
  profilePhoto?: string;
}

/**
 * Initialize local storage with seed data if empty.
 */
export const initStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify([MOCK_USER]));
  }
  if (!localStorage.getItem(PRODUCTS_KEY)) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(MOCK_PRODUCTS));
  }
};

/**
 * Get all users from local storage.
 */
export const getUsers = (): UserProfile[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [MOCK_USER];
};

/**
 * Save a new user or update an existing one.
 */
export const saveUser = (user: UserProfile) => {
  const users = getUsers();
  const index = users.findIndex((u) => u.phone === user.phone || u.id === user.id);
  
  if (index !== -1) {
    users[index] = user;
  } else {
    users.push(user);
  }
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

/**
 * Find a user by phone number.
 */
export const findUserByPhone = (phone: string): UserProfile | undefined => {
  return getUsers().find((u) => u.phone === phone);
};

/**
 * Get all products (Phase 1 simplicity: still using Redux for state, 
 * but this helper can be used for persistent product management).
 */
export const getPersistentProducts = (): Product[] => {
  const products = localStorage.getItem(PRODUCTS_KEY);
  return products ? JSON.parse(products) : MOCK_PRODUCTS;
};

export const savePersistentProduct = (product: Product) => {
    const products = getPersistentProducts();
    const index = products.findIndex(p => p.id === product.id);
    if(index !== -1) {
        products[index] = product;
    } else {
        products.unshift(product);
    }
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const deletePersistentProduct = (id: string) => {
    const products = getPersistentProducts().filter(p => p.id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};
