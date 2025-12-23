import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Package, ShoppingCart, Box, Wrench, TrendingUp, FileText, History } from 'lucide-react';
import { productsApi, salesApi, financeApi, servicesApi } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [products, sales, finance, services] = await Promise.all([
        productsApi.findAll(),
        salesApi.findAll().catch(() => []),
        financeApi.getStats().catch(() => null),
        servicesApi.findAll().catch(() => []),
      ]);

      const stoktaCount = products.filter((p: any) => p.durum === 'stokta').length;
      const servisteCount = services.filter((s: any) => s.durum !== 'teslim_edildi').length;
      const bugunSatis = sales.filter((s: any) => {
        const today = new Date().toDateString();
        return new Date(s.created_at).toDateString() === today;
      }).length;

      setStats({
        stoktaCount,
        servisteCount,
        bugunSatis,
        finance,
      });
    } catch (err) {
      console.error('İstatistikler yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const allModules = [
    { icon: Package, label: 'Alış', path: '/alis', color: 'from-blue-500 to-blue-600', roles: ['admin', 'personel'] },
    { icon: ShoppingCart, label: 'Satış', path: '/satis', color: 'from-green-500 to-green-600', roles: ['admin', 'personel'] },
    { icon: Box, label: 'Stok', path: '/stok', color: 'from-purple-500 to-purple-600', roles: ['admin', 'personel'] },
    { icon: Wrench, label: 'Teknik Servis', path: '/servis', color: 'from-orange-500 to-orange-600', roles: ['admin', 'personel'] },
    { icon: TrendingUp, label: 'Gelir-Gider', path: '/finans', color: 'from-yellow-500 to-amber-500', roles: ['admin', 'personel'] },
    { icon: FileText, label: 'Raporlar', path: '/raporlar', color: 'from-indigo-500 to-indigo-600', roles: ['admin'] },
    { icon: History, label: 'Satış Geçmişi', path: '/satis-gecmisi', color: 'from-green-400 to-green-500', roles: ['admin', 'personel'] },
    { icon: History, label: 'Alış Geçmişi', path: '/alis-gecmisi', color: 'from-blue-400 to-blue-500', roles: ['admin', 'personel'] },
  ];

  const modules = allModules.filter(module => module.roles.includes(user?.rol || ''));

  return (
    <Layout>
      <div className="mb-6 sm:mb-8 flex flex-col items-center">
        <div className="mb-4 sm:mb-6">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="h-32 sm:h-48 w-auto object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-800 mb-2">Ana Sayfa</h1>
        <p className="text-gray-500 text-sm sm:text-lg text-center px-4">İşlem yapmak için kutucukları tıklayınız.</p>
      </div>

      {!loading && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Stokta</p>
            <p className="text-2xl font-bold text-green-600">{stats.stoktaCount}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-sm text-gray-600 mb-1">Serviste</p>
            <p className="text-2xl font-bold text-orange-600">{stats.servisteCount}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Bugünkü Satış</p>
            <p className="text-2xl font-bold text-blue-600">{stats.bugunSatis}</p>
          </div>
          {stats.finance && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-600 mb-1">Net Kâr</p>
              <p className={`text-2xl font-bold ${stats.finance.netKar >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.finance.netKar.toFixed(2)} ₺
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <button
              key={module.path}
              onClick={() => navigate(module.path)}
              className={`group relative bg-gradient-to-br ${module.color} hover:brightness-110 text-white p-4 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center gap-2 sm:gap-4 min-h-[140px] sm:min-h-[180px] text-center overflow-hidden border border-white/20`}
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
              <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-4">
                <div className="p-2 sm:p-4 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Icon size={32} strokeWidth={2.5} className="sm:w-12 sm:h-12 opacity-95 drop-shadow-lg" />
                </div>
                <span className="text-sm sm:text-xl font-bold drop-shadow-md group-hover:scale-105 transition-transform duration-300">{module.label}</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </button>
          );
        })}
      </div>
    </Layout>
  );
};

export default Dashboard;

