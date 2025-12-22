import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

interface User {
  id: number;
  ad_soyad: string;
  email: string;
  rol: string;
  ilk_giris?: boolean;
  profil_fotografi?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, sifre: string) => Promise<{ requiresPasswordChange?: boolean }>;
  logout: () => void;
  isAuthenticated: boolean;
  requiresPasswordChange: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setToken(savedToken);
      setUser(parsedUser);
      setRequiresPasswordChange(parsedUser.ilk_giris === true);
    }
  }, []);

  const login = async (email: string, sifre: string) => {
    const response = await authApi.login(email, sifre);
    setToken(response.token);
    setUser(response.user);
    setRequiresPasswordChange(response.requiresPasswordChange || false);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    return { requiresPasswordChange: response.requiresPasswordChange || false };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRequiresPasswordChange(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        requiresPasswordChange,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

