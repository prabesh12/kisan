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
  isAuthenticated: boolean;
  guestLocation: {
    lat: number;
    lng: number;
  } | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  guestLocation: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setLocation: (state, action: PayloadAction<{ lat: number; lng: number }>) => {
      if (state.user) {
        state.user.location.coordinates = action.payload;
      } else {
        state.guestLocation = action.payload;
      }
    },
  },
});

export const { login, logout, updateProfile, setLocation } = authSlice.actions;
export default authSlice.reducer;
