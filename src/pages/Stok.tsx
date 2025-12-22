import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import { productsApi } from '../services/api';
import { ArrowLeft, Trash2, Search, X, Edit } from 'lucide-react';
import Autocomplete from '../components/Autocomplete';
import { phoneBrands, phoneModels, phoneColors } from '../data/phoneData';
import Pagination from '../components/Pagination';

const Stok = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteWithRelations, setDeleteWithRelations] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    marka: '',
    model: '',
    renk: '',
    alis_fiyati: '',
    satis_fiyati: '',
    durum: 'stokta',
  });
  const [markaInputValue, setMarkaInputValue] = useState('');
  const [modelInputValue, setModelInputValue] = useState('');
  const [renkInputValue, setRenkInputValue] = useState('');

  useEffect(() => {
    loadProducts();
  }, [filter]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (filter !== 'all') {
        filters.durum = filter;
      }
      const data = await productsApi.findAll(filters);
      setProducts(data);
    } catch (err) {
      console.error('Ürünler yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (durum: string) => {
    switch (durum) {
      case 'stokta':
        return 'bg-green-100 text-green-800';
      case 'satildi':
        return 'bg-blue-100 text-blue-800';
      case 'serviste':
        return 'bg-orange-100 text-orange-800';
      case 'iade':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((product) => {
        return (
          (product.imei && product.imei.toLowerCase().includes(search)) ||
          product.marka.toLowerCase().includes(search) ||
          product.model.toLowerCase().includes(search) ||
          (product.renk && product.renk.toLowerCase().includes(search))
        );
      });
    }
    
    return filtered;
  }, [products, searchTerm]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const availableModels = useMemo(() => {
    if (!editFormData.marka || !phoneModels[editFormData.marka]) {
      return [];
    }
    return phoneModels[editFormData.marka];
  }, [editFormData.marka]);

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setEditFormData({
      marka: product.marka,
      model: product.model,
      renk: product.renk || '',
      alis_fiyati: product.alis_fiyati.toString(),
      satis_fiyati: product.satis_fiyati ? product.satis_fiyati.toString() : '',
      durum: product.durum,
    });
    setMarkaInputValue(product.marka);
    setModelInputValue(product.model);
    setRenkInputValue(product.renk || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editFormData.marka?.trim() || !editFormData.model?.trim()) {
      toast.error('Marka ve model gereklidir');
      return;
    }

    const alisFiyati = parseFloat(editFormData.alis_fiyati);
    if (isNaN(alisFiyati) || alisFiyati <= 0) {
      toast.error('Alış fiyatı 0\'dan büyük olmalıdır');
      return;
    }

    setLoading(true);
    try {
      await productsApi.update(editingProduct.id, {
        marka: editFormData.marka.trim(),
        model: editFormData.model.trim(),
        renk: editFormData.renk?.trim() || null,
        alis_fiyati: alisFiyati,
        satis_fiyati: editFormData.satis_fiyati ? parseFloat(editFormData.satis_fiyati) : null,
        durum: editFormData.durum,
      });
      toast.success('Ürün başarıyla güncellendi');
      setEditingProduct(null);
      setEditFormData({ marka: '', model: '', renk: '', alis_fiyati: '', satis_fiyati: '', durum: 'stokta' });
      setMarkaInputValue('');
      setModelInputValue('');
      setRenkInputValue('');
      loadProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Ürün güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await productsApi.delete(id, deleteWithRelations);
      toast.success(deleteWithRelations ? 'Ürün ve ilişkili kayıtlar başarıyla silindi' : 'Ürün başarıyla silindi');
      setDeleteConfirm(null);
      setDeleteWithRelations(false);
      loadProducts();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Ürün silinemedi';
      toast.error(errorMessage);
      if (errorMessage.includes('ilişkilidir') && !deleteWithRelations) {
        setDeleteWithRelations(true);
      } else {
        setDeleteConfirm(null);
        setDeleteWithRelations(false);
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Stok Listesi</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="IMEI, marka, model veya renk ile ara..."
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
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Tümü
            </button>
            <button
              onClick={() => setFilter('stokta')}
              className={`px-4 py-2 rounded ${filter === 'stokta' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Stokta
            </button>
            <button
              onClick={() => setFilter('satildi')}
              className={`px-4 py-2 rounded ${filter === 'satildi' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Satıldı
            </button>
            <button
              onClick={() => setFilter('serviste')}
              className={`px-4 py-2 rounded ${filter === 'serviste' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Serviste
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Yükleniyor...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">IMEI</th>
                  <th className="text-left p-2">Marka</th>
                  <th className="text-left p-2">Model</th>
                  <th className="text-left p-2">Renk</th>
                  <th className="text-left p-2">Alış Fiyatı</th>
                  <th className="text-left p-2">Satış Fiyatı</th>
                  <th className="text-left p-2">Durum</th>
                  <th className="text-left p-2">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{product.imei || '-'}</td>
                    <td className="p-2">{product.marka}</td>
                    <td className="p-2">{product.model}</td>
                    <td className="p-2">{product.renk || '-'}</td>
                    <td className="p-2">{product.alis_fiyati} ₺</td>
                    <td className="p-2">{product.satis_fiyati || '-'} ₺</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(product.durum)}`}>
                        {product.durum}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Düzenle"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
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
            {filteredProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Arama sonucu bulunamadı' : 'Ürün bulunamadı'}
              </div>
            )}
            {filteredProducts.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredProducts.length}
              />
            )}
          </div>
        )}
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ürünü Düzenle</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marka *</label>
                <Autocomplete
                  value={markaInputValue}
                  onChange={(value) => {
                    setMarkaInputValue(value);
                    setEditFormData({ ...editFormData, marka: value, model: '' });
                    setModelInputValue('');
                  }}
                  options={phoneBrands}
                  placeholder="Marka seçin veya yazın"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                <Autocomplete
                  value={modelInputValue}
                  onChange={(value) => {
                    setModelInputValue(value);
                    setEditFormData({ ...editFormData, model: value });
                  }}
                  options={availableModels}
                  placeholder={editFormData.marka ? `${editFormData.marka} modeli seçin veya yazın` : 'Önce marka seçin'}
                  disabled={!editFormData.marka}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Renk</label>
                <Autocomplete
                  value={renkInputValue}
                  onChange={(value) => {
                    setRenkInputValue(value);
                    setEditFormData({ ...editFormData, renk: value });
                  }}
                  options={phoneColors}
                  placeholder="Renk seçin veya yazın"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alış Fiyatı *</label>
                <input
                  type="number"
                  step="0.01"
                  value={editFormData.alis_fiyati}
                  onChange={(e) => setEditFormData({ ...editFormData, alis_fiyati: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Satış Fiyatı</label>
                <input
                  type="number"
                  step="0.01"
                  value={editFormData.satis_fiyati}
                  onChange={(e) => setEditFormData({ ...editFormData, satis_fiyati: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                <select
                  value={editFormData.durum}
                  onChange={(e) => setEditFormData({ ...editFormData, durum: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="stokta">Stokta</option>
                  <option value="satildi">Satıldı</option>
                  <option value="serviste">Serviste</option>
                  <option value="iade">İade</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setEditFormData({ marka: '', model: '', renk: '', alis_fiyati: '', satis_fiyati: '', durum: 'stokta' });
                    setMarkaInputValue('');
                    setModelInputValue('');
                    setRenkInputValue('');
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
                  {loading ? 'Güncelleniyor...' : 'Güncelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ürünü Sil</h3>
            <p className="text-gray-600 mb-4">
              Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteWithRelations}
                  onChange={(e) => setDeleteWithRelations(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">
                  İlişkili alış, satış ve servis kayıtlarını da sil
                </span>
              </label>
              {deleteWithRelations && (
                <p className="text-xs text-red-600 mt-2 ml-6">
                  ⚠️ Bu işlem ürünle ilişkili tüm alış, satış ve servis kayıtlarını da silecektir.
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteConfirm(null);
                  setDeleteWithRelations(false);
                }}
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

export default Stok;

