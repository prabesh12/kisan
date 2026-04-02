import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import {
  MapPin,
  Phone,
  Calendar,
  Share2,
  ChevronRight,
  Tag,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ExternalLink,
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
  const { t } = useTranslation();

  const { items } = useAppSelector((state) => state.products);
  const { user: currentUser, guestLocation } = useAppSelector((state) => state.auth);

  const userCoords = currentUser?.location.coordinates || guestLocation;
  const product = items.find((p) => p.id === id);
  const seller = product ? findUserById(product.sellerId) : null;

  const [activeImage, setActiveImage] = useState(0);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

  useEffect(() => {
    if (id) dispatch(incrementProductViews(id));
    window.scrollTo(0, 0);
  }, [id, dispatch]);

  const distance = useMemo(() => {
    if (!product || !userCoords) return null;
    const R = 6371;
    const dLat = (product.location.coordinates.lat - userCoords.lat) * Math.PI / 180;
    const dLon = (product.location.coordinates.lng - userCoords.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userCoords.lat * Math.PI / 180) *
        Math.cos(product.location.coordinates.lat * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
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
      navigator.share({ title: product.name, text: product.description, url: window.location.href });
    }
  };

  const allContacts = product.contactNumbers?.length
    ? product.contactNumbers
    : [(product as any).contactNumber || ''];

  const listingBadge = {
    sell: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    free: 'bg-blue-50 text-blue-700 border-blue-200',
    exchange: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  }[product.listingType] ?? 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <PageTransition>
      {/* ── Desktop: two-column, Mobile: single-column stacked ── */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start -mx-4 -mt-6 lg:mx-0 lg:mt-0">

        {/* ── Image Gallery ── */}
        <div className="lg:sticky lg:top-20">
          {/* Main image */}
          <div className="relative aspect-[4/3] lg:aspect-square lg:rounded-2xl overflow-hidden bg-gray-100 group">
            <img
              src={product.photos[activeImage]}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.02] ${
                product.status === 'sold' ? 'grayscale opacity-70' : ''
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

            {/* Back + Share buttons */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="p-2.5 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full text-white transition-all active:scale-95"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleShare}
                className="p-2.5 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full text-white transition-all active:scale-95"
              >
                <Share2 size={18} />
              </button>
            </div>

            {/* Sold overlay */}
            {product.status === 'sold' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/95 px-5 py-2 rounded-full shadow-xl border-2 border-emerald-500 text-emerald-700 font-extrabold text-sm uppercase tracking-widest rotate-[-12deg] flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  {t('product.sold')}
                </div>
              </div>
            )}

            {/* Gallery arrows (desktop only) */}
            {product.photos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveImage(p => p === 0 ? product.photos.length - 1 : p - 1); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full text-white hidden lg:flex items-center justify-center transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveImage(p => p === product.photos.length - 1 ? 0 : p + 1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full text-white hidden lg:flex items-center justify-center transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Dot indicators */}
            {product.photos.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                {product.photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === activeImage ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {product.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-4 lg:px-0 py-3 no-scrollbar">
              {product.photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                    i === activeImage ? 'border-primary-500 shadow-md shadow-primary-100' : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <img src={photo} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right Column: Info + CTA + Details ── */}
        <div className="px-4 lg:px-0 pt-4 lg:pt-0 pb-28 space-y-3">

          {/* Product Identity */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              <span className="bg-primary-50 text-primary-700 border border-primary-200 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                {t(`filters.categories.${product.category}`)}
              </span>
              <span className={`border ${listingBadge} px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest`}>
                {t(`filters.types.${product.listingType}`)}
              </span>
            </div>
            <h1 className="text-xl font-black text-gray-900 leading-tight tracking-tight mb-2">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-primary-500" />
                {product.location.city}{distance ? `, ${distance} km away` : ''}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-orange-400" />
                {new Date(product.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Price + CTA */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              {t('product.price')}
            </p>
            {product.listingType === 'sell' ? (
              <div className="flex items-end gap-1 mb-2.5">
                <span className="text-xs font-black text-gray-400 mb-0.5">Rs</span>
                <span className="text-3xl font-black text-gray-900 leading-none">{product.price}</span>
                <span className="text-xs text-gray-400 font-bold mb-0.5">/ {product.unit}</span>
              </div>
            ) : (
              <div className="text-2xl font-black text-gray-900 mb-2.5">
                {product.listingType === 'free' ? t('product.free') : t('filters.types.exchange')}
              </div>
            )}

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-bold text-emerald-700 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {product.quantity} {product.unit} {t('product.available')}
            </div>

            {product.listingType === 'exchange' && product.exchangePreference && (
              <div className="mb-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                <p className="text-indigo-500 font-black uppercase tracking-widest text-[10px] mb-0.5">{t('product.exchangeFor')}</p>
                <p className="text-indigo-900 font-bold text-sm">{product.exchangePreference}</p>
              </div>
            )}

            {/* Call Seller Buttons */}
            <div className="space-y-2">
              {allContacts.map((num, idx) => (
                <a
                  key={idx}
                  href={`tel:${num}`}
                  className={`w-full py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 active:scale-95 group ${
                    idx === 0
                      ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-100'
                      : 'bg-white border-2 border-primary-100 text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <Phone size={16} className="group-hover:rotate-12 transition-transform flex-shrink-0" />
                  <span>{idx === 0 ? t('product.callSeller') : `${t('product.callSeller')} 2`}</span>
                  {num && <span className="opacity-60 text-xs">{num}</span>}
                </a>
              ))}
            </div>
          </div>

          {/* Description / Reviews Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100 px-4">
              {(['description', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative py-3 mr-5 text-xs font-black uppercase tracking-widest transition-colors ${
                    activeTab === tab ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab === 'description' ? t('product.description') : 'Reviews'}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
            <div className="px-4 py-4">
              {activeTab === 'description' ? (
                <div className="space-y-3">
                  <p className="text-gray-600 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                    {product.description}
                  </p>
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {product.tags.map(tag => (
                        <Link
                          key={tag}
                          to={`/home?search=%23${tag}`}
                          className="flex items-center gap-1 bg-gray-50 hover:bg-primary-50 text-gray-500 hover:text-primary-600 px-3 py-1.5 rounded-full text-xs border border-gray-100 font-bold transition-all"
                        >
                          <Tag size={10} />#{tag}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="text-3xl mb-2">💬</div>
                  <p className="text-gray-500 font-bold text-sm">No reviews yet</p>
                  <p className="text-gray-400 text-xs mt-1">Be the first to share your experience!</p>
                </div>
              )}
            </div>
          </div>

          {/* Seller Card */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Seller</h3>
              {distance && (
                <span className="flex items-center gap-1 text-xs text-primary-600 font-bold">
                  <MapPin size={11} />{distance} km away
                </span>
              )}
            </div>
            <Link to={`/seller/${product.sellerId}`} className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-100 flex-shrink-0 group-hover:border-primary-200 transition-all shadow-sm">
                <img
                  src={seller?.profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200'}
                  className="w-full h-full object-cover"
                  alt={product.sellerName}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                  {seller?.farmName || product.sellerName}
                </h4>
                <div className="flex items-center gap-2.5 mt-0.5">
                  <span className="flex items-center gap-1 text-gray-400 text-[11px]">
                    <Calendar size={10} />Joined Dec 2023
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 text-[11px] font-black">
                    <ShieldCheck size={10} />Verified
                  </span>
                </div>
              </div>
              <ExternalLink size={14} className="text-gray-300 group-hover:text-primary-400 transition-colors flex-shrink-0" />
            </Link>
            {seller?.bio && (
              <p className="mt-3 text-gray-500 text-xs font-medium leading-relaxed border-l-2 border-primary-100 pl-3 italic">
                "{seller.bio}"
              </p>
            )}
            <button
              onClick={() => setIsMapModalOpen(true)}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-bold rounded-xl transition-all active:scale-95 border border-gray-100"
            >
              <MapPin size={14} className="text-primary-500" />
              {t('product.viewMap')}
            </button>
          </div>

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
    </PageTransition>
  );
};

export default ProductDetails;
