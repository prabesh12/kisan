import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare, User, List, LogIn, Languages, Sprout, Search, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { useAppSelector } from '../hooks/redux';
import { useTranslation } from 'react-i18next';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const navItems = [
    { label: t('nav.home'), path: '/', icon: Home },
    { label: t('nav.exploreMarket'), path: '/home', icon: Search },
    { label: t('nav.myListings'), path: '/my-listings', icon: List, auth: true },
    { label: t('nav.add'), path: '/add-product', icon: PlusSquare, auth: true },
    { label: t('nav.profile'), path: '/profile', icon: User, auth: true },
  ];

  const Logo = ({ className = "" }) => (
    <Link to="/" className={`flex items-center space-x-2 group ${className}`}>
      <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-200 group-hover:scale-110 transition-transform duration-300">
        <Sprout size={24} />
      </div>
      <span className="text-2xl font-black text-gray-900 tracking-tight">Kisan</span>
    </Link>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Desktop Header */}
      <header className="hidden md:flex bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 px-8 py-4 justify-between items-center border-b border-gray-100">
        <Logo />
        
        <nav className="flex space-x-8 items-center">
          {navItems.map((item) => (
            (!item.auth || isAuthenticated) && (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1 font-bold transition-all duration-200 ${
                  location.pathname === item.path ? 'text-primary-600' : 'text-gray-500 hover:text-primary-500'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            )
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          {!isAuthenticated ? (
            <Link
              to="/login"
              className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95"
            >
              {t('nav.login')}
            </Link>
          ) : (
            <Link to="/profile" className="flex items-center space-x-3 bg-gray-50 p-1.5 pr-4 rounded-full border border-gray-100 hover:bg-gray-100 transition-all">
               <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200">
                  {user?.name?.charAt(0).toUpperCase() || <User size={16} />}
               </div>
               <span className="text-sm font-bold text-gray-700">{user?.name?.split(' ')[0]}</span>
            </Link>
          )}

          <div className="h-6 w-px bg-gray-200 mx-2" />
          
          <button
            onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ne' : 'en')}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-black text-gray-700 hover:bg-white hover:shadow-sm transition-all uppercase tracking-wider"
          >
            <Languages size={14} className="text-primary-600" />
            <span>{i18n.language === 'en' ? 'नेपाली' : 'English'}</span>
          </button>
        </div>
      </header>

      {/* Mobile Top Header */}
      <header className="md:hidden flex bg-white shadow-sm sticky top-0 z-50 px-4 py-3 justify-between items-center border-b border-gray-100">
        <Logo />
        <button
          onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ne' : 'en')}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-gray-100 bg-gray-50 text-[10px] font-bold text-gray-700 hover:bg-gray-100 transition-all uppercase tracking-wider shadow-sm"
        >
          <Languages size={14} className="text-primary-600" />
          <span>{i18n.language === 'en' ? 'नेपाली' : 'English'}</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-12 pt-6 px-4 w-full">
        <div className="container-fluid mx-auto">
          {children}
        </div>
      </main>

      {/* Site Footer */}
      <footer className="hidden md:block bg-white border-t border-gray-100 pt-16 pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Logo />
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              {t('landing.subtitle')}
            </p>
            <div className="flex space-x-4">
               <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition-all border border-gray-100"><Globe size={18} /></a>
               <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition-all border border-gray-100"><Globe size={18} /></a>
               <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition-all border border-gray-100"><Globe size={18} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-[10px]">{t('footer.quickLinks')}</h4>
            <ul className="space-y-4">
              {navItems.slice(0, 3).map(item => (
                <li key={item.path}>
                  <Link to={item.path} className="text-gray-500 hover:text-primary-600 transition-colors text-sm font-medium">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-[10px]">{t('footer.categories')}</h4>
            <ul className="space-y-4">
              <li><Link to="/home?category=vegetables" className="text-gray-500 hover:text-primary-600 transition-colors text-sm font-medium">{t('filters.categories.vegetables')}</Link></li>
              <li><Link to="/home?category=fruits" className="text-gray-500 hover:text-primary-600 transition-colors text-sm font-medium">{t('filters.categories.fruits')}</Link></li>
              <li><Link to="/home?category=grains" className="text-gray-500 hover:text-primary-600 transition-colors text-sm font-medium">{t('filters.categories.grains')}</Link></li>
              <li><Link to="/home?category=dairy" className="text-gray-500 hover:text-primary-600 transition-colors text-sm font-medium">{t('filters.categories.dairy')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-[10px]">{t('footer.contact')}</h4>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3 text-gray-500 text-sm font-medium">
                 <Mail size={16} className="text-primary-500" />
                 <span>contact@kisanapp.com</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-500 text-sm font-medium">
                 <Phone size={16} className="text-primary-500" />
                 <span>+977 9800000000</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-500 text-sm font-medium">
                 <MapPin size={16} className="text-primary-500" />
                 <span>Kathmandu, Nepal</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center text-gray-400 text-[10px] font-bold uppercase tracking-widest gap-4">
          <p>&copy; {new Date().getFullYear()} Kisan Marketplace. {t('footer.rights')}.</p>
          <div className="flex space-x-6">
             <Link to="/terms" className="hover:text-primary-600">Terms</Link>
             <Link to="/privacy" className="hover:text-primary-600">Privacy</Link>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      {/* Mobile Bottom Navigation */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white shadow-[0_-8px_30px_rgb(0,0,0,0.04)] border-t border-gray-100 pb-safe">
          <div className="flex justify-around items-center px-2 py-2">
            {navItems.map((item) => (
              (!item.auth || isAuthenticated) && (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center p-2 rounded-2xl transition-all ${
                    (location.pathname === item.path || (item.path === '/' && location.pathname === '/')) 
                      ? 'text-primary-600 bg-primary-50/50 px-4' 
                      : 'text-gray-400 hover:text-primary-400'
                  }`}
                >
                  <item.icon size={22} strokeWidth={location.pathname === item.path ? 3 : 2} />
                  <span className="text-[10px] mt-1 font-bold uppercase tracking-tighter">{item.label}</span>
                </Link>
              )
            ))}
            {!isAuthenticated && (
              <Link
                to="/login"
                className={`flex flex-col items-center p-2 text-gray-400 hover:text-primary-400 transition-all ${
                  location.pathname === '/login' ? 'text-primary-600 bg-primary-50/50 px-4 rounded-2xl' : ''
                }`}
              >
                <LogIn size={22} />
                <span className="text-[10px] mt-1 font-bold uppercase tracking-tighter">{t('nav.login')}</span>
              </Link>
            )}
          </div>
      </footer>
    </div>
  );
};

export default Layout;
