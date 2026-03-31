import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, User, List, LogIn, Languages } from 'lucide-react';
import { useAppSelector } from '../hooks/redux';
import { useTranslation } from 'react-i18next';


interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const { t, i18n } = useTranslation();


  const navItems = [
    { label: t('nav.home'), path: '/home', icon: Home },
    { label: t('nav.myListings'), path: '/my-listings', icon: List, auth: true },
    { label: t('nav.add'), path: '/add-product', icon: PlusSquare, auth: true },
    { label: t('nav.profile'), path: '/profile', icon: User, auth: true },
  ];


  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Desktop Header */}
      <header className="hidden md:flex bg-white shadow-sm sticky top-0 z-50 px-6 py-4 justify-between items-center border-b border-gray-100">
        <Link to="/" className="text-2xl font-bold font-heading text-primary-700 tracking-tight">
          Kisan <span className="text-earth-600">App</span>
        </Link>
        <div className="flex items-center space-x-6">
          <nav className="flex space-x-8 items-center">
            {navItems.map((item) => (
              (!item.auth || isAuthenticated) && (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 font-medium transition-colors ${
                    location.pathname === item.path ? 'text-primary-600' : 'text-gray-600 hover:text-primary-500'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              )
            ))}
            {!isAuthenticated && (
              <Link
                to="/login"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-all flex items-center space-x-2"
              >
                <LogIn size={18} />
                <span>{t('nav.login')}</span>
              </Link>
            )}
          </nav>
          
          {/* Language Switcher Desktop */}
          <button
            onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ne' : 'en')}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all uppercase tracking-wider"
          >
            <Languages size={14} className="text-primary-600" />
            <span>{i18n.language === 'en' ? 'नेपाली' : 'English'}</span>
          </button>
        </div>

      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-8 pt-4 px-4 max-w-6xl mx-auto w-full">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <footer className="md:hidden fixed bottom-16 left-0 right-0 bg-transparent px-4 pointer-events-none z-40">
        <div className="flex justify-end pointer-events-auto">
          <button
            onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ne' : 'en')}
            className="bg-white/90 backdrop-blur-md shadow-lg border border-gray-100 p-3 rounded-full flex items-center justify-center text-primary-600 hover:scale-110 active:scale-95 transition-all"
          >
            <Languages size={24} />
          </button>
        </div>
      </footer>

      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 pt-2 pb-6 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {navItems.map((item) => (
            (!item.auth || isAuthenticated) && (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                  location.pathname === item.path 
                    ? 'text-primary-600 bg-primary-50 px-4' 
                    : 'text-gray-500 hover:text-primary-400'
                }`}
              >
                <item.icon size={24} />
                <span className="text-[10px] mt-1 font-medium uppercase tracking-wider">{item.label}</span>
              </Link>
            )
          ))}
          {!isAuthenticated && (
            <Link
              to="/login"
              className={`flex flex-col items-center p-2 text-gray-500 hover:text-primary-400 transition-all ${
                location.pathname === '/login' ? 'text-primary-600 bg-primary-50 px-4' : ''
              }`}
            >
              <LogIn size={24} />
              <span className="text-[10px] mt-1 font-medium uppercase tracking-wider">{t('nav.login')}</span>
            </Link>
          )}
        </div>
      </footer>

    </div>
  );
};

export default Layout;
