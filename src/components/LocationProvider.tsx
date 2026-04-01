import React, { useEffect } from 'react';
import { useAppDispatch } from '../hooks/redux';
import { setLocation } from '../features/auth/authSlice';
import { fetchCityName } from '../utils/location';

const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Fetch the real village/town name
          const cityName = await fetchCityName(latitude, longitude);
          dispatch(setLocation({ 
            lat: latitude, 
            lng: longitude,
            city: cityName 
          }));
        },
        (error) => {
          console.error('Error getting location:', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
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
