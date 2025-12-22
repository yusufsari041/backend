import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import { financeApi } from '../services/api';
import { ArrowLeft, Trash2, Search, X, Filter } from 'lucide-react';
import Pagination from '../components/Pagination';

const Finans = () => {
  const navigate = useNavigate();
  const [finances, setFinances] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tip: 'gider',
    kategori: '',
    tutar: '',
    aciklama: '',
  });
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTip, setFilterTip] = useState<string>('all');
  const [filterKategori, setFilterKategori] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadFinances();
    loadStats();
  }, []);

  const loadFinances = async () => {
    try {
      const data = await financeApi.findAll();
      setFinances(data);
    } catch (err) {
      console.error('Finans verileri yüklenemedi:', err);
    }
  };

  const loadStats = async () => {
    try {
      const data = await financeApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('İstatistikler yüklenemedi:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tutar || parseFloat(formData.tutar) <= 0) {
      toast.error('Tutar 0\'dan büyük olmalıdır');
      return;
    }

    if (isNaN(parseFloat(formData.tutar))) {
      toast.error('Geçerli bir tutar giriniz');
      return;
    }

    setLoading(true);
    try {
      await financeApi.create({
        tip: formData.tip,
        kategori: formData.kategori,
        tutar: parseFloat(formData.tutar),
        aciklama: formData.aciklama,
      });
      toast.success('Kayıt oluşturuldu!');
      setShowForm(false);
      setFormData({ tip: 'gider', kategori: '', tutar: '', aciklama: '' });
      loadFinances();
      loadStats();
    } catch (err: any) {
      // Hata toast interceptor tarafından gösterilecek
    } finally {
      setLoading(false);
    }
  };

  const filteredFinances = useMemo(() => {
    let filtered = finances;

    if (filterTip !== 'all') {
      filtered = filtered.filter((f) => f.tip === filterTip);
    }

    if (filterKategori !== 'all') {
      filtered = filtered.filter((f) => f.kategori === filterKategori);
    }

    if (startDate) {
      filtered = filtered.filter((f) => {
        const financeDate = new Date(f.created_at).toISOString().split('T')[0];
        return financeDate >= startDate;
      });
    }

    if (endDate) {
      filtered = filtered.filter((f) => {
        const financeDate = new Date(f.created_at).toISOString().split('T')[0];
        return financeDate <= endDate;
      });
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((f) => {
        return (
          (f.kategori && f.kategori.toLowerCase().includes(search)) ||
          (f.aciklama && f.aciklama.toLowerCase().includes(search)) ||
          f.tutar.toString().includes(search)
        );
      });
    }

    return filtered;
  }, [finances, filterTip, filterKategori, startDate, endDate, searchTerm]);

  const paginatedFinances = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFinances.slice(start, start + itemsPerPage);
  }, [filteredFinances, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredFinances.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    finances.forEach((f) => {
      if (f.kategori) cats.add(f.kategori);
    });
    return Array.from(cats).sort();
  }, [finances]);

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await financeApi.delete(id);
      toast.success('Kayıt başarıyla silindi');
      setDeleteConfirm(null);
      loadFinances();
      loadStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Kayıt silinemedi');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Gelir - Gider</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'İptal' : 'Yeni Kayıt'}
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Toplam Gelir</p>
            <p className="text-2xl font-bold text-green-600">{stats.toplamGelir.toFixed(2)} ₺</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Toplam Gider</p>
            <p className="text-2xl font-bold text-red-600">{stats.toplamGider.toFixed(2)} ₺</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Net Kâr</p>
            <p className={`text-2xl font-bold ${stats.netKar >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {stats.netKar.toFixed(2)} ₺
            </p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tip *
              </label>
              <select
                value={formData.tip}
                onChange={(e) => setFormData({ ...formData, tip: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="gelir">Gelir</option>
                <option value="gider">Gider</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <input
                type="text"
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                placeholder="Örn: Kira, Maaş, Elektrik"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tutar *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.tutar}
                onChange={(e) => setFormData({ ...formData, tutar: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <textarea
                value={formData.aciklama}
                onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Kategori, açıklama veya tutar ile ara..."
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
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded flex items-center gap-2 ${showFilters ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              <Filter size={18} />
              Filtrele
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tip</label>
                <select
                  value={filterTip}
                  onChange={(e) => setFilterTip(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tümü</option>
                  <option value="gelir">Gelir</option>
                  <option value="gider">Gider</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tümü</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Tarih</th>
                <th className="text-left p-2">Tip</th>
                <th className="text-left p-2">Kategori</th>
                <th className="text-left p-2">Tutar</th>
                <th className="text-left p-2">Açıklama</th>
                <th className="text-left p-2">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFinances.map((finance) => (
                <tr
                  key={finance.id}
                  className={`border-b hover:bg-gray-50 ${
                    finance.tip === 'gelir' ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <td className="p-2">
                    {new Date(finance.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        finance.tip === 'gelir'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {finance.tip}
                    </span>
                  </td>
                  <td className="p-2">{finance.kategori || '-'}</td>
                  <td className="p-2 font-semibold">{finance.tutar} ₺</td>
                  <td className="p-2">{finance.aciklama || '-'}</td>
                  <td className="p-2">
                    <button
                      onClick={() => setDeleteConfirm(finance.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Sil"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredFinances.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || filterTip !== 'all' || filterKategori !== 'all' || startDate || endDate
                ? 'Filtre sonucu bulunamadı'
                : 'Kayıt bulunamadı'}
            </div>
          )}
          {filteredFinances.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredFinances.length}
            />
          )}
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Kaydı Sil</h3>
            <p className="text-gray-600 mb-6">
              Bu kaydı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Finans;

