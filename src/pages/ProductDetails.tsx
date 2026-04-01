import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Calendar, 
  Share2, 
  ChevronRight, 
  Tag, 
  Clock, 
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { findUserById } from '../utils/storage';
import { incrementProductViews } from '../features/products/productSlice';
import { useEffect } from 'react';
import MapModal from '../components/MapModal';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();
  
  const { items } = useAppSelector((state) => state.products);
  const { user: currentUser, guestLocation } = useAppSelector((state) => state.auth);
  
  const userCoords = currentUser?.location.coordinates || guestLocation;
  
  const product = items.find((p) => p.id === id);
  const seller = product ? findUserById(product.sellerId) : null;
  
  const [activeImage, setActiveImage] = useState(0);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(incrementProductViews(id));
    }
    window.scrollTo(0, 0);
  }, [id, dispatch]);

  const distance = useMemo(() => {
    if (!product || !userCoords) return null;
    
    // Haversine formula
    const R = 6371; // km
    const dLat = (product.location.coordinates.lat - userCoords.lat) * Math.PI / 180;
    const dLon = (product.location.coordinates.lng - userCoords.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userCoords.lat * Math.PI / 180) * Math.cos(product.location.coordinates.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  }, [product, userCoords]);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
        <button onClick={() => navigate('/home')} className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold">
          Back to Home
        </button>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="pb-32 animate-in fade-in duration-500">
      {/* Mobile Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-4 flex items-center justify-between pointer-events-none">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl text-gray-900 pointer-events-auto active:scale-95 transition-all border border-white/20"
        >
          <ArrowLeft size={24} />
        </button>
        <button 
          onClick={handleShare}
          className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl text-gray-900 pointer-events-auto active:scale-95 transition-all border border-white/20"
        >
          <Share2 size={24} />
        </button>
      </div>

      {/* Hero Image Section */}
      <div className="relative aspect-[4/5] sm:aspect-video w-full overflow-hidden sm:rounded-[3rem] sm:mt-4">
        <img 
          src={product.photos[activeImage]} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Image Indicators */}
        {product.photos.length > 1 && (
          <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
            {product.photos.map((_, i) => (
              <div 
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${i === activeImage ? 'w-8 bg-white' : 'w-2 bg-white/50'}`}
              />
            ))}
          </div>
        )}

        {/* Floating Status Badges */}
        <div className="absolute bottom-8 left-8 flex flex-col space-y-2">
          <div className="flex space-x-2">
            <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-white/30">
              {t(`filters.categories.${product.category}`)}
            </span>
            <span className="bg-primary-600/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-primary-500">
               {t(`filters.types.${product.listingType}`)}
            </span>
          </div>
          <h1 className="text-4xl font-black text-white font-heading tracking-tight drop-shadow-2xl">
            {product.name}
          </h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 sm:px-0 mt-8 max-w-4xl mx-auto space-y-10">
        
        {/* Header & Price */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-10">
          <div className="space-y-4 flex-1">
             <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-primary-600 font-bold bg-primary-50 px-3 py-1 rounded-lg text-sm">
                   <Clock size={16} />
                   <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-500 font-bold bg-gray-50 px-3 py-1 rounded-lg text-sm">
                   <ShieldCheck size={16} className="text-green-500" />
                   <span>{t('product.verifiedListing')}</span>
                </div>
             </div>
             
             <div className="flex items-baseline space-x-2">
                <span className="text-5xl font-black text-primary-900">
                  {product.listingType === 'sell' ? `Rs. ${product.price}` : product.listingType === 'free' ? t('product.free') : 'Exchange'}
                </span>
                <span className="text-gray-400 font-bold text-lg">/ {product.quantity} {product.unit}</span>
             </div>
             
             {product.listingType === 'exchange' && (
                <div className="bg-orange-50 border-2 border-orange-100 p-4 rounded-2xl">
                   <div className="text-orange-600 font-black uppercase tracking-widest text-[10px] mb-1">{t('product.exchangeFor')}</div>
                   <div className="text-orange-900 font-bold text-lg">{product.exchangePreference}</div>
                </div>
             )}
          </div>

          <div className="flex-shrink-0 flex flex-col gap-3">
             {(product.contactNumbers || [(product as any).contactNumber || '']).map((num, idx) => (
                <a 
                  key={idx}
                  href={`tel:${num}`}
                  className={`px-8 py-4 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center space-x-3 active:scale-95 group ${
                    idx === 0 ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-200' : 'bg-white border-2 border-primary-100 text-primary-600 hover:bg-primary-50'
                  }`}
                >
                   <Phone size={20} className="group-hover:rotate-12 transition-transform" />
                   <span className="text-lg">{idx === 0 ? t('product.callSeller') : `${t('product.callSeller')} 2`}</span>
                </a>
             ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4">
           <h3 className="text-xl font-black text-primary-900 uppercase tracking-widest flex items-center space-x-2">
              <ChevronRight size={24} className="text-primary-500" />
              <span>{t('product.description')}</span>
           </h3>
           <p className="text-gray-600 text-lg leading-relaxed font-medium whitespace-pre-wrap">
              {product.description}
           </p>
           
           {/* Tags */}
           {product.tags && product.tags.length > 0 && (
             <div className="flex flex-wrap gap-2 pt-4">
                {product.tags.map(tag => (
                  <Link 
                    key={tag}
                    to={`/home?search=%23${tag}`}
                    className="flex items-center space-x-1 bg-gray-50 hover:bg-primary-50 text-gray-500 hover:text-primary-600 px-4 py-2 rounded-xl transition-all border border-gray-100 font-bold"
                  >
                    <Tag size={16} />
                    <span>#{tag}</span>
                  </Link>
                ))}
             </div>
           )}
        </div>

        {/* Seller Profile Card */}
        <div className="bg-white rounded-[3rem] border-2 border-gray-100 p-8 shadow-sm space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">{t('profile.title')}</h3>
              <div className="flex items-center space-x-1 text-primary-600 font-black text-sm">
                 <MapPin size={18} />
                 <span>{distance} km {t('product.away')}</span>
              </div>
           </div>

           <Link 
             to={`/seller/${product.sellerId}`}
             className="flex items-center space-x-6 hover:bg-gray-50 p-4 -m-4 rounded-[2.5rem] transition-all group"
           >
              <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-primary-50 shadow-xl group-hover:border-primary-200 transition-all">
                 <img 
                   src={seller?.profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200'} 
                   className="w-full h-full object-cover" 
                   alt={product.sellerName}
                 />
              </div>
              <div className="space-y-1">
                 <h4 className="text-2xl font-black text-primary-900 leading-tight group-hover:text-primary-600 transition-colors">
                    {seller?.farmName || product.sellerName}
                 </h4>
                 <div className="flex items-center space-x-2 text-gray-400 font-bold text-sm">
                    <Calendar size={14} />
                    <span>Joined Dec 2023</span>
                 </div>
                 <div className="flex items-center space-x-1 text-green-600 font-black text-xs uppercase tracking-widest">
                    <ShieldCheck size={14} />
                    <span>{t('product.verifiedListing')}</span>
                 </div>
              </div>
           </Link>

           {seller?.bio && (
             <p className="text-gray-500 font-medium leading-relaxed italic border-l-4 border-primary-100 pl-4 py-1">
                "{seller.bio}"
             </p>
           )}

            <div className="grid grid-cols-1 gap-3">
              {(product.contactNumbers || [(product as any).contactNumber || '']).map((num, idx) => (
                <a 
                  key={idx}
                  href={`tel:${num}`}
                  className="flex items-center justify-center space-x-2 py-4 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold rounded-2xl transition-all active:scale-95"
                >
                   <Phone size={20} />
                   <span>{t('auth.phoneLabel')} {idx > 0 ? idx + 1 : ''}</span>
                </a>
              ))}
              <button 
                onClick={() => setIsMapModalOpen(true)}
                className="flex items-center justify-center space-x-2 py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-2xl transition-all active:scale-95"
              >
                 <MapPin size={20} className="text-primary-500" />
                 <span>{t('product.viewMap')}</span>
              </button>
            </div>
        </div>

      </div>

      {/* Floating Bottom Bar (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 pb-8 z-40 sm:hidden">
         <div className="flex items-center space-x-4 max-w-xl mx-auto">
            <div className="flex-1">
               <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('product.price')}</div>
               <div className="text-xl font-black text-primary-900">
                  {product.listingType === 'sell' ? `Rs. ${product.price}` : product.listingType === 'free' ? t('product.free') : 'Exchange'}
               </div>
            </div>
            <a 
               href={`tel:${product.contactNumbers?.[0] || (product as any).contactNumber || ''}`}
               className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-xl active:scale-95 transition-all flex-[2]"
            >
               <Phone size={20} />
               <span>{t('product.callSeller')}</span>
            </a>
         </div>
      </div>

      <MapModal 
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        lat={product.location.coordinates.lat}
        lng={product.location.coordinates.lng}
        title={product.name}
        locationName={product.location.city}
        buyerLat={userCoords?.lat}
        buyerLng={userCoords?.lng}
      />
    </div>
  );
};

export default ProductDetails;
