import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const location = useLocation();

  // Token kontrolü - localStorage'dan kontrol et (state güncellenmemiş olabilir)
  const savedToken = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');
  
  // Token ve user varsa authenticated say - state'e bakma, direkt localStorage'a bak
  const isReallyAuthenticated = !!savedToken && !!savedUser;

  console.log('🔒 ProtectedRoute kontrol:', {
    path: location.pathname,
    isAuthenticated,
    token: !!token,
    savedToken: !!savedToken,
    savedUser: !!savedUser,
    isReallyAuthenticated
  });

  if (!isReallyAuthenticated) {
    console.log('❌ Yetkisiz erişim, login\'e yönlendiriliyor...');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  console.log('✅ Yetkili erişim, içerik gösteriliyor');
  return <>{children}</>;
};

export default ProtectedRoute;

