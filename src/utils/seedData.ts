import type { Product } from '../features/products/productSlice';

/**
 * Seed data utility for initial app state.
 */
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    sellerId: 'u1',
    sellerName: 'Ramesh Adhikari',
    name: 'Organic Tomatoes',
    category: 'vegetables',
    photos: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=400'],
    quantity: 5,
    unit: 'kg',
    listingType: 'sell',
    price: 120,
    description: 'Fresh organic tomatoes from my farm in Kathmandu. No pesticides used.',
    location: {
      city: 'Kathmandu',
      coordinates: { lat: 27.7172, lng: 85.3240 },
    },
    createdAt: new Date().toISOString(),
    status: 'active',
    views: 45,
    contactNumbers: ['9841234567', '9800000001'],
    tags: ['organic', 'fresh', 'kathmandu'],
  },


  {
    id: 'p2',
    sellerId: 'u2',
    sellerName: 'Sita Sharma',
    name: 'Fresh Buffalo Milk',
    category: 'dairy',
    photos: ['https://images.unsplash.com/photo-1550583724-125581f77833?q=80&w=400'],
    quantity: 2,
    unit: 'litres',
    listingType: 'free',
    description: 'Extra milk available today for anyone in need. Free of cost.',
    location: {
      city: 'Patan',
      coordinates: { lat: 27.6744, lng: 85.3240 },
    },
    createdAt: new Date().toISOString(),
    status: 'active',
    views: 12,
    contactNumbers: ['9851000000', '9800000002'],
    tags: ['dairy', 'free', 'nepal'],
  },


  {
    id: 'p3',
    sellerId: 'u3',
    sellerName: 'Hari Prasad',
    name: 'Wheat Grains',
    category: 'grains',
    photos: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=400'],
    quantity: 50,
    unit: 'kg',
    listingType: 'exchange',
    exchangePreference: 'Rice or Corn',
    description: 'High quality wheat grains for exchange.',
    location: {
      city: 'Bhaktapur',
      coordinates: { lat: 27.6710, lng: 85.4298 },
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'active',
    views: 89,
    contactNumbers: ['9861000000', '9800000003'],
    tags: ['grains', 'exchange', 'farm'],
  },


];

export const MOCK_USER = {
  id: 'me',
  name: 'Kisan User',
  phone: '9841234567',
  location: {
    city: 'Kathmandu',
    coordinates: { lat: 27.7000, lng: 85.3333 }, 
  },
  bio: 'Passionate farmer from the hills.',
  profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
  farmName: 'Fresh Hill Farm',
  specialty: 'Organic Vegetables',
};

export const MOCK_SELLERS = [
  {
    id: 'u1',
    name: 'Ramesh Adhikari',
    phone: '9841234567',
    location: { city: 'Kathmandu', coordinates: { lat: 27.7172, lng: 85.3240 } },
    bio: 'Dedicated to chemical-free farming since 2010.',
    profilePhoto: 'https://images.unsplash.com/photo-1541339907198-e08756dee98f?q=80&w=200',
    farmName: 'Kathmandu Organic Hub',
    specialty: 'Vegetables',
  },
  {
    id: 'u2',
    name: 'Sita Sharma',
    phone: '9851000000',
    location: { city: 'Patan', coordinates: { lat: 27.6744, lng: 85.3240 } },
    bio: 'I bring the freshest dairy from Patan to your doorstep.',
    profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200',
    farmName: 'Sita Dairy Farm',
    specialty: 'Dairy',
  },
  {
    id: 'u3',
    name: 'Hari Prasad',
    phone: '9861000000',
    location: { city: 'Bhaktapur', coordinates: { lat: 27.6710, lng: 85.4298 } },
    bio: 'Quality grains from the ancient city of Bhaktapur.',
    profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200',
    farmName: 'Bhakapur Grain Co.',
    specialty: 'Grains',
  }
];
