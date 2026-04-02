import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, LogIn, User, Lock, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { login as loginAction } from '../features/auth/authSlice';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { toast } from 'react-hot-toast';
import { Sprout } from 'lucide-react';

const SIGNUP_MUTATION = gql`
  mutation Signup($name: String!, $email: String!, $password: String!, $phoneNumber: String!, $location: LocationInput!) {
    signup(name: $name, email: $email, password: $password, phoneNumber: $phoneNumber, location: $location) {
      token
      user {
        id
        name
        email
        phoneNumber
        location {
          city
          coordinates {
            lat
            lng
          }
        }
      }
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        phoneNumber
        location {
          city
          coordinates {
            lat
            lng
          }
        }
      }
    }
  }
`;

interface SignupResponse {
  signup: {
    token: string;
    user: any;
  };
}

interface LoginResponse {
  login: {
    token: string;
    user: any;
  };
}

const authSchema = z.object({
  phoneNumber: z.string().regex(/^9\d{9}$/, "Phone number must be 10 digits starting with 9"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name is required for registration").optional(),
});

type AuthFormData = z.infer<typeof authSchema>;

const LoginSignup: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { guestLocation } = useAppSelector((state) => state.auth);

  const { register, handleSubmit, formState: { errors } } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema)
  });

  const [loginMutation, { loading: loginLoading }] = useMutation<LoginResponse>(LOGIN_MUTATION);
  const [signupMutation, { loading: signupLoading }] = useMutation<SignupResponse>(SIGNUP_MUTATION);

  const isLoading = loginLoading || signupLoading;

  const onSubmit = async (data: AuthFormData) => {
    try {
      if (isLogin) {
        const { data: response } = await loginMutation({
          variables: {
            email: `${data.phoneNumber}@kisan.com`,
            password: data.password
          }
        });
        if (response?.login) {
          dispatch(loginAction(response.login));
          toast.success(`${t('auth.welcome') || 'Welcome back'}, ${response.login.user.name}!`);
          navigate('/home');
        }
      } else {
        const { data: response } = await signupMutation({
          variables: {
            name: data.name || `User ${data.phoneNumber.slice(-4)}`,
            email: `${data.phoneNumber}@kisan.com`,
            password: data.password,
            phoneNumber: data.phoneNumber,
            location: {
              city: 'Current Location',
              coordinates: {
                lat: guestLocation?.lat || 27.7172,
                lng: guestLocation?.lng || 85.3240
              }
            }
          }
        });
        if (response?.signup) {
          dispatch(loginAction(response.signup));
          toast.success("Welcome to Kisan Marketplace!");
          navigate('/home');
        }
      }
    } catch (err: any) {
      const message =
        err?.graphQLErrors?.[0]?.message ||
        err?.networkError?.result?.errors?.[0]?.message ||
        err?.networkError?.message ||
        err?.message ||
        "Authentication failed.";
      toast.error(message);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-md mx-auto py-12 px-6 bg-white rounded-3xl shadow-2xl mt-12 border border-gray-100">
        <div className="text-center space-y-4 mb-10">
          <Link to="/" className="flex items-center justify-center space-x-2 group mb-8">
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-200 group-hover:scale-110 transition-transform duration-300">
              <Sprout size={30} />
            </div>
            <span className="text-3xl font-black text-gray-900 tracking-tight">Kisan</span>
          </Link>
          
          <h2 className="text-3xl font-black font-heading text-primary-900 tracking-tight">
            {isLogin ? t('auth.welcome') : "Create Account"}
          </h2>
          <p className="text-gray-500 font-medium leading-relaxed">
            {isLogin ? t('auth.subtitle') : "Join our community of farmers and buyers"}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {!isLogin && (
            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-400 ml-1 uppercase tracking-widest">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Ram Bahadur"
                  className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50/50 focus:border-primary-500 outline-none transition-all font-bold"
                />
              </div>
              {errors.name && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.name.message}</p>}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-black text-gray-400 ml-1 uppercase tracking-widest">{t('auth.phoneLabel')}</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                <Phone size={18} />
              </div>
              <input
                type="tel"
                {...register('phoneNumber')}
                placeholder="984XXXXXXX"
                className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50/50 focus:border-primary-500 outline-none transition-all font-bold"
              />
            </div>
            {errors.phoneNumber && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.phoneNumber.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-gray-400 ml-1 uppercase tracking-widest">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-500 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50/50 focus:border-primary-500 outline-none transition-all font-bold"
              />
            </div>
            {errors.password && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 text-white font-black py-5 rounded-2xl hover:bg-primary-700 disabled:opacity-50 shadow-xl shadow-primary-200 transition-all flex items-center justify-center space-x-3 text-lg active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isLogin ? t('auth.loginButton') : "Sign Up"}</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors underline underline-offset-4"
          >
            {isLogin ? "New to Kisan? Create an account" : "Already have an account? Log in"}
          </button>
        </div>

        <p className="mt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
          {t('auth.terms')} <br />
          <span className="text-primary-500 cursor-pointer">{t('auth.termsLink')}</span>
        </p>
      </div>
    </PageTransition>
  );
};

export default LoginSignup;
