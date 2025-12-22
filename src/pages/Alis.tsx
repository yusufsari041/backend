import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import { productsApi, purchasesApi } from '../services/api';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { phoneBrands, phoneModels, phoneColors } from '../data/phoneData';
import Autocomplete from '../components/Autocomplete';

const Alis = () => {
  const navigate = useNavigate();
  const [imei, setImei] = useState('');
  const [imeiValid, setImeiValid] = useState(false);
  const [imeiError, setImeiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    urun_tipi: 'telefon',
    marka: '',
    model: '',
    renk: '',
    alis_fiyati: '',
    satis_fiyati: '',
    tedarikci: '',
    imei_durum: 'Kayıtlı',
  });
  const [markaInputValue, setMarkaInputValue] = useState('');
  const [modelInputValue, setModelInputValue] = useState('');
  const [renkInputValue, setRenkInputValue] = useState('');

  const availableModels = useMemo(() => {
    if (!formData.marka || !phoneModels[formData.marka]) {
      return [];
    }
    return phoneModels[formData.marka];
  }, [formData.marka]);

  useEffect(() => {
    setMarkaInputValue(formData.marka);
  }, [formData.marka]);

  useEffect(() => {
    setModelInputValue(formData.model);
  }, [formData.model]);

  useEffect(() => {
    setRenkInputValue(formData.renk);
  }, [formData.renk]);

  const handleImeiChange = async (value: string) => {
    setImei(value);
    setImeiValid(false);
    setImeiError('');

    if (value.length === 15) {
      try {
        const result = await productsApi.validateImei(value);
        if (result.valid) {
          setImeiValid(true);
        } else {
          setImeiError(result.error || 'IMEI doğrulanamadı');
        }
      } catch (err: any) {
        setImeiError(err.response?.data?.message || 'IMEI kontrol edilemedi');
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Resim boyutu 5MB\'dan küçük olmalıdır');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProductImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (imei && !imeiValid) {
      toast.error('Lütfen geçerli bir IMEI girin');
      return;
    }

    if (!formData.marka?.trim()) {
      toast.error('Marka alanı zorunludur');
      return;
    }

    if (!formData.model?.trim()) {
      toast.error('Model alanı zorunludur');
      return;
    }

    const alisFiyati = parseFloat(formData.alis_fiyati);
    if (!formData.alis_fiyati || isNaN(alisFiyati) || alisFiyati <= 0) {
      toast.error('Alış fiyatı 0\'dan büyük olmalıdır');
      return;
    }

    let satisFiyati: number | undefined;
    if (formData.satis_fiyati) {
      satisFiyati = parseFloat(formData.satis_fiyati);
      if (isNaN(satisFiyati) || satisFiyati < 0) {
        toast.error('Satış fiyatı 0 veya daha büyük olmalıdır');
        return;
      }
    }

    setLoading(true);
    try {
      const purchaseData: any = {
        imei: imei || undefined,
        urun_tipi: formData.urun_tipi,
        marka: formData.marka.trim(),
        model: formData.model.trim(),
        alis_fiyati: alisFiyati,
        satis_fiyati: satisFiyati,
        tedarikci: formData.tedarikci?.trim() || undefined,
        imei_durum: imei ? formData.imei_durum : undefined,
      };

      if (formData.renk?.trim()) {
        purchaseData.renk = formData.renk.trim();
      }

      const purchase = await purchasesApi.create(purchaseData);

      if (productImage && purchase?.product_id) {
        try {
          await productsApi.addImage(purchase.product_id, productImage);
        } catch (imgErr: any) {
          console.error('Resim kaydedilemedi:', imgErr);
          toast.error('Alış kaydı oluşturuldu ancak resim kaydedilemedi');
        }
      } else if (productImage && imei) {
        try {
          const product = await productsApi.findByImei(imei);
          if (product?.id) {
            await productsApi.addImage(product.id, productImage);
          }
        } catch (imgErr: any) {
          console.error('Resim kaydedilemedi:', imgErr);
          toast.error('Alış kaydı oluşturuldu ancak resim kaydedilemedi');
        }
      }

      toast.success('Alış kaydı başarıyla oluşturuldu!');
      navigate('/');
    } catch (err: any) {
      console.error('Alış kaydı hatası:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Alış kaydı oluşturulurken bir hata oluştu';
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
        <h1 className="text-3xl font-bold text-gray-800">Alış İşlemi</h1>
      </div>

      <div className="flex gap-6">
        <div className="bg-white rounded-lg shadow p-6 flex-1 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IMEI (15 haneli) - Telefonlar için zorunlu
            </label>
            <input
              type="text"
              value={imei}
              onChange={(e) => handleImeiChange(e.target.value)}
              maxLength={15}
              placeholder="IMEI giriniz (aksesuar için boş bırakılabilir)"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                imeiError
                  ? 'border-red-500 focus:ring-red-500'
                  : imeiValid
                  ? 'border-green-500 focus:ring-green-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {imeiError && <p className="text-red-600 text-sm mt-1">{imeiError}</p>}
            {imeiValid && <p className="text-green-600 text-sm mt-1">IMEI doğrulandı</p>}
          </div>

          {(imeiValid || !imei) && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ürün Tipi
                </label>
                <select
                  value={formData.urun_tipi}
                  onChange={(e) => setFormData({ ...formData, urun_tipi: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="telefon">Telefon</option>
                  <option value="aksesuar">Aksesuar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marka *
                </label>
                <Autocomplete
                  value={markaInputValue}
                  onChange={(value) => {
                    setMarkaInputValue(value);
                    const previousMarka = formData.marka;
                    if (previousMarka !== value && value) {
                      setFormData({ ...formData, marka: value, model: '' });
                      setModelInputValue('');
                    } else {
                      setFormData({ ...formData, marka: value });
                    }
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
                  Renk
                </label>
                <Autocomplete
                  value={renkInputValue}
                  onChange={(value) => {
                    setRenkInputValue(value);
                    setFormData({ ...formData, renk: value });
                  }}
                  options={phoneColors}
                  placeholder="Renk seçin veya yazın"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alış Fiyatı *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.alis_fiyati}
                  onChange={(e) => setFormData({ ...formData, alis_fiyati: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Satış Fiyatı
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.satis_fiyati}
                  onChange={(e) => setFormData({ ...formData, satis_fiyati: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IMEI Durumu
                </label>
                <select
                  value={formData.imei_durum}
                  onChange={(e) => setFormData({ ...formData, imei_durum: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Kayıtlı">Kayıtlı</option>
                  <option value="Kayıtsız">Kayıtsız</option>
                  <option value="Şüpheli">Şüpheli</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tedarikçi
                </label>
                <input
                  type="text"
                  value={formData.tedarikci}
                  onChange={(e) => setFormData({ ...formData, tedarikci: e.target.value })}
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
            </>
          )}
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6 w-80 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ürün Önizleme</h3>
          
          {productImage ? (
            <div className="relative mb-4">
              <img
                src={productImage}
                alt={`${formData.marka} ${formData.model}`}
                className="w-full h-64 object-contain bg-gray-50 rounded-lg border border-gray-200"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="mb-4 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto mb-3 text-gray-400" size={48} />
              <label className="cursor-pointer">
                <span className="text-sm text-gray-600">Resim Yükle</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {(formData.marka || formData.model || formData.renk || formData.alis_fiyati) && (
            <div className="space-y-3 border-t pt-4">
              {formData.marka && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Marka</p>
                  <p className="text-sm font-medium text-gray-800">{formData.marka}</p>
                </div>
              )}
              {formData.model && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Model</p>
                  <p className="text-sm font-medium text-gray-800">{formData.model}</p>
                </div>
              )}
              {formData.renk && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Renk</p>
                  <p className="text-sm font-medium text-gray-800">{formData.renk}</p>
                </div>
              )}
              {formData.alis_fiyati && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Alış Fiyatı</p>
                  <p className="text-sm font-medium text-blue-600">{parseFloat(formData.alis_fiyati).toLocaleString('tr-TR')} ₺</p>
                </div>
              )}
              {formData.satis_fiyati && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Satış Fiyatı</p>
                  <p className="text-sm font-medium text-green-600">{parseFloat(formData.satis_fiyati).toLocaleString('tr-TR')} ₺</p>
                </div>
              )}
              {formData.tedarikci && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tedarikçi</p>
                  <p className="text-sm font-medium text-gray-800">{formData.tedarikci}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Alis;

