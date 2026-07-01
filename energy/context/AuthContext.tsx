'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import type { Usuario, LoginDto, RegisterDto } from '@/lib/types';

interface AuthContextType {
  user: Usuario | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Verificar si hay un usuario autenticado al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = Cookies.get('access_token');
        const userStr = Cookies.get('user');
        
        if (token && userStr) {
          const savedUser = JSON.parse(userStr);
          setUser(savedUser);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        Cookies.remove('access_token');
        Cookies.remove('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (data: LoginDto) => {
    const response = await api.login(data);
    setUser(response.user);
    Cookies.set('user', JSON.stringify(response.user), { 
      expires: 7,
      sameSite: 'strict',
    });
    router.push('/dashboard');
  }, [router]);

  const register = useCallback(async (data: RegisterDto) => {
    const response = await api.register(data);
    setUser(response.user);
    Cookies.set('user', JSON.stringify(response.user), { 
      expires: 7,
      sameSite: 'strict',
    });
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    api.logout();
    Cookies.remove('user');
    setUser(null);
    router.push('/login');
  }, [router]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

export default AuthContext;
