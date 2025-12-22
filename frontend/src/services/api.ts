import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { Capacitor } from '@capacitor/core';

const getApiUrl = () => {
  // Electron kontrolü - birden fazla yöntemle kontrol et
  const isElectron = typeof window !== 'undefined' && (
    (window as any).process?.type === 'renderer' ||
    (window as any).electron ||
    navigator.userAgent.toLowerCase().includes('electron')
  );
  
  const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  console.log('🔍 Platform kontrolü:', {
    isElectron,
    isDev,
    hostname,
    userAgent: navigator.userAgent.toLowerCase().includes('electron'),
    envUrl: import.meta.env.VITE_API_URL
  });
  
  // Electron development modunda HER ZAMAN localhost backend kullan (environment variable'ı ignore et)
  if (isElectron && isDev) {
    console.log('🖥️ Electron development modu - localhost backend kullanılıyor (env variable ignore edildi)');
    return 'http://localhost:3001';
  }
  
  // Capacitor (Android/iOS) kontrolü - ÖNCE BU KONTROL EDİLMELİ (environment variable'dan önce)
  if (Capacitor.isNativePlatform()) {
    console.log('📱 Native platform (Android/iOS) - Render.com backend kullanılıyor');
    // localStorage'da kayıtlı URL varsa onu kullan (kullanıcı manuel değiştirmişse)
    const savedUrl = localStorage.getItem('api_url');
    if (savedUrl) {
      console.log('💾 localStorage\'dan API URL:', savedUrl);
      return savedUrl;
    }
    return 'https://backend-x49x.onrender.com';
  }
  
  // localStorage'da kayıtlı URL varsa onu kullan (kullanıcı manuel değiştirmişse)
  const savedUrl = localStorage.getItem('api_url');
  if (savedUrl) {
    console.log('💾 localStorage\'dan API URL:', savedUrl);
    return savedUrl;
  }
  
  // Environment variable kontrol et (Electron değilse, Capacitor değilse)
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    console.log('🌍 Environment variable\'dan API URL:', envUrl);
    return envUrl;
  }
  
  // Web browser - development localhost, production Render.com
  if (isDev || hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('🌐 Web browser development - localhost backend kullanılıyor');
    return 'http://localhost:3001';
  }
  
  // Production - Render.com backend
  console.log('☁️ Production - Render.com backend kullanılıyor');
  return 'https://backend-x49x.onrender.com';
};

const API_URL = getApiUrl();

// Debug: API URL'ini konsola yazdır
console.log('🔗 Backend API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90000, // 90 saniye timeout (Render free plan için uyanma süresi)
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('📦 API Response:', response.data);
    
    // Backend TransformInterceptor response'u { success: true, data: {...} } formatına çeviriyor
    // response.data = { success: true, data: {...} }
    if (response.data?.success === false) {
      const message = response.data.message || 'Bir hata oluştu';
      toast.error(message);
      return Promise.reject(new Error(message));
    }
    
    // Backend'den gelen format: { success: true, data: {...} }
    // data içindeki değeri döndür
    if (response.data && typeof response.data === 'object' && 'data' in response.data && response.data.success === true) {
      console.log('✅ Response parse edildi:', response.data.data);
      return response.data.data;
    }
    
    // Eğer direkt data formatındaysa (fallback - backend interceptor çalışmamış olabilir)
    console.log('⚠️ Direct data formatı kullanılıyor:', response.data);
    return response.data;
  },
  (error: AxiosError<any>) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
      } else if (status === 403) {
        toast.error('Bu işlem için yetkiniz yok');
      } else if (status === 400 || status === 422) {
        const message = data?.message || 'Geçersiz veri';
        const errors = data?.errors;
        
        if (errors && Array.isArray(errors)) {
          errors.forEach((err: any) => {
            const errorMsg = typeof err === 'string' ? err : err.message || Object.values(err.constraints || {}).join(', ');
            toast.error(errorMsg);
          });
        } else {
          toast.error(message);
        }
      } else if (status >= 500) {
        toast.error('Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.');
      } else {
        const message = data?.message || 'Bir hata oluştu';
        toast.error(message);
      }
    } else if (error.request) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        toast.error('Backend sunucusuna bağlanılamadı. Lütfen backend servisinin çalıştığından emin olun.');
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        toast.error('Bağlantı zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        toast.error('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      }
    } else {
      toast.error('Bir hata oluştu');
    }

    return Promise.reject(error);
  },
);

// Retry mekanizması - Render free plan için backend uyanma süresi
const retryRequest = async (requestFn: () => Promise<any>, maxRetries = 4, delay = 2000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error: any) {
      // Son deneme veya network hatası değilse direkt fırlat
      const isNetworkError = error.code === 'ECONNREFUSED' || 
                            error.code === 'ERR_NETWORK' || 
                            error.code === 'ETIMEDOUT' ||
                            error.code === 'ECONNABORTED' ||
                            (error.response?.status >= 500 && error.response?.status < 600);
      
      if (i === maxRetries - 1 || !isNetworkError) {
        throw error;
      }
      
      // Backend uyanıyor, bekle ve tekrar dene
      console.log(`🔄 Backend uyanıyor, ${delay/1000} saniye sonra tekrar deneniyor... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 1.5; // Her denemede bekleme süresini artır (max 10 saniye)
      if (delay > 10000) delay = 10000;
    }
  }
};

export const authApi = {
  login: async (email: string, sifre: string) => {
    try {
      console.log('🔐 Login isteği gönderiliyor...', { email, apiUrl: API_URL });
      const response = await retryRequest(() => api.post('/auth/login', { email, sifre }));
      console.log('✅ Login başarılı:', response);
      // Interceptor'dan sonra response zaten { token, user, requiresPasswordChange } formatında
      return response;
    } catch (error: any) {
      console.error('❌ Login hatası:', error);
      console.error('Hata detayları:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
      });
      throw error;
    }
  },
  register: async (ad_soyad: string, email: string, sifre: string, rol?: string) => {
    const response = await api.post('/auth/register', { ad_soyad, email, sifre, rol });
    return response.data || response;
  },
  changePassword: async (eski_sifre: string, yeni_sifre: string) => {
    const response = await api.post('/auth/change-password', { eski_sifre, yeni_sifre });
    return response.data || response;
  },
};

export const productsApi = {
  validateImei: async (imei: string) => {
    const response = await api.post('/products/validate-imei', { imei });
    return response.data || response;
  },
  create: async (product: any) => {
    const response = await api.post('/products', product);
    return response.data || response;
  },
  findAll: async (filters?: any) => {
    const response = await api.get('/products', { params: filters });
    return response.data || response;
  },
  findByImei: async (imei: string) => {
    try {
      const response = await api.get(`/products/imei/${imei}`);
      return response.data || response;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
  lookupImei: async (imei: string) => {
    const response = await api.post('/products/lookup-imei', { imei });
    return response.data || response;
  },
  addImage: async (productId: number, imageUrl: string) => {
    const response = await api.post(`/products/${productId}/images`, { image_url: imageUrl });
    return response.data || response;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data || response;
  },
  delete: async (id: number, force: boolean = false) => {
    const response = await api.delete(`/products/${id}`, { params: { force: force ? 'true' : 'false' } });
    return response.data || response;
  },
};

export const purchasesApi = {
  create: async (purchase: any) => {
    const response = await api.post('/purchases', purchase);
    return response.data || response;
  },
  findAll: async () => {
    const response = await api.get('/purchases');
    return response.data || response;
  },
};

export const salesApi = {
  create: async (sale: any) => {
    const response = await api.post('/sales', sale);
    return response.data || response;
  },
  findAll: async () => {
    const response = await api.get('/sales');
    return response.data || response;
  },
  getStats: async () => {
    const response = await api.get('/sales/stats');
    return response.data || response;
  },
};

export const servicesApi = {
  create: async (service: any) => {
    const response = await api.post('/services', service);
    return response.data || response;
  },
  findAll: async () => {
    const response = await api.get('/services');
    return response.data || response;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/services/${id}`, data);
    return response.data || response;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/services/${id}`);
    return response.data || response;
  },
};

export const financeApi = {
  create: async (finance: any) => {
    const response = await api.post('/finance', finance);
    return response.data || response;
  },
  findAll: async (filters?: any) => {
    const response = await api.get('/finance', { params: filters });
    return response.data || response;
  },
  getStats: async () => {
    const response = await api.get('/finance/stats');
    return response.data || response;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/finance/${id}`);
    return response.data || response;
  },
};

export const usersApi = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data || response;
  },
  updateProfile: async (data: { email?: string; ad_soyad?: string; profil_fotografi?: string }) => {
    const response = await api.put('/users/profile', data);
    return response.data || response;
  },
  changePassword: async (yeni_sifre: string) => {
    const response = await api.put('/users/profile/password', { yeni_sifre });
    return response.data || response;
  },
  findAll: async () => {
    const response = await api.get('/users');
    return response.data || response;
  },
  findOne: async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data || response;
  },
  changeUserPassword: async (userId: number, yeni_sifre: string) => {
    const response = await api.put(`/users/${userId}/password`, { yeni_sifre });
    return response.data || response;
  },
  createUser: async (userData: { ad_soyad: string; email: string; sifre: string; rol: string }) => {
    const response = await api.post('/users', userData);
    return response.data || response;
  },
  updateUser: async (userId: number, userData: { ad_soyad?: string; email?: string; rol?: string; aktif_mi?: boolean }) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data || response;
  },
  deleteUser: async (userId: number) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data || response;
  },
};

export default api;

