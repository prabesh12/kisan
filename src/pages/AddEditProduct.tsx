import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, Save, AlertCircle, Trash2, ArrowLeft, Scale, Package } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { addProduct, updateProduct, deleteProduct } from '../features/products/productSlice';
import type { Category, ListingType, Product } from '../features/products/productSlice';
import { validateContent } from '../utils/moderation';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import MapPicker from '../components/MapPicker';
import { useRef } from 'react';
import { savePersistentProduct, deletePersistentProduct } from '../utils/storage';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PageTransition from '../components/PageTransition';
import { gql } from '@apollo/client/core/index.js';
import { useMutation, useQuery } from '@apollo/client/react/index.js';
import { toast } from 'react-hot-toast';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit for raw file before compression
const COMPRESSED_MAX_SIZE = 1024; // Max width/height for main photo
const THUMBNAIL_MAX_SIZE = 300; // Max width/height for feed thumbnail
const COMPRESSED_QUALITY = 0.7; // JPEG quality

const compressImage = (file: File, maxSize: number, quality: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct(
    $name: String!
    $description: String!
    $price: Float!
    $quantity: Float!
    $unit: String!
    $category: String!
    $listingType: String!
    $exchangePreference: String
    $contactNumbers: [String!]!
    $photos: [String!]!
    $thumbnail: String
    $location: LocationInput!
  ) {
    createProduct(
      name: $name
      description: $description
      price: $price
      quantity: $quantity
      unit: $unit
      category: $category
      listingType: $listingType
      exchangePreference: $exchangePreference
      contactNumbers: $contactNumbers
      photos: $photos
      thumbnail: $thumbnail
      location: $location
    ) {
      id
      name
    }
  }
`;

const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct(
    $id: ID!
    $name: String
    $description: String
    $price: Float
    $quantity: Float
    $unit: String
    $category: String
    $listingType: String
    $exchangePreference: String
    $contactNumbers: [String!]
    $photos: [String!]
    $thumbnail: String
    $location: LocationInput
    $status: String
  ) {
    updateProduct(
      id: $id
      name: $name
      description: $description
      price: $price
      quantity: $quantity
      unit: $unit
      category: $category
      listingType: $listingType
      exchangePreference: $exchangePreference
      contactNumbers: $contactNumbers
      photos: $photos
      thumbnail: $thumbnail
      location: $location
      status: $status
    ) {
      id
      name
    }
  }
`;

const GET_PRODUCT_QUERY = gql`
  query GetProduct($id: ID!) {
    getProduct(id: $id) {
      id
      name
      description
      price
      quantity
      unit
      category
      listingType
      exchangePreference
      contactNumbers
      photos
      thumbnail
      location {
        city
        coordinates {
          lat
          lng
        }
      }
      status
    }
  }
`;

interface GetProductData {
  getProduct: any;
}

const phoneRegex = /^9\d{9}$/;

const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  category: z.enum(['vegetables', 'fruits', 'meat', 'dairy', 'grains', 'other'] as const),
  quantity: z.number().positive("Quantity must be greater than zero"),
  unit: z.string().min(1, "Unit is required"),
  listingType: z.enum(['sell', 'exchange', 'free'] as const),
  price: z.number().optional(),
  exchangePreference: z.string().optional(),
  description: z.string().min(10, "Description should be at least 10 characters"),
  contactNumbers: z.array(z.string().regex(phoneRegex, "Must be 10 digits starting with 9")).min(2, "At least two contact numbers are required"),
  city: z.string().min(1, "City is required"),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  photos: z.array(z.string()).optional(),
}).refine((data) => {
  if (data.listingType === 'sell' && (!data.price || data.price <= 0)) {
    return false;
  }
  return true;
}, {
  message: "Price is required for selling items",
  path: ["price"]
}).refine((data) => {
  if (data.listingType === 'exchange' && (!data.exchangePreference || data.exchangePreference.length < 3)) {
    return false;
  }
  return true;
}, {
  message: "Exchange preference is required",
  path: ["exchangePreference"]
});

type ProductFormData = z.infer<typeof productSchema>;





const AddEditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items } = useAppSelector((state) => state.products);
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [thumbnail, setThumbnail] = useState<string>('');
  const [serverError, setServerError] = useState<string | null>(null);

  // 1. Fetch full data if in Edit mode (on-demand fetch)
  const { data: fetchedData, loading: fetchLoading } = useQuery<GetProductData>(GET_PRODUCT_QUERY, {
    variables: { id },
    skip: !isEditMode,
  });

  // 2. Derive base product (fetched data > Redux fallback)
  const existingProduct = fetchedData?.getProduct || items.find((p) => p.id === id);

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: 'vegetables',
      quantity: 1,
      unit: 'kg',
      listingType: 'sell',
      price: 0,
      exchangePreference: '',
      description: '',
      contactNumbers: ['', ''],
      city: user?.location?.city || '',
      coordinates: user?.location?.coordinates || { lat: 27.7172, lng: 85.3240 },
      photos: [],
    }
  });

  const [createProduct] = useMutation(CREATE_PRODUCT_MUTATION, {
    refetchQueries: ['GetProducts'],
    awaitRefetchQueries: true,
  });

  const [updateProductMutation] = useMutation(UPDATE_PRODUCT_MUTATION, {
    refetchQueries: ['GetProducts'],
    awaitRefetchQueries: true,
  });

  const listingType = watch('listingType');

  // Avoid re-resetting if we already have the full data
  const [hasReset, setHasReset] = useState(false);

  useEffect(() => {
    if (isEditMode && existingProduct && !hasReset) {
      // Only reset the form once when the full data arrives (or fallback)
      const data: any = {
        name: existingProduct.name,
        category: existingProduct.category,
        quantity: existingProduct.quantity,
        unit: existingProduct.unit,
        listingType: existingProduct.listingType,
        price: existingProduct.price || 0,
        exchangePreference: existingProduct.exchangePreference || '',
        description: existingProduct.description,
        city: existingProduct.location?.city || '',
        coordinates: existingProduct.location?.coordinates || { lat: 27.7172, lng: 85.3240 },
        contactNumbers: [
          existingProduct.contactNumbers?.[0] || '',
          existingProduct.contactNumbers?.[1] || ''
        ],
        photos: existingProduct.photos || [],
      };
      reset(data);
      if (existingProduct.photos?.length) {
        setPhotos(existingProduct.photos);
      }
      if (existingProduct.thumbnail) {
        setThumbnail(existingProduct.thumbnail);
      }
      
      // If we have full photos array, we consider it a complete reset
      if (existingProduct.photos?.length) {
        setHasReset(true);
      }
    } else if (user && !isEditMode) {
      if (user.location?.city) setValue('city', user.location.city);
      if (user.location?.coordinates) setValue('coordinates', user.location.coordinates);
      if (user.phone) setValue('contactNumbers.0', user.phone);
    }
  }, [isEditMode, existingProduct, user, reset, setValue]);



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


  if (isEditMode && fetchLoading && !existingProduct) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  const onSubmit = async (data: ProductFormData) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      // 1. Content Moderation Check
      validateContent(data.name, data.description);

      // 2. Execute Mutation
      if (isEditMode && id) {
        await updateProductMutation({
          variables: {
            id,
            name: data.name,
            description: data.description,
            price: data.price,
            quantity: data.quantity,
            unit: data.unit,
            category: data.category,
            listingType: data.listingType,
            exchangePreference: data.exchangePreference,
            contactNumbers: data.contactNumbers,
            photos: photos.length > 0 ? photos : existingProduct!.photos,
            thumbnail: thumbnail || existingProduct!.thumbnail,
            location: {
              city: data.city,
              coordinates: data.coordinates
            },
            status: (existingProduct as any)?.status || 'active'
          }
        });
      } else {
        await createProduct({
          variables: {
            name: data.name,
            description: data.description,
            price: data.price || 0,
            quantity: data.quantity,
            unit: data.unit,
            category: data.category,
            listingType: data.listingType,
            exchangePreference: data.exchangePreference,
            contactNumbers: data.contactNumbers,
            photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400'],
            thumbnail: thumbnail,
            location: {
              city: data.city,
              coordinates: data.coordinates
            }
          }
        });
      }

      // 4. Redirect
      toast.success(isEditMode ? t('product.updateSuccess') || 'Product updated!' : t('product.publishSuccess') || 'Product published successfully!');
      navigate('/home');
    } catch (err: any) {
      const errorMessage = err.message.includes('413')
        ? "This photo is too large for the internet! Please try a smaller file or a screenshot (under 4MB)."
        : err.graphQLErrors?.[0]?.message || err.message;

      setServerError(errorMessage);
      toast.error(errorMessage);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("This photo is too heavy! Please pick a smaller image (less than 10MB).");
        e.target.value = ''; // Reset input
        return;
      }

      const loadingToast = toast.loading("Processing photo...");
      try {
        const [mainPhoto, thumbPhoto] = await Promise.all([
          compressImage(file, COMPRESSED_MAX_SIZE, COMPRESSED_QUALITY),
          compressImage(file, THUMBNAIL_MAX_SIZE, 0.6)
        ]);
        setPhotos([mainPhoto]);
        setThumbnail(thumbPhoto);
        toast.success("Photo optimized!", { id: loadingToast });
      } catch (err) {
        toast.error("Failed to process photo.", { id: loadingToast });
      }
    }
  };


  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto pt-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-3xl font-black font-heading text-primary-900 tracking-tight">
              {isEditMode ? t('product.editTitle') : t('product.addTitle')} <span className="text-primary-600">{t('nav.add')}</span>
            </h2>
          </div>

          {isEditMode && (
            <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors border border-transparent hover:border-red-100">
              <Trash2 size={24} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          {(serverError || Object.keys(errors).length > 0) && (
            <div className="bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl flex flex-col space-y-2">
              {serverError && (
                <div className="flex items-start space-x-3 text-sm font-bold uppercase tracking-wide">
                  <AlertCircle size={20} className="flex-shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}
              {Object.entries(errors).map(([key, error]) => (
                <div key={key} className="flex items-start space-x-3 text-xs font-bold text-red-500">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{(error as any).message}</span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                className="aspect-video bg-gray-50 border-4 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-500 transition-all cursor-pointer group overflow-hidden relative"
              >
                {photos.length > 0 ? (
                  <>
                    <img src={photos[0]} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold">
                      {t('product.uploadPhoto')}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotos([]);
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
                placeholder={t('landing.features.marketplaceDesc')}
                {...register('name')}
                className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400 font-bold ${errors.name ? 'border-red-500' : 'border-gray-100'
                  }`}
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-gray-700 ml-1 mb-2 uppercase tracking-widest">{t('product.category')}</label>
              <select
                {...register('category')}
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


            {/* Enhanced Quantity & Unit Section */}
            <div className="md:col-span-2 bg-primary-50/30 p-6 rounded-2xl border border-primary-100/50 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-primary-700 ml-1 uppercase tracking-[0.2em] flex items-center space-x-2">
                  <Scale size={14} />
                  <span>{t('product.quantityDetails')}</span>
                </label>
                <div className="flex items-center space-x-2 text-[10px] text-primary-600/60 font-bold uppercase tracking-tighter">
                  <Package size={12} />
                  <span>{t('product.totalStock')}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase ml-1">{t('product.amount')}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    {...register('quantity', { valueAsNumber: true })}
                    className={`w-full px-5 py-4 bg-white border-2 rounded-xl shadow-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-black text-xl text-primary-900 ${errors.quantity ? 'border-red-500' : 'border-primary-100'
                      }`}
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase ml-1">{t('product.unit')}</span>
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder={t('product.unitPlaceholder')}
                      {...register('unit')}
                      className={`w-full px-5 py-4 bg-white border-2 rounded-xl shadow-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300 ${errors.unit ? 'border-red-500' : 'border-primary-100'
                        }`}
                    />
                  </div>
                </div>
              </div>

              {/* Unit suggestions */}
              <div className="pt-2">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-3 ml-1 tracking-widest">{t('product.commonUnits')}</p>
                <div className="flex flex-wrap gap-2">
                  {['kg', 'gm', 'quintal', 'ltr', 'bunch', 'piece', 'dozen'].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setValue('unit', u)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border-2 ${watch('unit') === u
                          ? 'bg-primary-600 border-primary-600 text-white shadow-md scale-105'
                          : 'bg-white border-gray-100 text-gray-500 hover:border-primary-200 hover:text-primary-600'
                        }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 ml-1 mb-2 uppercase tracking-widest">{t('product.listingType')}</label>
              <div className="grid grid-cols-3 gap-3">
                {(['sell', 'exchange', 'free'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setValue('listingType', type)}
                    className={`py-3 rounded-xl font-bold uppercase tracking-wider transition-all border-2 text-xs ${listingType === type
                        ? 'bg-primary-600 border-primary-600 text-white shadow-lg'
                        : 'bg-white border-gray-100 text-gray-500 hover:border-primary-200'
                      }`}
                  >
                    {t(`filters.types.${type}`)}
                  </button>
                ))}
              </div>
            </div>


            {listingType === 'sell' && (
              <div className="md:col-span-2 animate-in slide-in-from-top-2">
                <label className="block text-sm font-bold text-gray-700 ml-1 mb-2 uppercase tracking-widest">{t('product.price')}</label>

                <input
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-bold ${errors.price ? 'border-red-500' : 'border-gray-100'
                    }`}
                />
              </div>
            )}

            {listingType === 'exchange' && (
              <div className="md:col-span-2 animate-in slide-in-from-top-2">
                <label className="block text-sm font-bold text-gray-700 ml-1 mb-2 uppercase tracking-widest">{t('product.exchange')}</label>

                <input
                  type="text"
                  placeholder={t('product.exchangePlaceholder')}
                  {...register('exchangePreference')}
                  className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all font-bold ${errors.exchangePreference ? 'border-red-500' : 'border-gray-100'
                    }`}
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 ml-1 mb-2 uppercase tracking-widest">{t('product.description')}</label>
              <textarea
                rows={4}
                placeholder={`${t('landing.subtitle')} #organic #fresh #kathmandu`}
                {...register('description')}
                className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400 font-bold resize-none ${errors.description ? 'border-red-500' : 'border-gray-100'
                  }`}
              />
            </div>

            <div className="md:col-span-2 border-t border-gray-50 pt-8">
              <label className="block text-sm font-bold text-gray-700 ml-1 mb-4 uppercase tracking-widest">
                {t('product.contactPrimary')}
              </label>
              <input
                type="tel"
                placeholder="98XXXXXXXX"
                {...register('contactNumbers.0')}
                className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400 font-bold mb-4 ${errors.contactNumbers?.[0] ? 'border-red-500' : 'border-gray-100'
                  }`}
              />

              <label className="block text-sm font-bold text-gray-700 ml-1 mb-4 uppercase tracking-widest">
                {t('product.contactSecondary')}
              </label>
              <input
                type="tel"
                placeholder="98XXXXXXXX"
                {...register('contactNumbers.1')}
                className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400 font-bold ${errors.contactNumbers?.[1] ? 'border-red-500' : 'border-gray-100'
                  }`}
              />
              <p className="mt-2 text-[10px] sm:text-xs text-gray-400 font-medium px-1">
                {t('product.contactHelp')} {t('product.contactHelpDetail')}
              </p>
            </div>



            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 ml-1 mb-4 uppercase tracking-widest">{t('product.setLocation')}</label>
              <Controller
                name="coordinates"
                control={control}
                render={({ field }) => (
                  <MapPicker
                    initialCenter={field.value}
                    onLocationSelect={(lat, lng) => field.onChange({ lat, lng })}
                  />
                )}
              />
            </div>
          </div>


          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-600 text-white font-black py-4 rounded-xl hover:bg-primary-700 shadow-xl transition-all flex items-center justify-center space-x-2 text-lg active:scale-[0.98]"
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
    </PageTransition>
  );
};

export default AddEditProduct;
