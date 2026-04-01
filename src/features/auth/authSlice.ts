import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
  id: string;
  name: string;
  phone: string;
  location: {
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  bio: string;
  profilePhoto?: string;
  farmName?: string;
  specialty?: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  guestLocation: {
    lat: number;
    lng: number;
  } | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  guestLocation: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: UserProfile; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setLocation: (state, action: PayloadAction<{ lat: number; lng: number; city?: string }>) => {
      const city = action.payload.city || 'Current Location';
      // Check if user exists and has a real ID (to avoid malformed persisted objects)
      if (state.user && (state.user as any).id) {
        if (!state.user.location) {
          state.user.location = { city, coordinates: { lat: action.payload.lat, lng: action.payload.lng } };
        } else {
          state.user.location.coordinates = { lat: action.payload.lat, lng: action.payload.lng };
          if (action.payload.city) state.user.location.city = action.payload.city;
        }
      } else {
        state.guestLocation = { lat: action.payload.lat, lng: action.payload.lng };
      }
    },
  },
});

export const { login, logout, updateProfile, setLocation } = authSlice.actions;
export default authSlice.reducer;
