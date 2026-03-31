import React from 'react';
import { useAppSelector } from '../hooks/redux';
import { useNavigate, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { PlusCircle, ShoppingBag, Edit3, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';


const MyListings: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { items } = useAppSelector((state) => state.products);
  const navigate = useNavigate();
  const { t } = useTranslation();


  if (!user) {
    navigate('/login');
    return null;
  }

  const myListings = items.filter((item) => item.sellerId === user.id);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black font-heading text-primary-900 tracking-tight">
            {t('listings.title')}
          </h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs hidden md:block">
            {t('auth.subtitle')}
          </p>
        </div>

        <Link
          to="/add-product"
          className="bg-primary-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-xl flex items-center justify-center space-x-2 active:scale-95"
        >
          <PlusCircle size={20} />
          <span>{t('product.addTitle')}</span>
        </Link>

      </div>

      {myListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {myListings.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} />
              <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => navigate(`/edit-product/${product.id}`)}
                  className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl text-primary-600 hover:bg-primary-50 hover:text-primary-700 transition-all border border-primary-100"
                  title="Edit Product"
                >
                  <Edit3 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center space-y-6 bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-sm">
          <div className="bg-primary-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-primary-200">
            <ShoppingBag size={48} />
          </div>
            <div className="space-y-2">
            <h3 className="text-2xl font-black text-primary-900">{t('listings.empty')}</h3>
            <p className="text-gray-500 font-medium max-w-sm mx-auto">
              {t('landing.subtitle')}
            </p>
          </div>
          <button
            onClick={() => navigate('/add-product')}
            className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-700 shadow-xl transition-all inline-flex items-center space-x-2"
          >
            <PlusCircle size={20} />
            <span>{t('listings.startSelling')}</span>
          </button>

        </div>
      )}
    </div>
  );
};

export default MyListings;
