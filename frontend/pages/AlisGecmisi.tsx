import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { purchasesApi } from '../services/api';
import { ArrowLeft, Search, X } from 'lucide-react';
import Pagination from '../components/Pagination';

const AlisGecmisi = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    setLoading(true);
    try {
      const data = await purchasesApi.findAll();
      setPurchases(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Alışlar yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPurchases = useMemo(() => {
    if (!searchTerm.trim()) {
      return purchases;
    }
    const search = searchTerm.toLowerCase();
    return purchases.filter((purchase) => {
      return (
        (purchase.product?.imei && purchase.product.imei.toLowerCase().includes(search)) ||
        purchase.product?.marka?.toLowerCase().includes(search) ||
        purchase.product?.model?.toLowerCase().includes(search) ||
        (purchase.tedarikci && purchase.tedarikci.toLowerCase().includes(search))
      );
    });
  }, [purchases, searchTerm]);

  const paginatedPurchases = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPurchases.slice(start, start + itemsPerPage);
  }, [filteredPurchases, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Alış Geçmişi</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="IMEI, marka, model veya tedarikçi ile ara..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Yükleniyor...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Tarih</th>
                  <th className="text-left p-2">IMEI</th>
                  <th className="text-left p-2">Marka/Model</th>
                  <th className="text-left p-2">Tedarikçi</th>
                  <th className="text-left p-2">Alış Fiyatı</th>
                  <th className="text-left p-2">Alış Yapan</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b hover:bg-red-50 bg-red-50">
                    <td className="p-2">
                      {new Date(purchase.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="p-2">{purchase.product?.imei || '-'}</td>
                    <td className="p-2">
                      {purchase.product?.marka} {purchase.product?.model}
                    </td>
                    <td className="p-2">{purchase.tedarikci || '-'}</td>
                    <td className="p-2 font-semibold text-red-600">
                      {parseFloat(purchase.alis_fiyati).toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="p-2">{purchase.user?.ad_soyad || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPurchases.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Arama sonucu bulunamadı' : 'Alış kaydı bulunamadı'}
              </div>
            )}
            {filteredPurchases.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredPurchases.length}
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AlisGecmisi;

