import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { salesApi, financeApi, productsApi } from '../services/api';
import { ArrowLeft } from 'lucide-react';

const Raporlar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [salesStats, setSalesStats] = useState<any>(null);
  const [financeStats, setFinanceStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (user?.rol !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [sales, finance, productsData] = await Promise.all([
        salesApi.getStats(),
        financeApi.getStats(),
        productsApi.findAll(),
      ]);
      setSalesStats(sales);
      setFinanceStats(finance);
      setProducts(productsData);
    } catch (err) {
      console.error('Raporlar yüklenemedi:', err);
    }
  };

  const stoktaCount = products.filter((p) => p.durum === 'stokta').length;
  const satildiCount = products.filter((p) => p.durum === 'satildi').length;
  const servisteCount = products.filter((p) => p.durum === 'serviste').length;

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Raporlar</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Satış İstatistikleri</h2>
          {salesStats && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Toplam Satış:</span>
                <span className="font-semibold">{salesStats.toplamSatis}</span>
              </div>
              <div className="flex justify-between">
                <span>Toplam Ciro:</span>
                <span className="font-semibold text-green-600">
                  {salesStats.toplamCiro.toFixed(2)} ₺
                </span>
              </div>
              <div className="flex justify-between">
                <span>Toplam Kâr:</span>
                <span className="font-semibold text-blue-600">
                  {salesStats.toplamKar.toFixed(2)} ₺
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Finans İstatistikleri</h2>
          {financeStats && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Toplam Gelir:</span>
                <span className="font-semibold text-green-600">
                  {financeStats.toplamGelir.toFixed(2)} ₺
                </span>
              </div>
              <div className="flex justify-between">
                <span>Toplam Gider:</span>
                <span className="font-semibold text-red-600">
                  {financeStats.toplamGider.toFixed(2)} ₺
                </span>
              </div>
              <div className="flex justify-between">
                <span>Net Kâr:</span>
                <span
                  className={`font-semibold ${
                    financeStats.netKar >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {financeStats.netKar.toFixed(2)} ₺
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Stok Durumu</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Stokta:</span>
              <span className="font-semibold text-green-600">{stoktaCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Satıldı:</span>
              <span className="font-semibold text-blue-600">{satildiCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Serviste:</span>
              <span className="font-semibold text-orange-600">{servisteCount}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span>Toplam Ürün:</span>
              <span className="font-semibold">{products.length}</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Raporlar;

