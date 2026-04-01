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
        return 'bg-green-100 text-green-700 border-green-200';
      case 'exchange':
        return 'bg-blue-100 text-blue-700 border-blue-200';
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
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full relative"
    >
      {/* Manage Button (Owner Only) */}
      {isOwner && (
        <div className="absolute top-4 right-4 z-20" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowManageMenu(!showManageMenu);
            }}
            className="p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 text-gray-600 hover:text-primary-600 transition-colors active:scale-90"
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
                    {product.status === 'sold' ? 'Mark Active' : 'Mark Sold'}
                  </span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/edit-product/${product.id}`); }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <Edit2 size={18} className="text-blue-500" />
                  <span className="text-sm font-bold text-gray-700">Edit Product</span>
                </button>
                <div className="h-px bg-gray-50 my-1 mx-2" />
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} className="text-red-500" />
                  <span className="text-sm font-bold text-red-600">Delete Listing</span>
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
             <div className="absolute inset-0 bg-black/20 flex items-center justify-center p-6">
                <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-2xl border-2 border-green-600 text-green-700 font-black text-xs uppercase tracking-[0.2em] rotate-[-12deg] flex items-center space-x-2">
                   <CheckCircle2 size={12} />
                   <span>Sold</span>
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
              className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-full text-[10px] sm:text-xs font-bold text-gray-800 shadow-sm flex items-center space-x-1 hover:bg-primary-50 transition-colors active:scale-95 group/pin z-10"
            >
              <MapPin size={11} className="text-primary-600" />
              <span>{formatDistance(distance)} {t('product.away')}</span>
            </button>
          )}

          {/* listing type badge */}
          {!isOwner && (
            <div 
              className={`absolute bottom-2.5 right-2.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5 border backdrop-blur-sm ${getBadgeStyles(product.listingType)}`}
            >
              {getBadgeIcon(product.listingType)}
              <span>{product.listingType === 'free' ? t('product.free') : product.listingType}</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-5 flex flex-col flex-1 space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="text-base sm:text-lg font-bold text-primary-900 group-hover:text-primary-600 transition-colors line-clamp-1 leading-tight">
              {product.name}
            </h3>
            <span className="text-[9px] bg-primary-50 text-primary-600 font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
              {product.category}
            </span>
          </div>

          <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 leading-relaxed font-medium">
            {product.description}
          </p>

          <div className="pt-2 mt-auto border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-400 font-medium">
            <Link 
              to={`/seller/${product.sellerId}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center space-x-1.5 overflow-hidden hover:text-primary-600 transition-colors"
            >
              <div className="w-4 h-4 bg-primary-100 rounded-full flex-shrink-0" />
              <span className="truncate max-w-[60px] sm:max-w-[80px]">{product.sellerName}</span>
            </Link>
            <div className="flex items-center space-x-1">
              <Calendar size={11} />
              <span>{new Date(product.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {product.listingType === 'sell' ? (
              <div className="text-lg sm:text-xl font-bold text-primary-700">
                Rs. {product.price}
                <span className="text-[10px] sm:text-xs text-gray-400 font-medium ml-1">/ {product.unit}</span>
              </div>
            ) : product.listingType === 'exchange' ? (
              <div className="text-xs sm:text-sm font-bold text-blue-600 italic">
                 {product.exchangePreference}
              </div>
            ) : (
              <div className="text-base sm:text-lg font-black text-green-600 uppercase tracking-tighter">
                {t('product.free')}
              </div>
            )}

            <a 
              href={`tel:${product.contactNumbers?.[0] || (product as any).contactNumber || ''}`}
              onClick={(e) => e.stopPropagation()}
              className="p-2.5 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-600 hover:text-white transition-all shadow-sm active:scale-95"
              title="Call Seller"
            >
              <Phone size={18} />
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
