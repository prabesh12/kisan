import React from 'react';
import { MapPin, Phone, Gift, Repeat, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Product } from '../features/products/productSlice';
import { useAppSelector } from '../hooks/redux';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, guestLocation } = useAppSelector((state) => state.auth);
  
  const userCoords = user?.location.coordinates || guestLocation;

  // Configuration for listing types - matching user snippet exact config
  const getListingConfig = (type: string) => {
    switch (type) {
      case 'free':
        return {
          label: t('filters.types.free'),
          icon: Gift,
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-700',
        };
      case 'exchange':
        return {
          label: t('filters.types.exchange'),
          icon: Repeat,
          bgColor: 'bg-indigo-100',
          textColor: 'text-indigo-700',
        };
      case 'sell':
      default:
        return {
          label: t('filters.types.sell') === 'Sell' ? 'For Sale' : t('filters.types.sell'),
          icon: ShoppingCart,
          bgColor: 'bg-emerald-100',
          textColor: 'text-emerald-700',
        };
    }
  };

  const config = getListingConfig(product.listingType);
  const Icon = config.icon;

  // Calculate distance for badge (matching snippet 'distance' var)
  const calculateDistanceKm = () => {
    if (!userCoords) return null;
    const R = 6371;
    const dLat = (product.location.coordinates.lat - userCoords.lat) * Math.PI / 180;
    const dLon = (product.location.coordinates.lng - userCoords.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userCoords.lat * Math.PI / 180) * Math.cos(product.location.coordinates.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const dist = (R * c).toFixed(1);
    return `${dist} km away`;
  };

  const distance = calculateDistanceKm();
  const dateAdded = (() => {
    try {
      const dateObj = new Date(Number(product.createdAt) || product.createdAt);
      return isNaN(dateObj.getTime()) ? t('common.recently') || 'Recently' : dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return t('common.recently') || 'Recently';
    }
  })();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative w-full overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-square bg-gray-100">
        <img
          src={product.photos[0] || 'https://via.placeholder.com/400'}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ${product.status === 'sold' ? 'grayscale opacity-80' : ''}`}
        />

        {/* Location Badge - Top Left */}
        {distance && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm z-10">
            <MapPin className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">{distance}</span>
          </div>
        )}

        {/* Listing Type Badge - Top Right */}
        <div
          className={`absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1.5 ${config.bgColor} rounded-lg shadow-sm z-10`}
        >
          <Icon className={`w-3.5 h-3.5 ${config.textColor}`} />
          <span className={`text-xs font-semibold ${config.textColor}`}>
            {config.label}
          </span>
        </div>

        {/* Sold Overlay */}
        {product.status === 'sold' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
            <div className="bg-white px-4 py-1.5 rounded-full shadow-lg border border-emerald-500 text-emerald-700 font-bold text-xs uppercase tracking-widest rotate-[-8deg]">
              {t('product.sold')}
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
          {product.name}
        </h3>

        {/* Seller & Location Info */}
        <div className="flex items-start gap-2.5">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
            {product.sellerName?.charAt(0).toUpperCase() || 'K'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{product.sellerName}</p>
            <p className="text-xs text-gray-500 line-clamp-1">{product.location.city}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100" />

        {/* Quantity & Date Added */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {t('product.quantity')}
            </span>
            <span className="text-sm font-bold text-gray-900">{product.quantity} {product.unit}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {t('product.posted')}
            </span>
            <span className="text-xs text-gray-600">{dateAdded}</span>
          </div>
        </div>

        {/* Price or Status */}
        <div className="pt-1 h-10 flex items-center">
          {product.listingType === 'sell' && product.price !== undefined ? (
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-semibold text-gray-600">₹</span>
              <span className="text-2xl font-bold text-emerald-600">{product.price}</span>
              <span className="text-xs text-gray-500">/{product.unit}</span>
            </div>
          ) : product.listingType === 'free' ? (
            <span className="text-lg font-bold text-purple-600">{t('product.free')}</span>
          ) : (
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-indigo-500 uppercase tracking-tight">{t('product.exchangeFor')}</span>
              <span className="text-sm font-bold text-indigo-600 line-clamp-1 truncate max-w-[200px]">{product.exchangePreference || t('filters.types.exchange')}</span>
            </div>
          )}
        </div>

        {/* Contact Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `tel:${product.contactNumbers?.[0] || (product as any).contactNumber || ''}`;
          }}
          className="w-full h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
        >
          <Phone className="w-4 h-4" />
          {t('product.callSeller')}
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
