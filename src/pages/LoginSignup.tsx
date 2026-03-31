import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, LogIn, User, Globe } from 'lucide-react';
import { useAppDispatch } from '../hooks/redux';
import { login } from '../features/auth/authSlice';
import { findUserByPhone, saveUser } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';


const LoginSignup: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();


  const handleAuthFlow = (type: string) => {
    setIsLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      let user = findUserByPhone(phoneNumber);
      
      if (!user) {
        // Create new user if not found (Registration)
        user = {
          id: uuidv4(),
          name: `User ${phoneNumber.slice(-4)}`,
          phone: phoneNumber,
          location: {
            city: 'Kathmandu',
            coordinates: { lat: 27.7172, lng: 85.3240 }
          },
          bio: 'New kisan member.'
        };
        saveUser(user);
      }
      
      dispatch(login(user));
      setIsLoading(false);
      navigate('/home');
    }, 1200);
  };


  return (
    <div className="max-w-md mx-auto py-12 px-6 bg-white rounded-3xl shadow-xl mt-12 border border-gray-100">
      <div className="text-center space-y-4 mb-10">
        <h2 className="text-3xl font-bold font-heading text-primary-900 tracking-tight">{t('auth.welcome')}</h2>
        <p className="text-gray-500 font-medium leading-relaxed">{t('auth.subtitle')}</p>
      </div>


      <div className="space-y-4">
        {/* Phone Login */}
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider">
            {t('auth.phoneLabel')}
          </label>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
              <Phone size={18} />
            </div>
            <input
              type="tel"
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="984XXXXXXX"
              className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-900 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400 font-medium"
            />
          </div>
        </div>

        <button
          onClick={() => handleAuthFlow('phone')}

          disabled={isLoading || phoneNumber.length < 10}
          className="w-full bg-primary-600 text-white font-bold py-4 rounded-2xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all flex items-center justify-center space-x-2 text-lg active:scale-[0.98]"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogIn size={20} />
              <span>{t('auth.loginButton')}</span>
            </>
          )}
        </button>


        <div className="relative py-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-bold uppercase tracking-widest">{t('auth.orContinue')}</span>
          </div>
        </div>


        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleAuthFlow('google')}
            className="flex items-center justify-center space-x-2 border-2 border-gray-100 p-4 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.95]"
          >
            <Globe size={20} />
            <span>Google</span>
          </button>

          <button
            onClick={() => handleAuthFlow('github')}
            className="flex items-center justify-center space-x-2 border-2 border-gray-100 p-4 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.95]"
          >
            <User size={20} />
            <span>GitHub</span>
          </button>
        </div>
      </div>


      <p className="mt-8 text-center text-sm text-gray-500 font-medium italic">
        {t('auth.terms')} <span className="underline cursor-pointer">{t('auth.termsLink')}</span>.
      </p>

    </div>
  );
};

export default LoginSignup;
