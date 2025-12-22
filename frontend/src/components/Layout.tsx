import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Search, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 safe-area">
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="w-full py-2 sm:py-3 flex justify-end items-center">
          <div className="flex items-center gap-2 sm:gap-4 pr-2 sm:pr-4 flex-wrap">
            <button
              onClick={() => navigate('/imei-sorgulama')}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              <Search size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">IMEI Sorgulama</span>
            </button>
            <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
            <button
              onClick={() => navigate('/profil')}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
            >
              {user?.profil_fotografi ? (
                <img 
                  src={user.profil_fotografi} 
                  alt={user.ad_soyad} 
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={10} className="sm:w-3 sm:h-3 text-gray-500" />
                </div>
              )}
              <span className="max-w-[80px] sm:max-w-none truncate">{user?.ad_soyad}</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <LogOut size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-safe">{children}</main>
    </div>
  );
};

export default Layout;

