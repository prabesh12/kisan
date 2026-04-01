import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { updateProfile, logout } from '../features/auth/authSlice';
import { MapPin, Phone, User as UserIcon, LogOut, Save, CheckCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { saveUser } from '../utils/storage';
import PageTransition from '../components/PageTransition';

const UserProfile: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    city: user?.location.city || '',
    farmName: user?.farmName || '',
    specialty: user?.specialty || 'General Farming',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSave = () => {
    dispatch(updateProfile({
      name: formData.name,
      bio: formData.bio,
      location: {
        ...user.location,
        city: formData.city,
      },
      farmName: formData.farmName,
      specialty: formData.specialty,
    }));

    // Also save to our local storage "database"
    if (user) {
      saveUser({
        ...user,
        name: formData.name,
        bio: formData.bio,
        location: {
          ...user.location,
          city: formData.city,
        },
        farmName: formData.farmName,
        specialty: formData.specialty,
      });
    }

    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };


  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header/Cover */}
          <div className="h-40 bg-gradient-to-r from-primary-600 to-earth-500 relative">
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
              <div className="w-32 h-32 rounded-full border-8 border-white bg-white shadow-xl overflow-hidden">
                <img 
                  src={user.profilePhoto || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="pt-20 pb-10 px-8 text-center space-y-8">
            <div className="space-y-2">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-3xl font-black text-center text-primary-900 border-b-2 border-primary-200 outline-none focus:border-primary-600 transition-colors bg-transparent px-2 py-1 w-full max-w-sm mx-auto"
                />
              ) : (
                <h2 className="text-3xl font-black font-heading text-primary-900 tracking-tight">{user.name}</h2>
              )}
              <div className="flex items-center justify-center space-x-2 text-gray-500 font-bold uppercase tracking-widest text-xs">
                <Phone size={14} className="text-primary-600" />
                <span>{user.phone}</span>
              </div>
              <div className="pt-1 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                  {t('profile.joined')} {new Date().getFullYear()}
              </div>
            </div>


            {showSuccess && (
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl flex items-center justify-center space-x-2 font-bold animate-bounce border border-green-100">
                <CheckCircle size={18} />
                <span>{t('profile.success')}</span>
              </div>
            )}


            <div className="grid grid-cols-1 gap-6 text-left max-w-md mx-auto">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-primary-900 font-bold uppercase tracking-widest text-xs ml-1">
                  <MapPin size={14} />
                  <span>{t('profile.location')}</span>
                </label>

                {isEditing ? (
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-100 px-4 py-3 rounded-xl font-bold text-gray-700 focus:border-primary-500 outline-none transition-all"
                  />
                ) : (
                  <div className="bg-gray-50 px-5 py-4 rounded-xl font-bold text-gray-700 border border-gray-100">
                    {user.location.city}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-primary-900 font-bold uppercase tracking-widest text-xs ml-1">
                  <UserIcon size={14} />
                  <span>{t('profile.bio')}</span>
                </label>

                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full bg-gray-50 border-2 border-gray-100 px-4 py-3 rounded-xl font-bold text-gray-700 focus:border-primary-500 outline-none transition-all resize-none"
                  />
                ) : (
                  <div className="bg-gray-50 px-5 py-4 rounded-xl font-bold text-gray-700 border border-gray-100 leading-relaxed italic">
                    "{user.bio}"
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-primary-900 font-bold uppercase tracking-widest text-xs ml-1">
                  <FileText size={14} />
                  <span>{t('profile.farmName')}</span>
                </label>

                {isEditing ? (
                  <input
                    type="text"
                    value={formData.farmName}
                    onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                    placeholder="e.g. Green Hill Organics"
                    className="w-full bg-gray-50 border-2 border-gray-100 px-4 py-3 rounded-xl font-bold text-gray-700 focus:border-primary-500 outline-none transition-all"
                  />
                ) : (
                  <div className="bg-gray-50 px-5 py-4 rounded-xl font-bold text-gray-700 border border-gray-100">
                    {user.farmName || t('profile.noFarmName')}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-primary-900 font-bold uppercase tracking-widest text-xs ml-1">
                  <CheckCircle size={14} className="text-primary-600" />
                  <span>{t('profile.specialty')}</span>
                </label>

                {isEditing ? (
                  <select
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-100 px-4 py-3 rounded-xl font-bold text-gray-700 focus:border-primary-500 outline-none transition-all"
                  >
                    <option value={t('profile.specialties.general')}>{t('profile.specialties.general')}</option>
                    <option value={t('profile.specialties.veg')}>{t('profile.specialties.veg')}</option>
                    <option value={t('profile.specialties.fruit')}>{t('profile.specialties.fruit')}</option>
                    <option value={t('profile.specialties.dairy')}>{t('profile.specialties.dairy')}</option>
                    <option value={t('profile.specialties.meat')}>{t('profile.specialties.meat')}</option>
                    <option value={t('profile.specialties.grain')}>{t('profile.specialties.grain')}</option>
                    <option value={t('profile.specialties.organic')}>{t('profile.specialties.organic')}</option>
                  </select>
                ) : (
                  <div className="inline-flex bg-primary-50 text-primary-700 px-5 py-3 rounded-xl font-black text-sm uppercase tracking-wider border border-primary-100">
                    {user.specialty || t('profile.specialties.general')}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-4 pt-4 max-w-md mx-auto">
              {isEditing ? (
                <button
                  onClick={handleSave}
                   className="bg-primary-600 text-white font-bold py-4 rounded-xl hover:bg-primary-700 shadow-xl transition-all flex items-center justify-center space-x-2"
                >
                  <Save size={20} />
                  <span>{t('profile.save')}</span>
                </button>

              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                   className="bg-white border-2 border-primary-600 text-primary-600 font-bold py-4 rounded-xl hover:bg-primary-50 transition-all flex items-center justify-center space-x-2"
                >
                  <UserIcon size={20} />
                  <span>{t('profile.edit')}</span>
                </button>

              )}

              <button
                onClick={handleLogout}
                 className="bg-red-50 text-red-600 font-bold py-4 rounded-xl hover:bg-red-100 transition-all flex items-center justify-center space-x-2 border-2 border-transparent hover:border-red-200"
              >
                <LogOut size={20} />
                <span>{t('profile.signOut')}</span>
              </button>

            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default UserProfile;
