import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './app/store';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import LoginSignup from './pages/LoginSignup';
import HomeFeed from './pages/HomeFeed';
import UserProfile from './pages/UserProfile';
import MyListings from './pages/MyListings';
import AddEditProduct from './pages/AddEditProduct';
import ProductDetails from './pages/ProductDetails';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<LoginSignup />} />
              <Route path="/home" element={<HomeFeed />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/my-listings" element={<MyListings />} />
              <Route path="/add-product" element={<AddEditProduct />} />
              <Route path="/edit-product/:id" element={<AddEditProduct />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </PersistGate>
    </Provider>
  );
};

export default App;
