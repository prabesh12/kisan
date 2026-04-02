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
import PageTransition from '../components/PageTransition';
import { CheckCircle2 } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

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
        <h2 className="text-2xl font-bold text-gray-900">{t('product.notFound')}</h2>
        <button onClick={() => navigate('/home')} className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold">
          {t('nav.home')}
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
    <PageTransition>
      <div className="pb-32">
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

      {/* Hero Section - Two Column on Desktop */}
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 sm:mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
          
          {/* Left: Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/3] sm:rounded-3xl overflow-hidden shadow-2xl bg-gray-100 group">
              <img 
                src={product.photos[activeImage]} 
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${product.status === 'sold' ? 'grayscale opacity-80' : ''}`}
              />
              
              {/* Sold Overlay */}
              {product.status === 'sold' && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-12 z-20">
                   <div className="bg-white px-8 py-3 rounded-full shadow-2xl border-4 border-emerald-600 text-emerald-700 font-extrabold text-2xl uppercase tracking-[0.3em] rotate-[-12deg] flex items-center space-x-3">
                      <CheckCircle2 size={24} />
                      <span>{t('product.sold')}</span>
                   </div>
                </div>
              )}

              {/* Navigation Arrows for Gallery */}
              {product.photos.length > 1 && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveImage(prev => prev === 0 ? product.photos.length - 1 : prev - 1); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100 hidden sm:block"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveImage(prev => prev === product.photos.length - 1 ? 0 : prev + 1); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100 hidden sm:block"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              
              {/* Image Indicators */}
              {product.photos.length > 1 && (
                <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
                  {product.photos.map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === activeImage ? 'w-8 bg-white' : 'w-4 bg-white/40'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {product.photos.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 px-4 sm:px-0 scrollbar-hide">
                {product.photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${i === activeImage ? 'border-primary-600 scale-95 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={photo} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info & Actions */}
          <div className="lg:col-span-5 px-6 lg:px-0 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  {t(`filters.categories.${product.category}`)}
                </span>
                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  {t(`filters.types.${product.listingType}`)}
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 text-gray-500 font-bold text-sm">
                <div className="flex items-center gap-1">
                  <MapPin size={16} className="text-primary-500" />
                  <span>{product.location.city}, {distance}km {t('product.away')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={16} className="text-orange-500" />
                  <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-3xl space-y-6">
              <div className="space-y-1">
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('product.price')}</div>
                <div className="text-5xl font-black text-gray-900 leading-none">
                  {product.listingType === 'sell' ? (
                    <>
                      <span className="text-2xl mr-1">Rs</span>{product.price}
                      <span className="text-xl text-gray-400 font-bold ml-2">/ {product.unit}</span>
                    </>
                  ) : product.listingType === 'free' ? t('product.free') : t('filters.types.exchange')}
                </div>
                <div className="inline-flex items-center gap-1.5 mt-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold text-gray-700 border border-gray-100 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {product.quantity} {product.unit} {t('product.available')}
                </div>
              </div>

              {product.listingType === 'exchange' && (
                <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm">
                   <div className="text-indigo-600 font-black uppercase tracking-widest text-[10px] mb-1">{t('product.exchangeFor')}</div>
                   <div className="text-indigo-900 font-bold text-lg">{product.exchangePreference}</div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                {(product.contactNumbers || [(product as any).contactNumber || '']).map((num, idx) => (
                  <a 
                    key={idx}
                    href={`tel:${num}`}
                    className={`w-full py-5 rounded-2xl font-black text-xl transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 group ${
                      idx === 0 ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-200' : 'bg-white border-2 border-primary-100 text-primary-600 hover:bg-primary-50 shadow-none'
                    }`}
                  >
                    <Phone size={24} className="group-hover:rotate-12 transition-transform" />
                    <span>{idx === 0 ? t('product.callSeller') : `${t('product.callSeller')} 2`}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-16">
        <div className="border-b border-gray-100 flex gap-8 px-6 sm:px-0">
          <button 
            onClick={() => setActiveTab('description')}
            className={`pb-4 text-xl font-black uppercase tracking-widest transition-all relative ${activeTab === 'description' ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {t('product.description')}
            {activeTab === 'description' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-xl font-black uppercase tracking-widest transition-all relative ${activeTab === 'reviews' ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Reviews
            {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full" />}
          </button>
        </div>

        <div className="py-10 px-6 sm:px-0">
          {activeTab === 'description' ? (
            <div className="max-w-4xl space-y-8">
              <p className="text-gray-600 text-xl leading-relaxed font-medium whitespace-pre-wrap">
                {product.description}
              </p>
              
              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-4">
                   {product.tags.map(tag => (
                     <Link 
                       key={tag}
                       to={`/home?search=%23${tag}`}
                       className="flex items-center gap-2 bg-gray-50 hover:bg-primary-50 text-gray-500 hover:text-primary-600 px-5 py-2.5 rounded-2xl transition-all border border-gray-100 font-bold"
                     >
                       <Tag size={18} />
                       <span>#{tag}</span>
                     </Link>
                   ))}
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-4xl py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
               <div className="text-gray-400 font-bold text-lg">No reviews yet for this product.</div>
               <p className="text-gray-400 text-sm mt-1">Be the first to share your experience after purchasing!</p>
            </div>
          )}
        </div>
      </div>

      {/* Seller Profile Card - Standard Width */}
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 mt-10">
           <div className="flex items-center justify-between">
              <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">{t('profile.title')}</h3>
              <div className="flex items-center space-x-1 text-primary-600 font-black text-sm">
                 <MapPin size={18} />
                 <span>{distance} km {t('product.away')}</span>
              </div>
           </div>

           <Link 
             to={`/seller/${product.sellerId}`}
             className="flex items-center space-x-6 hover:bg-gray-50 p-4 -m-4 rounded-xl transition-all group"
           >
              <div className="w-24 h-24 rounded-xl overflow-hidden border-4 border-primary-50 shadow-xl group-hover:border-primary-200 transition-all">
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
                  className="flex items-center justify-center space-x-2 py-4 bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold rounded-xl transition-all active:scale-95"
                >
                   <Phone size={20} />
                   <span>{t('auth.phoneLabel')} {idx > 0 ? idx + 1 : ''}</span>
                </a>
              ))}
              <button 
                onClick={() => setIsMapModalOpen(true)}
                className="flex items-center justify-center space-x-2 py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-all active:scale-95"
              >
                 <MapPin size={20} className="text-primary-500" />
                 <span>{t('product.viewMap')}</span>
              </button>
            </div>
        </div>


      {/* Floating Bottom Bar (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 pb-8 z-40 sm:hidden">
         <div className="flex items-center space-x-4 max-w-xl mx-auto">
            <div className="flex-1">
               <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('product.price')}</div>
               <div className="text-xl font-black text-primary-900 leading-none">
                  {product.listingType === 'sell' ? `Rs. ${product.price}` : product.listingType === 'free' ? t('product.free') : t('filters.types.exchange')}
                  <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-tighter">
                     / {product.unit} ({product.quantity} {t('product.available')})
                  </div>
               </div>
            </div>
            <a 
               href={`tel:${product.contactNumbers?.[0] || (product as any).contactNumber || ''}`}
               className="bg-primary-600 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-xl active:scale-95 transition-all flex-[2]"
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
    </PageTransition>
  );
};

export default ProductDetails;
