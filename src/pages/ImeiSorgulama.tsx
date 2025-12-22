import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { productsApi } from '../services/api';
import { ArrowLeft, Search, Trash2 } from 'lucide-react';

interface QueryHistory {
  id: string;
  imei: string;
  tarih: string;
}

const ImeiSorgulama = () => {
  const navigate = useNavigate();
  const [imei, setImei] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('imei_query_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Geçmiş yüklenemedi:', e);
      }
    }
  }, []);

  const saveToHistory = (imei: string) => {
    const filteredHistory = history.filter(item => item.imei !== imei);
    
    const newEntry: QueryHistory = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      imei,
      tarih: new Date().toISOString(),
    };

    const updatedHistory = [newEntry, ...filteredHistory].slice(0, 50);
    setHistory(updatedHistory);
    localStorage.setItem('imei_query_history', JSON.stringify(updatedHistory));
  };

  const handleDeleteSelected = () => {
    const updatedHistory = history.filter(item => !selectedIds.includes(item.id));
    setHistory(updatedHistory);
    setSelectedIds([]);
    localStorage.setItem('imei_query_history', JSON.stringify(updatedHistory));
  };

  const handleDeleteAll = () => {
    if (window.confirm('Tüm geçmişi silmek istediğinize emin misiniz?')) {
      setHistory([]);
      setSelectedIds([]);
      localStorage.removeItem('imei_query_history');
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const performSearch = async (searchImei: string) => {
    if (!searchImei.trim()) {
      setError('Lütfen IMEI numarası giriniz');
      return;
    }

    if (searchImei.length !== 15) {
      setError('IMEI numarası tam olarak 15 haneli olmalıdır');
      return;
    }

    if (!/^\d+$/.test(searchImei)) {
      setError('IMEI numarası sadece rakamlardan oluşmalıdır');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const imeiInfo = await productsApi.lookupImei(searchImei);
      
      if (!imeiInfo.valid) {
        setError(imeiInfo.error || 'IMEI formatı geçersiz');
        setLoading(false);
        return;
      }

      if (imeiInfo.requiresEdevlet && imeiInfo.edevletUrl) {
        window.open(imeiInfo.edevletUrl, '_blank');
      }
      
      setResult({
        validation: { valid: true, message: imeiInfo.message || 'IMEI formatı geçerli' },
        imei: searchImei,
        edevletUrl: imeiInfo.edevletUrl,
      });
      saveToHistory(searchImei);
    } catch (err: any) {
      setError(err.response?.data?.message || 'IMEI sorgulanırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await performSearch(imei);
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
        <h1 className="text-3xl font-bold text-gray-800">IMEI Sorgulama</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-4xl">
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IMEI Numarası (15 haneli)
              </label>
              <input
                type="text"
                value={imei}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 15);
                  setImei(value);
                  setError('');
                  setResult(null);
                }}
                placeholder="IMEI numarasını giriniz (örn: 123456789012345)"
                maxLength={15}
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 ${
                  error
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading || imei.length !== 15}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Search size={20} />
                {loading ? 'Sorgulanıyor...' : 'Sorgula'}
              </button>
            </div>
          </div>
        </form>

        {result && (
          <div className="space-y-6 mt-6">
            <div className="border-t pt-8">
              {result.edevletUrl && (
                <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-8 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 shadow-md"></div>
                    <span className="font-bold text-yellow-900 text-xl">
                      Resmî IMEI Kayıt Sorgusu
                    </span>
                  </div>
                  <p className="text-base text-yellow-900 mb-6 leading-relaxed">
                    ✓ IMEI formatı geçerli. Resmî kayıt sorgusu için e-Devlet'e yönlendirileceksiniz.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href={result.edevletUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span className="text-lg">e-Devlet'te Sorgula</span>
                    </a>
                    {result.imei && (
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(result.imei);
                            alert('IMEI numarası panoya kopyalandı!');
                          } catch (err) {
                            alert('Kopyalama başarısız oldu. IMEI: ' + result.imei);
                          }
                        }}
                        className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>IMEI'yi Kopyala</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!result && !loading && (
          <div className="text-center py-12 text-gray-500">
            <Search size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg">IMEI numarası giriniz ve sorgulayın</p>
            <p className="text-sm mt-2">15 haneli IMEI numarasını girerek ürün bilgilerini görüntüleyebilirsiniz</p>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 max-w-4xl mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">DAHA ÖNCE İMEİ SORGULADIKLARIN</h2>
            <button
              onClick={handleDeleteAll}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2 text-sm"
            >
              <Trash2 size={16} />
              Tümünü Sil
            </button>
          </div>

          {selectedIds.length > 0 && (
            <div className="mb-4">
              <button
                onClick={handleDeleteSelected}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 flex items-center gap-2 text-sm"
              >
                <Trash2 size={16} />
                Seçilenleri Sil ({selectedIds.length})
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Seç</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">IMEI</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setImei(item.imei);
                      performSearch(item.imei);
                    }}
                  >
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleToggleSelect(item.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-3 px-4 font-mono text-sm font-medium">{item.imei}</td>
                    <td className="py-3 px-4 text-gray-600">{formatDate(item.tarih)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ImeiSorgulama;

