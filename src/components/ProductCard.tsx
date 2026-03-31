import { MapPin, Calendar, ShoppingCart, Repeat, Gift, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      <Link to={`/product/${product.id}`} className="flex flex-col h-full">
        {/* Top Image Section */}

      <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.photos[0] || 'https://via.placeholder.com/400'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* distance badge */}
        {distance !== null && (
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
        <div 
          className={`absolute bottom-2.5 right-2.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5 border backdrop-blur-sm ${getBadgeStyles(product.listingType)}`}
        >
          {getBadgeIcon(product.listingType)}
          <span>{product.listingType === 'free' ? t('product.free') : product.listingType}</span>
        </div>
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
          <div className="flex items-center space-x-1.5 overflow-hidden">
            <div className="w-4 h-4 bg-primary-100 rounded-full flex-shrink-0" />
            <span className="truncate max-w-[60px] sm:max-w-[80px]">{product.sellerName}</span>
          </div>
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
            href={`tel:${product.contactNumber}`}
            onClick={(e) => e.stopPropagation()}
            className="p-2.5 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-600 hover:text-white transition-all shadow-sm active:scale-95"
            title="Call Seller"
          >
            <Phone size={18} />
          </a>
        </div>
      </div>
    </Link>



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
