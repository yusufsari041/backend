import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import { productsApi, salesApi } from '../services/api';
import { ArrowLeft } from 'lucide-react';
import Autocomplete from '../components/Autocomplete';

const Satis = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    musteri_adi: '',
    satis_fiyati: '',
    odeme_tipi: 'nakit',
  });
  const [loading, setLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const productOptions = useMemo(() => {
    return products.map((product) => `${product.imei || 'IMEI Yok'} - ${product.marka} ${product.model}`);
  }, [products]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsApi.findAll({ durum: 'stokta' });
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Ürünler yüklenemedi:', err);
      toast.error('Ürünler yüklenemedi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      toast.error('Lütfen bir ürün seçin');
      return;
    }

    const satisFiyati = parseFloat(formData.satis_fiyati);
    if (!formData.satis_fiyati || isNaN(satisFiyati) || satisFiyati <= 0) {
      toast.error('Satış fiyatı 0\'dan büyük olmalıdır');
      return;
    }

    setLoading(true);
    try {
      await salesApi.create({
        product_id: selectedProduct.id,
        satis_fiyati: satisFiyati,
        musteri_adi: formData.musteri_adi?.trim() || undefined,
        odeme_tipi: formData.odeme_tipi,
      });

      toast.success('Satış başarıyla tamamlandı!');
      navigate('/');
    } catch (err: any) {
      console.error('Satış hatası:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Satış işlemi sırasında bir hata oluştu';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold text-gray-800">Satış İşlemi</h1>
      </div>

      <div className="flex gap-6">
        <div className="bg-white rounded-lg shadow p-6 flex-1 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ürün Seç (IMEI) *
            </label>
            <Autocomplete
              value={productSearch}
              onChange={(value) => {
                setProductSearch(value);
                if (!value) {
                  setSelectedProduct(null);
                  return;
                }
                const product = products.find((p) => {
                  const searchText = `${p.imei || 'IMEI Yok'} - ${p.marka} ${p.model}`.toLowerCase();
                  const optionValue = `${p.imei || 'IMEI Yok'} - ${p.marka} ${p.model}`;
                  return searchText.includes(value.toLowerCase()) || optionValue === value || p.id.toString() === value;
                });
                if (product) {
                  setSelectedProduct(product);
                  if (product?.satis_fiyati) {
                    setFormData({ ...formData, satis_fiyati: product.satis_fiyati.toString() });
                  }
                } else {
                  setSelectedProduct(null);
                }
              }}
              onSelect={(value) => {
                const product = products.find((p) => {
                  const optionValue = `${p.imei || 'IMEI Yok'} - ${p.marka} ${p.model}`;
                  return optionValue === value;
                });
                if (product) {
                  setSelectedProduct(product);
                  if (product?.satis_fiyati) {
                    setFormData({ ...formData, satis_fiyati: product.satis_fiyati.toString() });
                  }
                }
              }}
              options={productOptions}
              placeholder="IMEI, marka veya model ile ara..."
              required
            />
            {selectedProduct && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                Seçili: {selectedProduct.imei || 'IMEI Yok'} - {selectedProduct.marka} {selectedProduct.model}
              </div>
            )}
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Satış Fiyatı *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.satis_fiyati}
              onChange={(e) => setFormData({ ...formData, satis_fiyati: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Müşteri Adı
            </label>
            <input
              type="text"
              value={formData.musteri_adi}
              onChange={(e) => setFormData({ ...formData, musteri_adi: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ödeme Türü *
            </label>
            <select
              value={formData.odeme_tipi}
              onChange={(e) => setFormData({ ...formData, odeme_tipi: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="nakit">Nakit</option>
              <option value="havale">Havale</option>
              <option value="kredi">Kredi Kartı</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Satış yapılıyor...' : 'Satışı Tamamla'}
          </button>
        </form>
        </div>

        {selectedProduct && (
          <div className="bg-white rounded-lg shadow p-6 w-80 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ürün Bilgileri</h3>
            
            {selectedProduct.images && selectedProduct.images.length > 0 && selectedProduct.images[0]?.image_url ? (
              <div className="mb-4">
                <img
                  src={selectedProduct.images[0].image_url}
                  alt={`${selectedProduct.marka} ${selectedProduct.model}`}
                  className="w-full h-64 object-contain bg-gray-50 rounded-lg border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="h-64 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center"><p class="text-gray-400 text-sm">Resim yüklenemedi</p></div>';
                    }
                  }}
                />
              </div>
            ) : (
              <div className="mb-4 h-64 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                <p className="text-gray-400 text-sm">Resim yok</p>
              </div>
            )}

            <div className="space-y-3 border-t pt-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">IMEI</p>
                <p className="text-sm font-medium text-gray-800">{selectedProduct.imei || 'IMEI Yok'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Marka</p>
                <p className="text-sm font-medium text-gray-800">{selectedProduct.marka}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Model</p>
                <p className="text-sm font-medium text-gray-800">{selectedProduct.model}</p>
              </div>
              {selectedProduct.renk && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Renk</p>
                  <p className="text-sm font-medium text-gray-800">{selectedProduct.renk}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-1">Alış Fiyatı</p>
                <p className="text-sm font-medium text-blue-600">
                  {selectedProduct.alis_fiyati ? parseFloat(selectedProduct.alis_fiyati).toLocaleString('tr-TR') : '0'} ₺
                </p>
              </div>
              {selectedProduct.satis_fiyati && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Önerilen Satış Fiyatı</p>
                  <p className="text-sm font-medium text-green-600">
                    {parseFloat(selectedProduct.satis_fiyati).toLocaleString('tr-TR')} ₺
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Satis;

