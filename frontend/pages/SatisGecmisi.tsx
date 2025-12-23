import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { salesApi } from '../services/api';
import { ArrowLeft, Search, X } from 'lucide-react';
import Pagination from '../components/Pagination';

const SatisGecmisi = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    setLoading(true);
    try {
      const data = await salesApi.findAll();
      setSales(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Satışlar yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = useMemo(() => {
    if (!searchTerm.trim()) {
      return sales;
    }
    const search = searchTerm.toLowerCase();
    return sales.filter((sale) => {
      return (
        (sale.product?.imei && sale.product.imei.toLowerCase().includes(search)) ||
        sale.product?.marka?.toLowerCase().includes(search) ||
        sale.product?.model?.toLowerCase().includes(search) ||
        (sale.musteri_adi && sale.musteri_adi.toLowerCase().includes(search))
      );
    });
  }, [sales, searchTerm]);

  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSales.slice(start, start + itemsPerPage);
  }, [filteredSales, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

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
        <h1 className="text-3xl font-bold text-gray-800">Satış Geçmişi</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="IMEI, marka, model veya müşteri adı ile ara..."
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
                  <th className="text-left p-2">Müşteri</th>
                  <th className="text-left p-2">Satış Fiyatı</th>
                  <th className="text-left p-2">Ödeme Tipi</th>
                  <th className="text-left p-2">Satış Yapan</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSales.map((sale) => (
                  <tr key={sale.id} className="border-b hover:bg-green-50 bg-green-50">
                    <td className="p-2">
                      {new Date(sale.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="p-2">{sale.product?.imei || '-'}</td>
                    <td className="p-2">
                      {sale.product?.marka} {sale.product?.model}
                    </td>
                    <td className="p-2">{sale.musteri_adi || '-'}</td>
                    <td className="p-2 font-semibold text-green-600">
                      {parseFloat(sale.satis_fiyati).toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="p-2">
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                        {sale.odeme_tipi}
                      </span>
                    </td>
                    <td className="p-2">{sale.user?.ad_soyad || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSales.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Arama sonucu bulunamadı' : 'Satış kaydı bulunamadı'}
              </div>
            )}
            {filteredSales.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredSales.length}
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SatisGecmisi;

