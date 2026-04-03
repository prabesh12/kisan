import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ApolloProvider } from '@apollo/client/react/index.js';
import { AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { store, persistor } from './app/store';
import { client } from './apolloClient';
import Layout from './components/Layout';
import { Toaster } from 'react-hot-toast';
import LocationProvider from './components/LocationProvider';
import { logout } from './features/auth/authSlice';

// Lazy load pages for bundle optimization
const Landing = React.lazy(() => import('./pages/Landing'));
const LoginSignup = React.lazy(() => import('./pages/LoginSignup'));
const HomeFeed = React.lazy(() => import('./pages/HomeFeed'));
const UserProfile = React.lazy(() => import('./pages/UserProfile'));
const MyListings = React.lazy(() => import('./pages/MyListings'));
const AddEditProduct = React.lazy(() => import('./pages/AddEditProduct'));
const ProductDetails = React.lazy(() => import('./pages/ProductDetails'));
const PublicProfile = React.lazy(() => import('./pages/PublicProfile'));

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-primary-100 rounded-full animate-ping opacity-20" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 bg-primary-600 rounded-xl animate-pulse shadow-lg shadow-primary-200" />
      </div>
    </div>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 animate-pulse">Kisan Market</p>
  </div>
);

const AppContent: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  React.useEffect(() => {
    // Self-healing: if user exists but has missing required fields (from old sessions), clear it
    if (user && !user.location) {
      console.warn('Malformed user session detected. Clearing...');
      dispatch(logout());
    }
  }, [user, dispatch]);

  return (
    <Layout>
      <React.Suspense fallback={<PageLoader />}>
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
      </React.Suspense>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ApolloProvider client={client}>
          <LocationProvider>
            <Router>
              <AppContent />
            </Router>
            <Toaster position="top-right" />
          </LocationProvider>
        </ApolloProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
