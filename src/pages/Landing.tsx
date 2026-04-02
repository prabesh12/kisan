import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Leaf, Users, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageTransition from '../components/PageTransition';


const Landing: React.FC = () => {
  const { t } = useTranslation();
  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center space-y-12 pt-8 pb-12 text-center">
        {/* Hero Section */}
        <div className="max-w-3xl space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold font-heading text-primary-900 tracking-tight leading-tight">
            {t('landing.title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
            {t('landing.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-8">
            <Link
              to="/home"
              className="bg-primary-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-primary-700 hover:scale-105 transition-all shadow-xl flex items-center justify-center space-x-2"
            >
              <span>{t('landing.explore')}</span>
              <ArrowRight size={20} />
            </Link>

            <Link
              to="/login"
              className="bg-white border-2 border-primary-100 text-primary-700 px-8 py-4 rounded-xl text-lg font-bold hover:border-primary-300 hover:shadow-lg transition-all duration-700"
            >
              {t('landing.joinAsFarmer')}
            </Link>

          </div>
        </div>

        {/* Feature Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl pt-8">
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 text-left space-y-4">
            <div className="bg-primary-100 w-12 h-12 flex items-center justify-center rounded-xl text-primary-700">
              <Leaf size={24} />
            </div>
            <h3 className="text-xl font-bold text-primary-900 font-heading">{t('landing.features.marketplace')}</h3>
            <p className="text-gray-600 font-medium">{t('landing.features.marketplaceDesc')}</p>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 text-left space-y-4">
            <div className="bg-primary-100 w-12 h-12 flex items-center justify-center rounded-xl text-primary-700">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-primary-900 font-heading">{t('landing.features.exchange')}</h3>
            <p className="text-gray-600 font-medium">{t('landing.features.exchangeDesc')}</p>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 text-left space-y-4">
            <div className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-xl text-blue-700">
              <Sprout size={24} />
            </div>
            <h3 className="text-xl font-bold text-primary-900 font-heading">{t('landing.features.location')}</h3>
            <p className="text-gray-600 font-medium">{t('landing.features.locationDesc')}</p>
          </div>

        </div>
      </div>
    </PageTransition>
  );
};

export default Landing;
