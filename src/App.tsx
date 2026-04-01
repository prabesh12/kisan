import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { AnimatePresence } from 'framer-motion';
import { store, persistor } from './app/store';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import LoginSignup from './pages/LoginSignup';
import HomeFeed from './pages/HomeFeed';
import UserProfile from './pages/UserProfile';
import MyListings from './pages/MyListings';
import AddEditProduct from './pages/AddEditProduct';
import ProductDetails from './pages/ProductDetails';
import PublicProfile from './pages/PublicProfile';

import LocationProvider from './components/LocationProvider';

const AppContent: React.FC = () => {
  const location = useLocation();

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/home" element={<HomeFeed />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/add-product" element={<AddEditProduct />} />
          <Route path="/edit-product/:id" element={<AddEditProduct />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/seller/:id" element={<PublicProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <LocationProvider>
          <Router>
            <AppContent />
          </Router>
        </LocationProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
