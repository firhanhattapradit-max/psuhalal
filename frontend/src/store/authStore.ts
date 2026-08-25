import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          // Mock API call
          // const res = await api.auth.login({ email, password });
          
          // Simulation
          await new Promise(resolve => setTimeout(resolve, 1000));
          const mockUser = { id: '1', name: 'Traveler', email, role: 'user' };
          const mockToken = 'mock-jwt-token-123';
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', mockToken);
          }
          
          set({ user: mockUser, token: mockToken, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        set({ user: null, token: null });
      },
      
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
    }),
    {
      name: 'auth-storage', // key in localStorage
      partialize: (state) => ({ user: state.user, token: state.token }), // save only user and token
    }
  )
);
