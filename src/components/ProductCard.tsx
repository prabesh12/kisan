import React from 'react';
import { MapPin, Calendar, ShoppingCart, Repeat, Gift } from 'lucide-react';
import type { Product } from '../features/products/productSlice';
import { calculateDistance, formatDistance } from '../utils/location';
import { useAppSelector } from '../hooks/redux';
import { useTranslation } from 'react-i18next';
import MapModal from './MapModal';
import { useState } from 'react';


interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { user } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();
  const [isMapOpen, setIsMapOpen] = useState(false);


  const distance = user?.location.coordinates
    ? calculateDistance(user.location.coordinates, product.location.coordinates)
    : null;

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
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full relative">
      {/* Top Image Section */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.photos[0] || 'https://via.placeholder.com/400'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* distance badge */}
        {distance !== null && (
          <button 
            onClick={() => setIsMapOpen(true)}
            className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-gray-800 shadow-sm flex items-center space-x-1 hover:bg-primary-50 transition-colors active:scale-95 group/pin"
          >
            <MapPin size={12} className="text-primary-600 group-hover/pin:translate-y-[-1px] transition-transform" />
            <span>{formatDistance(distance)} {t('product.away')}</span>
          </button>
        )}


        {/* listing type badge */}
        <div 
          className={`absolute bottom-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 border backdrop-blur-sm ${getBadgeStyles(product.listingType)}`}
        >
          {getBadgeIcon(product.listingType)}
          <span>{product.listingType === 'free' ? t('product.free') : product.listingType}</span>
        </div>
      </div>


      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-primary-900 group-hover:text-primary-600 transition-colors line-clamp-1 leading-tight">
            {product.name}
          </h3>
          <span className="text-[10px] bg-primary-50 text-primary-600 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
            {product.category}
          </span>
        </div>

        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed font-medium">
          {product.description}
        </p>

        <div className="pt-2 mt-auto border-t border-gray-50 flex justify-between items-center text-xs text-gray-400 font-medium">
          <div className="flex items-center space-x-1.5 overflow-hidden">
            <div className="w-5 h-5 bg-primary-100 rounded-full flex-shrink-0" />
            <span className="truncate max-w-[80px]">{product.sellerName}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar size={12} />
            <span>{new Date(product.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="pt-2">
          {product.listingType === 'sell' ? (
            <div className="text-xl font-bold text-primary-700">
              Rs. {product.price}
              <span className="text-xs text-gray-400 font-medium ml-1">/ {product.unit}</span>
            </div>
          ) : product.listingType === 'exchange' ? (
            <div className="text-sm font-bold text-blue-600 italic">
              {t('product.exchangeFor')} {product.exchangePreference}
            </div>
          ) : (
            <div className="text-lg font-black text-green-600 uppercase tracking-tighter">
              {t('product.free')}
            </div>
          )}
        </div>
      </div>

      <MapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        lat={product.location.coordinates.lat}
        lng={product.location.coordinates.lng}
        title={product.name}
        locationName={product.location.city}
      />
    </div>

  );
};

export default ProductCard;
