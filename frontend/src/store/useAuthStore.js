import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isInitialized: false,
      isLoading: false,

      setUser: (user, token) => {
        set({ user, token, isInitialized: true });
        if (token) {
          localStorage.setItem('stasentry_token', token);
        }
        if (user) {
          localStorage.setItem('stasentry_user', JSON.stringify(user));
        }
      },

      initialize: () => {
        try {
          const token = localStorage.getItem('stasentry_token');
          const userStr = localStorage.getItem('stasentry_user');
          
          if (token && userStr) {
            const user = JSON.parse(userStr);
            set({ user, token, isInitialized: true });
          } else {
            set({ isInitialized: true });
          }
        } catch (error) {
          console.error('Initialization error:', error);
          set({ isInitialized: true });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          const data = response.data;

          get().setUser(data.user, data.token);
          set({ isLoading: false });

          localStorage.setItem('stasentry_token', data.token);
          localStorage.setItem('stasentry_user', JSON.stringify(data.user));

          return { success: true, user: data.user };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || error.message || 'Login failed',
          };
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', userData);
          const data = response.data;

          set({ isLoading: false });
          return { success: true, data };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || error.message || 'Registration failed',
          };
        }
      },

      logout: () => {
        localStorage.removeItem('stasentry_token');
        localStorage.removeItem('stasentry_user');
        set({ user: null, token: null });
      },

      updateUser: (updates) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, ...updates };
          localStorage.setItem('stasentry_user', JSON.stringify(updatedUser));
          set({ user: updatedUser });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;