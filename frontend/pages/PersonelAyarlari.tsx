import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import { usersApi } from '../services/api';
import { ArrowLeft, User, Mail, Lock, Camera, Save } from 'lucide-react';
import { getRoleLabel, getRoleBadgeClass } from '../utils/roleUtils';

const PersonelAyarlari = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  
  const [profileForm, setProfileForm] = useState({
    ad_soyad: '',
    email: '',
    profil_fotografi: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    yeni_sifre: '',
    yeni_sifre_tekrar: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await usersApi.getProfile();
      setProfile(data);
      setProfileForm({
        ad_soyad: data.ad_soyad || '',
        email: data.email || '',
        profil_fotografi: data.profil_fotografi || '',
      });
    } catch (err: any) {
      toast.error('Profil yüklenemedi');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileForm.email.trim()) {
      toast.error('Email gereklidir');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileForm.email.trim())) {
      toast.error('Geçerli bir email adresi giriniz');
      return;
    }

    setLoading(true);
    try {
      const updated = await usersApi.updateProfile({
        ad_soyad: profileForm.ad_soyad,
        email: profileForm.email,
        profil_fotografi: profileForm.profil_fotografi || undefined,
      });
      setProfile(updated);
      toast.success('Profil güncellendi');
      window.location.reload();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Profil güncellenemedi';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordForm.yeni_sifre.trim()) {
      toast.error('Yeni şifre gereklidir');
      return;
    }

    if (passwordForm.yeni_sifre.length < 6) {
      toast.error('Yeni şifre en az 6 karakter olmalıdır');
      return;
    }

    if (passwordForm.yeni_sifre !== passwordForm.yeni_sifre_tekrar) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }

    setLoading(true);
    try {
      await usersApi.changePassword(passwordForm.yeni_sifre);
      toast.success('Şifre başarıyla değiştirildi');
      setPasswordForm({ yeni_sifre: '', yeni_sifre_tekrar: '' });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Şifre değiştirilemedi';
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
          className="p-2 hover:bg-gray-100 rounded transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Personel Ayarları
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center overflow-hidden mb-4 border-4 border-white/30">
                {profileForm.profil_fotografi ? (
                  <img src={profileForm.profil_fotografi} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-white" />
                )}
              </div>
              <h2 className="text-xl font-bold">{profile?.ad_soyad || 'Kullanıcı'}</h2>
              <p className="text-white/80 text-sm mt-1">{profile?.email}</p>
              <div className="mt-3">
                <span className={getRoleBadgeClass(profile?.rol || '')}>
                  {getRoleLabel(profile?.rol || '')}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-white/20 pt-4">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-all ${
                  activeTab === 'profile'
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                <User size={18} />
                Profil Bilgileri
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`w-full px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-all ${
                  activeTab === 'password'
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                <Lock size={18} />
                Şifre Değiştir
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6">
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Profil Bilgileri</h3>
                    <p className="text-gray-500">Hesap bilgilerinizi güncelleyin</p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-6">
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center overflow-hidden shadow-lg ring-4 ring-white">
                        {profileForm.profil_fotografi ? (
                          <img src={profileForm.profil_fotografi} alt="Profil" className="w-full h-full object-cover" />
                        ) : (
                          <User size={64} className="text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Profil Fotoğrafı
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={profileForm.profil_fotografi}
                            onChange={(e) => setProfileForm({ ...profileForm, profil_fotografi: e.target.value })}
                            placeholder="https://example.com/foto.jpg veya dosya seçin"
                            className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            id="profile-photo-upload"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const base64String = reader.result as string;
                                  setProfileForm({ ...profileForm, profil_fotografi: base64String });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <label
                            htmlFor="profile-photo-upload"
                            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 cursor-pointer flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
                          >
                            <Camera size={18} />
                            Dosya Seç
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Profil fotoğrafı için URL girebilir veya bilgisayarınızdan dosya seçebilirsiniz</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ad Soyad
                      </label>
                      <input
                        type="text"
                        value={profileForm.ad_soyad}
                        onChange={(e) => setProfileForm({ ...profileForm, ad_soyad: e.target.value })}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Mail size={16} className="text-blue-500" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Rol
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={getRoleLabel(profile?.rol || '')}
                          disabled
                          className={`w-full px-4 py-2.5 border-2 rounded-lg font-medium cursor-not-allowed ${
                            profile?.rol === 'admin' 
                              ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-300 text-red-700' 
                              : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 text-gray-700'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                      <Save size={18} />
                      {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'password' && (
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Şifre Değiştir</h3>
                    <p className="text-gray-500">Hesabınızın güvenliği için güçlü bir şifre kullanın</p>
                  </div>

                  <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 mb-6 border-2 border-red-100">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Lock size={20} className="text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Güvenlik İpucu</h4>
                        <p className="text-sm text-gray-600">Şifreniz en az 6 karakter olmalı ve harf, rakam içermelidir.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Yeni Şifre
                      </label>
                      <input
                        type="password"
                        value={passwordForm.yeni_sifre}
                        onChange={(e) => setPasswordForm({ ...passwordForm, yeni_sifre: e.target.value })}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="En az 6 karakter"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Yeni Şifre (Tekrar)
                      </label>
                      <input
                        type="password"
                        value={passwordForm.yeni_sifre_tekrar}
                        onChange={(e) => setPasswordForm({ ...passwordForm, yeni_sifre_tekrar: e.target.value })}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Şifreyi tekrar giriniz"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                      <Lock size={18} />
                      {loading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PersonelAyarlari;

