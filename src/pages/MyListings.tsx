import React from 'react';
import { useAppSelector } from '../hooks/redux';
import { useNavigate, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { PlusCircle, ShoppingBag, Edit3, CheckCircle2, Eye, TrendingUp, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../hooks/redux';
import { setSoldStatus } from '../features/products/productSlice';
import { savePersistentProduct } from '../utils/storage';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';


const MyListings: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { items } = useAppSelector((state) => state.products);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();


  if (!user) {
    navigate('/login');
    return null;
  }

  const myListings = items.filter((item) => item.sellerId === user.id);
  
  // Stats calculation
  const totalViews = myListings.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const activeCount = myListings.filter(p => p.status === 'active').length;
  const soldCount = myListings.filter(p => p.status === 'sold').length;

  const handleToggleSold = (id: string, currentStatus: 'active' | 'sold') => {
    const newStatus = currentStatus === 'active' ? 'sold' : 'active';
    dispatch(setSoldStatus({ id, status: newStatus }));
    
    // Persist to local storage
    const product = items.find(p => p.id === id);
    if (product) {
        savePersistentProduct({ ...product, status: newStatus });
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };


  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-black font-heading text-primary-900 tracking-tight">
              {t('listings.title')}
            </h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs">
               {t('listings.active')}
            </p>
          </div>

          <Link
            to="/add-product"
            className="bg-primary-600 text-white px-6 py-3.5 sm:py-4 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-xl flex items-center justify-center space-x-2 active:scale-95 text-sm sm:text-base"
          >
            <PlusCircle size={20} />
            <span>{t('product.addTitle')}</span>
          </Link>
        </div>

        {/* Stats Dashboard */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <motion.div variants={itemVariants} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="bg-primary-50 p-3 rounded-2xl text-primary-600">
              <Package size={24} />
            </div>
            <div>
              <div className="text-2xl font-black text-primary-900 leading-tight">{activeCount}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('listings.stats.active')}</div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="bg-green-50 p-3 rounded-2xl text-green-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="text-2xl font-black text-green-600 leading-tight">{soldCount}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('listings.stats.sold')}</div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
              <Eye size={24} />
            </div>
            <div>
              <div className="text-2xl font-black text-blue-600 leading-tight">{totalViews}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('listings.stats.views')}</div>
            </div>
          </motion.div>
        </motion.div>


        {myListings.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {myListings.map((product) => (
              <motion.div variants={itemVariants} key={product.id} className="relative group flex flex-col">
                <div className={`relative flex-1 ${product.status === 'sold' ? 'grayscale opacity-75' : ''}`}>
                  <ProductCard product={product} />
                  
                  {product.status === 'sold' && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                       <div className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow-2xl border-2 border-green-600 text-green-700 font-black text-lg uppercase tracking-widest rotate-[-12deg]">
                          {t('listings.markAsSold')}
                       </div>
                    </div>
                  )}
                </div>

                {/* Management Controls */}
                <div className="mt-4 flex space-x-2">
                  <button
                      onClick={() => handleToggleSold(product.id, product.status)}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-bold transition-all active:scale-95 ${
                          product.status === 'sold' 
                          ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' 
                          : 'bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-200'
                      }`}
                  >
                      {product.status === 'active' ? (
                          <>
                              <CheckCircle2 size={18} />
                              <span>{t('listings.markAsSold')}</span>
                          </>
                      ) : (
                          <>
                              <CheckCircle2 size={18} className="text-green-600" />
                              <span>{t('listings.reactive')}</span>
                          </>
                      )}
                  </button>
                  <button
                     onClick={() => navigate(`/edit-product/${product.id}`)}
                     className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-primary-600 hover:border-primary-100 transition-all active:scale-95"
                  >
                     <Edit3 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

        ) : (
          <div className="py-24 text-center space-y-6 bg-white rounded-2xl border-2 border-dashed border-gray-100 shadow-sm">
            <div className="bg-primary-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-primary-200">
              <ShoppingBag size={48} />
            </div>
              <div className="space-y-2">
              <h3 className="text-2xl font-black text-primary-900">{t('listings.empty')}</h3>
              <p className="text-gray-500 font-medium max-w-sm mx-auto">
                {t('landing.subtitle')}
              </p>
            </div>
            <button
              onClick={() => navigate('/add-product')}
              className="bg-primary-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-700 shadow-xl transition-all inline-flex items-center space-x-2"
            >
              <PlusCircle size={20} />
              <span>{t('listings.startSelling')}</span>
            </button>

          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default MyListings;
