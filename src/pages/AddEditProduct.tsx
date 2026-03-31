import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, Save, AlertCircle, Trash2, ArrowLeft } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { addProduct, updateProduct, deleteProduct } from '../features/products/productSlice';
import type { Category, ListingType, Product } from '../features/products/productSlice';
import { validateContent } from '../utils/moderation';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import MapPicker from '../components/MapPicker';
import { useRef } from 'react';
import { savePersistentProduct, deletePersistentProduct } from '../utils/storage';



const AddEditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items } = useAppSelector((state) => state.products);
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);



  const isEditMode = !!id;
  const existingProduct = items.find((p) => p.id === id);

  const [formData, setFormData] = useState({
    name: '',
    category: 'vegetables' as Category,
    quantity: 1,
    unit: 'kg',
    listingType: 'sell' as ListingType,
    price: 0,
    exchangePreference: '',
    description: '',
    photos: [] as string[],
    city: '',
    coordinates: {
      lat: 27.7172,
      lng: 85.3240,
    }
  });


  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && existingProduct) {
      setFormData({
        name: existingProduct.name,
        category: existingProduct.category,
        quantity: existingProduct.quantity,
        unit: existingProduct.unit,
        listingType: existingProduct.listingType,
        price: existingProduct.price || 0,
        exchangePreference: existingProduct.exchangePreference || '',
        description: existingProduct.description,
        photos: existingProduct.photos,
        city: existingProduct.location.city,
        coordinates: existingProduct.location.coordinates,
      });
    } else if (user) {
      setFormData((prev) => ({ 
        ...prev, 
        city: user.location.city,
        coordinates: user.location.coordinates
      }));
    }
  }, [isEditMode, existingProduct, user]);


  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">{t('nav.login')}</h2>
        <button onClick={() => navigate('/login')} className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold">
          {t('nav.login')}
        </button>
      </div>
    );
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // 1. Content Moderation Check
      validateContent(formData.name, formData.description);

      // 2. Construct Product Object
      const productData: Product = {
        id: isEditMode ? id! : uuidv4(),
        sellerId: user.id,
        sellerName: user.name,
        name: formData.name,
        category: formData.category,
        photos: formData.photos.length > 0 ? formData.photos : ['https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400'],
        quantity: formData.quantity,
        unit: formData.unit,
        listingType: formData.listingType,
        price: formData.listingType === 'sell' ? formData.price : undefined,
        exchangePreference: formData.listingType === 'exchange' ? formData.exchangePreference : undefined,
        description: formData.description,
        location: {
          city: formData.city,
          coordinates: formData.coordinates,
        },

        createdAt: isEditMode && existingProduct ? existingProduct.createdAt : new Date().toISOString(),
      };

      // 3. Dispatch action and save to persistent storage
      if (isEditMode) {
        dispatch(updateProduct(productData));
      } else {
        dispatch(addProduct(productData));
      }
      savePersistentProduct(productData);


      // 4. Redirect
      navigate('/home');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (id && confirm(t('listings.deleteConfirm'))) {
      dispatch(deleteProduct(id));
      deletePersistentProduct(id);
      navigate('/home');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photos: [reader.result as string] });
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-3xl font-black font-heading text-primary-900 tracking-tight">
            {isEditMode ? t('product.editTitle') : t('product.addTitle')} <span className="text-primary-600">Product</span>
          </h2>
        </div>

        {isEditMode && (
          <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors border border-transparent hover:border-red-100">
            <Trash2 size={24} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        {error && (
          <div className="bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl flex items-start space-x-3 text-sm font-bold uppercase tracking-wide">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Photos Mockup */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 ml-1 mb-2 uppercase tracking-widest">{t('product.uploadPhoto')}</label>
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video bg-gray-50 border-4 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-gray-400 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-500 transition-all cursor-pointer group overflow-hidden relative"
            >
              {formData.photos.length > 0 ? (
                <>
                  <img src={formData.photos[0]} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold">
                    {t('product.uploadPhoto')}
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({ ...formData, photos: [] });
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-xl shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              ) : (
                <>
                  <Camera size={48} className="group-hover:scale-110 transition-transform" />
                  <span className="mt-2 font-bold">{t('product.tapToUpload')}</span>
                </>
              )}
            </div>
          </div>


          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 ml-1 mb-2 uppercase tracking-widest">{t('product.name') || 'Product Name'}</label>
            <input
              type="text"
              required
              placeholder={t('landing.features.marketplaceDesc')}
              value={formData.name}

              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400 font-bold"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 ml-1 mb-2 uppercase tracking-widest">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-bold"
            >
              <option value="vegetables">{t('filters.categories.vegetables')}</option>
              <option value="fruits">{t('filters.categories.fruits')}</option>
              <option value="meat">{t('filters.categories.meat')}</option>
              <option value="dairy">{t('filters.categories.dairy')}</option>
              <option value="grains">{t('filters.categories.grains')}</option>
              <option value="other">{t('filters.categories.other')}</option>
            </select>
          </div>


          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 ml-1 mb-2 uppercase tracking-widest">{t('product.quantity')}</label>

              <input
                type="number"
                min="0.1"
                step="0.1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-bold"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 ml-1 mb-2 uppercase tracking-widest">{t('product.unit')}</label>

              <input
                type="text"
                required
                placeholder="kg, lit..."
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-bold"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 ml-1 mb-2 uppercase tracking-widest">{t('product.listingType')}</label>
            <div className="grid grid-cols-3 gap-3">
              {(['sell', 'exchange', 'free'] as ListingType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, listingType: type })}
                  className={`py-4 rounded-2xl font-bold uppercase tracking-wider transition-all border-2 ${
                    formData.listingType === type 
                      ? 'bg-primary-600 border-primary-600 text-white shadow-lg' 
                      : 'bg-white border-gray-100 text-gray-500 hover:border-primary-200'
                  }`}
                >
                  {t(`filters.types.${type}`)}
                </button>
              ))}
            </div>
          </div>


          {formData.listingType === 'sell' && (
            <div className="md:col-span-2 animate-in slide-in-from-top-2">
              <label className="block text-sm font-bold text-gray-700 ml-1 mb-2 uppercase tracking-widest">{t('product.price')}</label>

              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-bold"
              />
            </div>
          )}

          {formData.listingType === 'exchange' && (
            <div className="md:col-span-2 animate-in slide-in-from-top-2">
              <label className="block text-sm font-bold text-gray-700 ml-1 mb-2 uppercase tracking-widest">{t('product.exchange')}</label>

              <input
                type="text"
                required
                placeholder="What do you want in return? (e.g. Rice, Potatoes)"
                value={formData.exchangePreference}
                onChange={(e) => setFormData({ ...formData, exchangePreference: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-bold"
              />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 ml-1 mb-2 uppercase tracking-widest">{t('product.description')}</label>
            <textarea
              required
              rows={4}
              placeholder={t('landing.subtitle')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400 font-bold resize-none"
            />
          </div>


          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 ml-1 mb-4 uppercase tracking-widest">{t('product.setLocation')}</label>
            <MapPicker 
              initialCenter={formData.coordinates}
              onLocationSelect={(lat, lng) => setFormData({ ...formData, coordinates: { lat, lng } })}
            />
          </div>
        </div>


        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-600 text-white font-bold py-6 rounded-3xl hover:bg-primary-700 shadow-2xl transition-all flex items-center justify-center space-x-2 text-xl active:scale-[0.98]"
        >
          {isSubmitting ? (
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save size={24} />
              <span>{isEditMode ? t('product.update') : t('product.publish')}</span>
            </>

          )}
        </button>
      </form>
    </div>
  );
};

export default AddEditProduct;
