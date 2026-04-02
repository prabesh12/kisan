import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';
import { 
  MapPin, 
  Calendar, 
  Phone, 
  ArrowLeft, 
  Store, 
  CheckCircle,
  Package,
  TrendingUp,
  User as UserIcon
} from 'lucide-react';
import { findUserById } from '../utils/storage';
import ProductCard from '../components/ProductCard';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useQuery } from '@apollo/client/react/index.js';
import { gql } from '@apollo/client/core/index.js';

const GET_USER = gql`
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      name
      farmName
      bio
      profilePhoto
      location {
        city
      }
      phoneNumber
    }
  }
`;

const GET_PRODUCTS = gql`
  query GetProducts($sellerId: String) {
    getProducts(sellerId: $sellerId) {
      id
      name
      description
      price
      unit
      quantity
      category
      listingType
      photos
      location {
        city
        coordinates {
          lat
          lng
        }
      }
      seller {
        id
        name
      }
      status
      tags
      createdAt
    }
  }
`;

interface GetUserData {
  getUser: any;
}

interface GetProductsData {
  getProducts: any[];
}

const PublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: userData, loading: userLoading } = useQuery<GetUserData>(GET_USER, {
    variables: { id },
    skip: !id
  });

  const { data: productsData, loading: productsLoading } = useQuery<GetProductsData>(GET_PRODUCTS, {
    variables: { sellerId: id },
    skip: !id
  });

  const seller = userData?.getUser;
  const sellerProducts = useMemo(() => {
    return (productsData?.getProducts || []).filter((p: any) => p.status === 'active');
  }, [productsData]);

  const totalViews = useMemo(() => {
    return sellerProducts.reduce((acc: number, p: any) => acc + (p.views || 0), 0);
  }, [sellerProducts]);

  if (userLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">{t('filters.noProducts')}</h2>
        <button onClick={() => navigate('/home')} className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold">
          {t('nav.home')}
        </button>
      </div>
    );
  }

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
      <div className="space-y-12">
      {/* Premium Header */}
      <div className="relative h-64 sm:h-80 -mt-6 sm:-mt-8 -mx-4 sm:-mx-0 overflow-hidden sm:rounded-b-3xl">
        <img 
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200" 
          className="w-full h-full object-cover brightness-50"
          alt="Farm Background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 to-transparent" />
        
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all active:scale-95 border border-white/20"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-4 w-full">
           <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-8 border-white bg-white shadow-2xl overflow-hidden relative group">
              <img 
                src={seller.profilePhoto || `https://ui-avatars.com/api/?name=${seller.name}&background=random`} 
                alt={seller.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-primary-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
           </div>
        </div>
      </div>

      <div className="mt-16 text-center max-w-4xl mx-auto space-y-6">
        <div className="space-y-3">
           <div className="flex items-center justify-center space-x-2 text-primary-600 font-black uppercase tracking-[0.2em] text-xs">
              <Store size={14} />
              <span>{t('profile.digitalStorefront')}</span>
           </div>
           <h1 className="text-4xl sm:text-5xl font-black text-primary-900 tracking-tight font-heading">
              {seller.farmName || seller.name}
           </h1>
           <div className="flex items-center justify-center space-x-4">
              <div className="inline-flex items-center space-x-1.5 bg-primary-50 text-primary-700 px-4 py-1.5 rounded-full font-black text-xs uppercase border border-primary-100 shadow-sm">
                 <CheckCircle size={14} />
                 <span>{seller.specialty || t('profile.specialties.general')}</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-500 font-bold text-sm">
                 <MapPin size={16} className="text-primary-500" />
                 <span>{seller.location.city}</span>
              </div>
           </div>
        </div>

        {/* Farmer Bio */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
           <p className="text-xl text-gray-600 font-medium leading-relaxed italic relative z-10">
              "{seller.bio || 'Experienced farmer dedicated to providing high-quality agricultural products to the community.'}"
           </p>
           <div className="mt-6 flex items-center justify-center space-x-6 text-gray-400 font-bold text-xs uppercase tracking-widest border-t border-gray-50 pt-6">
              <div className="flex items-center space-x-2">
                 <Calendar size={14} />
                 <span>{t('profile.farmerSince')} 2021</span>
              </div>
              <div className="flex items-center space-x-2">
                 <UserIcon size={14} />
                 <span>{seller.name}</span>
              </div>
           </div>
        </div>

        {/* Stats Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
           <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center space-y-1">
              <Package size={24} className="text-primary-600 mb-1" />
              <div className="text-2xl font-black text-primary-900">{sellerProducts.length}</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest underline decoration-primary-200">{t('profile.activeListings')}</div>
           </motion.div>
           <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center space-y-1">
              <TrendingUp size={24} className="text-primary-600 mb-1" />
              <div className="text-2xl font-black text-primary-900">{totalViews}</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest underline decoration-primary-200">{t('profile.productViews')}</div>
           </motion.div>
           <motion.div variants={itemVariants} className="bg-primary-600 p-6 rounded-2xl flex flex-col items-center justify-center space-y-1 shadow-lg shadow-primary-100 col-span-2">
              <a 
                href={`tel:${seller.phone}`}
                className="flex items-center space-x-3 text-white font-black text-xl active:scale-95 transition-transform"
              >
                 <Phone size={24} />
                 <span>{t('profile.contactFarmer')}</span>
              </a>
           </motion.div>
        </motion.div>

        {/* Listings Section */}
        <div className="space-y-6 pt-4">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black text-primary-900 tracking-tight font-heading">
                 {t('profile.current')} <span className="text-primary-600">{t('profile.offeredItems')}</span>
              </h2>
              <div className="h-1 flex-1 bg-gray-50 mx-6 rounded-full" />
           </div>

           {sellerProducts.length > 0 ? (
             <motion.div 
               variants={containerVariants}
               initial="hidden"
               animate="visible"
               className="grid grid-cols-1 sm:grid-cols-2 gap-4"
             >
                 {sellerProducts.map((product: any) => (
                   <motion.div variants={itemVariants} key={product.id}>
                     <ProductCard product={product} />
                   </motion.div>
                 ))}
             </motion.div>
           ) : (
             <div className="py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center space-y-4">
                <Package size={48} className="mx-auto text-gray-300" />
                <div className="space-y-1">
                   <h3 className="font-bold text-gray-900">{t('profile.noListings')}</h3>
                   <p className="text-gray-500 font-medium text-sm">{t('profile.noListingsDesc')}</p>
                </div>
             </div>
           )}
        </div>
      </div>
      </div>
    </PageTransition>
  );
};

export default PublicProfile;
