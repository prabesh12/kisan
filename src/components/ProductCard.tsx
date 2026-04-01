import { MapPin, Calendar, ShoppingCart, Repeat, Gift, Phone, MoreVertical, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import type { Product } from '../features/products/productSlice';
import { calculateDistance, formatDistance } from '../utils/location';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { useTranslation } from 'react-i18next';
import MapModal from './MapModal';
import { useState, useRef, useEffect } from 'react';
import { setSoldStatus, deleteProduct } from '../features/products/productSlice';
import { savePersistentProduct, deletePersistentProduct } from '../utils/storage';


interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { user, guestLocation } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [showManageMenu, setShowManageMenu] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = user?.id === product.sellerId;
  const userCoords = user?.location.coordinates || guestLocation;

  const distance = userCoords
    ? calculateDistance(userCoords, product.location.coordinates)
    : null;

  // Handle clicking outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowManageMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleSold = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = product.status === 'active' ? 'sold' : 'active';
    dispatch(setSoldStatus({ id: product.id, status: newStatus }));
    savePersistentProduct({ ...product, status: newStatus });
    setShowManageMenu(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t('common.confirmDelete') || 'Are you sure you want to delete this listing?')) {
      dispatch(deleteProduct(product.id));
      deletePersistentProduct(product.id);
    }
    setShowManageMenu(false);
  };

  const getBadgeStyles = (type: string) => {
    switch (type) {
      case 'free':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'exchange':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'sell':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'free':
        return <Gift size={14} />;
      case 'exchange':
        return <Repeat size={14} />;
      case 'sell':
        return <ShoppingCart size={14} />;
      default:
        return null;
    }
  };

  return (
    <motion.div 
      layout
      whileHover={{ y: -8, scale: 1.01 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(34,197,94,0.12)] transition-all duration-500 border border-gray-100 flex flex-col h-full relative"
    >
      {/* Manage Button (Owner Only) */}
      {isOwner && (
        <div className="absolute top-4 right-4 z-20" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowManageMenu(!showManageMenu);
            }}
            className="p-2.5 bg-white rounded-2xl shadow-xl border border-gray-100 text-gray-600 hover:text-primary-600 transition-all active:scale-90 flex items-center justify-center"
          >
            <MoreVertical size={20} />
          </button>

          <AnimatePresence>
            {showManageMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 overflow-hidden z-30"
              >
                <button
                  onClick={handleToggleSold}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl hover:bg-primary-50 transition-colors"
                >
                  <CheckCircle2 size={18} className={product.status === 'sold' ? 'text-green-500' : 'text-gray-400'} />
                  <span className="text-sm font-bold text-gray-700">
                    {product.status === 'sold' ? t('listings.markActive') : t('listings.markAsSold')}
                  </span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/edit-product/${product.id}`); }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <Edit2 size={18} className="text-blue-500" />
                  <span className="text-sm font-bold text-gray-700">{t('listings.editProduct')}</span>
                </button>
                <div className="h-px bg-gray-50 my-1 mx-2" />
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} className="text-red-500" />
                  <span className="text-sm font-bold text-red-600">{t('listings.deleteListing')}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div 
        onClick={() => navigate(`/product/${product.id}`)} 
        className="flex flex-col h-full cursor-pointer"
      >
        {/* Top Image Section */}
        <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.photos[0] || 'https://via.placeholder.com/400'}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${product.status === 'sold' ? 'grayscale opacity-80' : ''}`}
          />
          
          {/* Sold Overlay */}
          {product.status === 'sold' && (
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6 z-10">
                <div className="bg-white px-5 py-2 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.2)] border-2 border-emerald-500 text-emerald-700 font-extrabold text-xs uppercase tracking-[0.25em] rotate-[-8deg] flex items-center space-x-2 animate-in zoom-in-50 duration-300">
                   <CheckCircle2 size={14} className="animate-pulse" />
                   <span>{t('product.sold')}</span>
                </div>
             </div>
          )}

          {/* distance badge */}
          {distance !== null && product.status !== 'sold' && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMapOpen(true);
              }}
              className="absolute top-3 left-3 bg-white px-3 py-2 rounded-full text-[10px] sm:text-xs font-bold text-gray-800 shadow-xl flex items-center space-x-1.5 hover:bg-gray-50 hover:scale-105 transition-all active:scale-95 group/pin z-10 border border-gray-100"
            >
              <MapPin size={12} className="text-emerald-600" />
              <span>{formatDistance(distance)} {t('product.away')}</span>
            </button>
          )}

          {/* listing type badge */}
          <div 
            className={`absolute bottom-3 right-3 px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center space-x-2 border shadow-lg ${getBadgeStyles(product.listingType)}`}
          >
            {getBadgeIcon(product.listingType)}
            <span>{t(`filters.types.${product.listingType}`)}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-1 space-y-4">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-lg font-black text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1 leading-tight tracking-tight">
              {product.name}
            </h3>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-1 rounded-lg uppercase tracking-widest border border-emerald-100 flex-shrink-0">
              {product.category}
            </span>
          </div>

          <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 leading-relaxed font-medium">
            {product.description}
          </p>

          <div className="pt-3 mt-auto border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            <Link 
              to={`/seller/${product.sellerId}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center space-x-2 overflow-hidden hover:text-emerald-600 transition-colors"
            >
              <div className="w-5 h-5 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 flex-shrink-0">
                 <Calendar size={10} />
              </div>
              <span className="truncate max-w-[80px]">{product.sellerName}</span>
            </Link>
            <div className="flex items-center space-x-1.5">
              <Calendar size={11} className="text-gray-300" />
              <span>{new Date(product.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-4">
            {product.listingType === 'sell' ? (
              <div className="flex flex-col">
                <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-0.5 ml-0.5">
                   {t('product.quantity')}: <span className="text-gray-600">{product.quantity} {product.unit}</span>
                </div>
                <div className="text-2xl font-black text-gray-900 flex items-baseline">
                  <span className="text-sm font-bold text-emerald-600 mr-1">Rs.</span>
                  {product.price}
                  <span className="text-xs text-gray-400 font-bold ml-1 uppercase tracking-tighter">
                     / {product.unit}
                  </span>
                </div>
              </div>
            ) : product.listingType === 'exchange' ? (
              <div className="flex items-center space-x-2 text-xs font-black text-indigo-600 uppercase tracking-tight bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100">
                 <Repeat size={14} />
                 <span>{product.exchangePreference}</span>
              </div>
            ) : (
              <div className="text-lg font-black text-emerald-600 uppercase tracking-widest flex items-center space-x-2">
                 <Gift size={20} />
                 <span>{t('product.free')}</span>
              </div>
            )}

            <a 
              href={`tel:${product.contactNumbers?.[0] || (product as any).contactNumber || ''}`}
              onClick={(e) => e.stopPropagation()}
              className="p-3.5 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:scale-110 active:scale-95 transition-all duration-300"
              title={t('product.callSeller')}
            >
              <Phone size={20} />
            </a>
          </div>
        </div>
      </div>

      <MapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        lat={product.location.coordinates.lat}
        lng={product.location.coordinates.lng}
        title={product.name}
        locationName={product.location.city}
        buyerLat={userCoords?.lat}
        buyerLng={userCoords?.lng}
      />
    </motion.div>
  );
};

export default ProductCard;
