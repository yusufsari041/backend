import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import { servicesApi } from '../services/api';
import { ArrowLeft, Trash2, Edit, Search, X } from 'lucide-react';
import Autocomplete from '../components/Autocomplete';
import { phoneBrands, phoneModels } from '../data/phoneData';
import Pagination from '../components/Pagination';

const Servis = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    imei: '',
    marka: '',
    model: '',
    musteri_adi: '',
    ariza: '',
    teslim_tarihi: '',
  });
  const [markaInputValue, setMarkaInputValue] = useState('');
  const [modelInputValue, setModelInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingService, setEditingService] = useState<number | null>(null);
  const [statusUpdateId, setStatusUpdateId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDurum, setFilterDurum] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await servicesApi.findAll();
      setServices(data);
    } catch (err) {
      console.error('Servisler yüklenemedi:', err);
    }
  };

  const availableModels = phoneModels[formData.marka] || [];

  const filteredServices = useMemo(() => {
    let filtered = services;

    if (filterDurum !== 'all') {
      filtered = filtered.filter((s) => s.durum === filterDurum);
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((s) => {
        return (
          (s.imei && s.imei.toLowerCase().includes(search)) ||
          (s.marka && s.marka.toLowerCase().includes(search)) ||
          (s.model && s.model.toLowerCase().includes(search)) ||
          (s.product?.imei && s.product.imei.toLowerCase().includes(search)) ||
          (s.product?.marka && s.product.marka.toLowerCase().includes(search)) ||
          (s.product?.model && s.product.model.toLowerCase().includes(search)) ||
          s.musteri_adi.toLowerCase().includes(search) ||
          s.ariza.toLowerCase().includes(search)
        );
      });
    }

    return filtered;
  }, [services, filterDurum, searchTerm]);

  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredServices.slice(start, start + itemsPerPage);
  }, [filteredServices, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.marka?.trim() || !formData.model?.trim()) {
      toast.error('Marka ve model bilgisi gereklidir');
      return;
    }

    if (!formData.musteri_adi?.trim()) {
      toast.error('Müşteri adı gereklidir');
      return;
    }

    if (!formData.ariza?.trim()) {
      toast.error('Arıza açıklaması gereklidir');
      return;
    }

    setLoading(true);
    try {
      if (editingService) {
        await servicesApi.update(editingService, {
          imei: formData.imei || undefined,
          marka: formData.marka,
          model: formData.model,
          musteri_adi: formData.musteri_adi,
          ariza: formData.ariza,
          teslim_tarihi: formData.teslim_tarihi || undefined,
        });
        toast.success('Servis kaydı güncellendi!');
      } else {
        await servicesApi.create({
          imei: formData.imei || undefined,
          marka: formData.marka,
          model: formData.model,
          musteri_adi: formData.musteri_adi,
          ariza: formData.ariza,
          teslim_tarihi: formData.teslim_tarihi || undefined,
        });
        toast.success('Servis kaydı oluşturuldu!');
      }
      setShowForm(false);
      setEditingService(null);
      setFormData({ imei: '', marka: '', model: '', musteri_adi: '', ariza: '', teslim_tarihi: '' });
      setMarkaInputValue('');
      setModelInputValue('');
      loadServices();
    } catch (err: any) {
      // Hata toast interceptor tarafından gösterilecek
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: any) => {
    setEditingService(service.id);
    setFormData({
      imei: service.imei || '',
      marka: service.marka || service.product?.marka || '',
      model: service.model || service.product?.model || '',
      musteri_adi: service.musteri_adi,
      ariza: service.ariza,
      teslim_tarihi: service.teslim_tarihi ? new Date(service.teslim_tarihi).toISOString().split('T')[0] : '',
    });
    setMarkaInputValue(service.marka || service.product?.marka || '');
    setModelInputValue(service.model || service.product?.model || '');
    setShowForm(true);
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    setStatusUpdateId(id);
    try {
      await servicesApi.update(id, { durum: newStatus });
      toast.success('Servis durumu güncellendi!');
      loadServices();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Durum güncellenemedi');
    } finally {
      setStatusUpdateId(null);
    }
  };

  const getStatusColor = (durum: string) => {
    switch (durum) {
      case 'alindi':
        return 'bg-blue-100 text-blue-800';
      case 'tamirde':
        return 'bg-yellow-100 text-yellow-800';
      case 'parca_bekliyor':
        return 'bg-orange-100 text-orange-800';
      case 'teslim_edildi':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await servicesApi.delete(id);
      toast.success('Servis kaydı başarıyla silindi');
      setDeleteConfirm(null);
      loadServices();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Servis kaydı silinemedi');
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
          <h1 className="text-3xl font-bold text-gray-800">Teknik Servis</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'İptal' : 'Yeni Servis'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6 max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {editingService ? 'Servis Kaydını Düzenle' : 'Yeni Servis Kaydı'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IMEI (Opsiyonel)
              </label>
              <input
                type="text"
                value={formData.imei}
                onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                maxLength={15}
                placeholder="IMEI giriniz (15 haneli)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marka *
              </label>
              <Autocomplete
                value={markaInputValue}
                onChange={(value) => {
                  setMarkaInputValue(value);
                  setFormData({ ...formData, marka: value, model: '' });
                  setModelInputValue('');
                }}
                options={phoneBrands}
                placeholder="Marka seçin veya yazın"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model *
              </label>
              <Autocomplete
                value={modelInputValue}
                onChange={(value) => {
                  setModelInputValue(value);
                  setFormData({ ...formData, model: value });
                }}
                options={availableModels}
                placeholder={formData.marka ? `${formData.marka} modeli seçin veya yazın` : 'Önce marka seçin'}
                disabled={!formData.marka}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Müşteri Adı *
              </label>
              <input
                type="text"
                value={formData.musteri_adi}
                onChange={(e) => setFormData({ ...formData, musteri_adi: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arıza Açıklaması *
              </label>
              <textarea
                value={formData.ariza}
                onChange={(e) => setFormData({ ...formData, ariza: e.target.value })}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tahmini Teslim Tarihi
              </label>
              <input
                type="date"
                value={formData.teslim_tarihi}
                onChange={(e) => setFormData({ ...formData, teslim_tarihi: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingService(null);
                  setFormData({ imei: '', marka: '', model: '', musteri_adi: '', ariza: '', teslim_tarihi: '' });
                  setMarkaInputValue('');
                  setModelInputValue('');
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Kaydediliyor...' : editingService ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
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
                placeholder="IMEI, marka, model, müşteri veya arıza ile ara..."
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
            <select
              value={filterDurum}
              onChange={(e) => setFilterDurum(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="alindi">Alındı</option>
              <option value="tamirde">Tamirde</option>
              <option value="parca_bekliyor">Parça Bekliyor</option>
              <option value="teslim_edildi">Teslim Edildi</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Marka/Model</th>
                <th className="text-left p-2">IMEI</th>
                <th className="text-left p-2">Müşteri</th>
                <th className="text-left p-2">Arıza</th>
                <th className="text-left p-2">Durum</th>
                <th className="text-left p-2">Teslim Tarihi</th>
                <th className="text-left p-2">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {paginatedServices.map((service) => (
                <tr key={service.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">
                    {service.marka || service.product?.marka || '-'} {service.model || service.product?.model || ''}
                  </td>
                  <td className="p-2">{service.imei || service.product?.imei || '-'}</td>
                  <td className="p-2">{service.musteri_adi}</td>
                  <td className="p-2">{service.ariza}</td>
                  <td className="p-2">
                    <select
                      value={service.durum}
                      onChange={(e) => handleStatusUpdate(service.id, e.target.value)}
                      disabled={statusUpdateId === service.id}
                      className={`px-2 py-1 rounded text-xs border-0 ${getStatusColor(service.durum)} cursor-pointer disabled:opacity-50`}
                    >
                      <option value="alindi">Alındı</option>
                      <option value="tamirde">Tamirde</option>
                      <option value="parca_bekliyor">Parça Bekliyor</option>
                      <option value="teslim_edildi">Teslim Edildi</option>
                    </select>
                  </td>
                  <td className="p-2">
                    {service.teslim_tarihi
                      ? new Date(service.teslim_tarihi).toLocaleDateString('tr-TR')
                      : '-'}
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Düzenle"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(service.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredServices.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || filterDurum !== 'all' ? 'Arama/filtre sonucu bulunamadı' : 'Servis kaydı bulunamadı'}
            </div>
          )}
          {filteredServices.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredServices.length}
            />
          )}
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Servis Kaydını Sil</h3>
            <p className="text-gray-600 mb-6">
              Bu servis kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz. Eğer servis teslim edilmemişse, ürün stok durumuna geri dönecektir.
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

export default Servis;

