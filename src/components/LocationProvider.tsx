import React, { useEffect } from 'react';
import { useAppDispatch } from '../hooks/redux';
import { setLocation } from '../features/auth/authSlice';

const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          dispatch(setLocation({ lat: latitude, lng: longitude }));
        },
        (error) => {
          console.error('Error getting location:', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, [dispatch]);

  return <>{children}</>;
};

export default LocationProvider;
