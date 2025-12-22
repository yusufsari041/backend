import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { usersApi } from '../services/api';
import { ArrowLeft, User, Mail, Lock, Camera, Users, Settings, UserPlus, Edit, Trash2, Save, X } from 'lucide-react';
import { getRoleLabel, getRoleBadgeClass } from '../utils/roleUtils';

const Profil = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'users' | 'admin'>('profile');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any>(null);

  const [createForm, setCreateForm] = useState({
    ad_soyad: '',
    email: '',
    sifre: '',
    rol: 'personel',
  });

  const [editForm, setEditForm] = useState({
    ad_soyad: '',
    email: '',
    rol: 'personel',
    aktif_mi: true,
  });
  
  const [profileForm, setProfileForm] = useState({
    ad_soyad: '',
    email: '',
    profil_fotografi: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    yeni_sifre: '',
    yeni_sifre_tekrar: '',
  });

  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [userPasswordForm, setUserPasswordForm] = useState({
    yeni_sifre: '',
    yeni_sifre_tekrar: '',
  });

  useEffect(() => {
    loadProfile();
    if (currentUser?.rol === 'admin') {
      loadUsers();
    }
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

  const loadUsers = async () => {
    try {
      const data = await usersApi.findAll();
      setUsers(data);
    } catch (err: any) {
      toast.error('Kullanıcılar yüklenemedi');
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

  const handleUserPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) {
      toast.error('Lütfen bir kullanıcı seçin');
      return;
    }

    if (!userPasswordForm.yeni_sifre.trim()) {
      toast.error('Yeni şifre gereklidir');
      return;
    }

    if (userPasswordForm.yeni_sifre.length < 6) {
      toast.error('Yeni şifre en az 6 karakter olmalıdır');
      return;
    }

    if (userPasswordForm.yeni_sifre !== userPasswordForm.yeni_sifre_tekrar) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }

    setLoading(true);
    try {
      await usersApi.changeUserPassword(selectedUser, userPasswordForm.yeni_sifre);
      toast.success('Kullanıcı şifresi başarıyla değiştirildi');
      setUserPasswordForm({ yeni_sifre: '', yeni_sifre_tekrar: '' });
      setSelectedUser(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Şifre değiştirilemedi';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.ad_soyad.trim() || !createForm.email.trim() || !createForm.sifre.trim()) {
      toast.error('Tüm alanlar gereklidir');
      return;
    }

    if (createForm.sifre.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);
    try {
      await usersApi.createUser(createForm);
      toast.success('Kullanıcı başarıyla oluşturuldu');
      setShowCreateModal(false);
      setCreateForm({ ad_soyad: '', email: '', sifre: '', rol: 'personel' });
      loadUsers();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Kullanıcı oluşturulamadı';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editForm.ad_soyad.trim() || !editForm.email.trim()) {
      toast.error('Ad Soyad ve Email gereklidir');
      return;
    }

    setLoading(true);
    try {
      await usersApi.updateUser(selectedUserForEdit.id, editForm);
      toast.success('Kullanıcı başarıyla güncellendi');
      setShowEditModal(false);
      setSelectedUserForEdit(null);
      loadUsers();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Kullanıcı güncellenemedi';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      return;
    }

    setLoading(true);
    try {
      await usersApi.deleteUser(userId);
      toast.success('Kullanıcı başarıyla silindi');
      loadUsers();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Kullanıcı silinemedi';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user: any) => {
    setSelectedUserForEdit(user);
    setEditForm({
      ad_soyad: user.ad_soyad,
      email: user.email,
      rol: user.rol,
      aktif_mi: user.aktif_mi,
    });
    setShowEditModal(true);
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
          Profil Ayarları
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
              {currentUser?.rol === 'admin' && (
                <>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`w-full px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-all ${
                      activeTab === 'users'
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'text-white/90 hover:bg-white/10'
                    }`}
                  >
                    <Users size={18} />
                    Kullanıcı Şifreleri
                  </button>
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`w-full px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-all ${
                      activeTab === 'admin'
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'text-white/90 hover:bg-white/10'
                    }`}
                  >
                    <Settings size={18} />
                    Admin Ayarları
                  </button>
                </>
              )}
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
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
                >
                  {loading ? 'Kaydediliyor...' : '💾 Değişiklikleri Kaydet'}
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
                  className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
                >
                  {loading ? 'Değiştiriliyor...' : '🔒 Şifreyi Değiştir'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'users' && currentUser?.rol === 'admin' && (
            <div className="space-y-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Kullanıcı Şifre Yönetimi</h3>
                <p className="text-gray-500">Diğer kullanıcıların şifrelerini yönetin</p>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 mb-6 border-2 border-yellow-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users size={20} className="text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Admin Yetkisi</h4>
                    <p className="text-sm text-gray-600">Bu işlem sadece admin kullanıcılar tarafından yapılabilir.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kullanıcı Seç
                </label>
                <select
                  value={selectedUser || ''}
                  onChange={(e) => setSelectedUser(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Kullanıcı seçiniz</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.ad_soyad} ({user.email}) - {getRoleLabel(user.rol)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedUser && (
                <form onSubmit={handleUserPasswordChange} className="space-y-5 bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {users.find(u => u.id === selectedUser)?.ad_soyad} için şifre belirle
                    </h4>
                    <p className="text-sm text-gray-500">Yeni şifre en az 6 karakter olmalıdır</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Yeni Şifre
                    </label>
                    <input
                      type="password"
                      value={userPasswordForm.yeni_sifre}
                      onChange={(e) => setUserPasswordForm({ ...userPasswordForm, yeni_sifre: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                      placeholder="En az 6 karakter"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Yeni Şifre (Tekrar)
                    </label>
                    <input
                      type="password"
                      value={userPasswordForm.yeni_sifre_tekrar}
                      onChange={(e) => setUserPasswordForm({ ...userPasswordForm, yeni_sifre_tekrar: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                      placeholder="Şifreyi tekrar giriniz"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-3 rounded-lg hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
                    >
                      {loading ? 'Değiştiriliyor...' : '🔑 Kullanıcı Şifresini Değiştir'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'admin' && currentUser?.rol === 'admin' && (
            <div className="space-y-6">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Kullanıcı Yönetimi</h3>
                  <p className="text-gray-500">Sistem kullanıcılarını yönetin</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <UserPlus size={20} />
                  Yeni Kullanıcı
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Ad Soyad</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Rol</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Durum</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {user.profil_fotografi ? (
                              <img 
                                src={user.profil_fotografi} 
                                alt={user.ad_soyad} 
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                                {user.ad_soyad.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="font-medium text-gray-800">{user.ad_soyad}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                            <span className={getRoleBadgeClass(user.rol)}>
                            {getRoleLabel(user.rol)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.aktif_mi 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {user.aktif_mi ? '✓ Aktif' : '✗ Pasif'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Düzenle"
                            >
                              <Edit size={18} />
                            </button>
                            {user.id !== currentUser?.id && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={loading}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                title="Sil"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Yeni Kullanıcı</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ad Soyad</label>
                <input
                  type="text"
                  value={createForm.ad_soyad}
                  onChange={(e) => setCreateForm({ ...createForm, ad_soyad: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Şifre</label>
                <input
                  type="password"
                  value={createForm.sifre}
                  onChange={(e) => setCreateForm({ ...createForm, sifre: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rol</label>
                <select
                  value={createForm.rol}
                  onChange={(e) => setCreateForm({ ...createForm, rol: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="personel">Personel</option>
                  <option value="admin">Yönetici</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {loading ? 'Oluşturuluyor...' : 'Oluştur'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedUserForEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Kullanıcı Düzenle</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ad Soyad</label>
                <input
                  type="text"
                  value={editForm.ad_soyad}
                  onChange={(e) => setEditForm({ ...editForm, ad_soyad: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rol</label>
                <select
                  value={editForm.rol}
                  onChange={(e) => setEditForm({ ...editForm, rol: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="personel">Personel</option>
                  <option value="admin">Yönetici</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.aktif_mi}
                    onChange={(e) => setEditForm({ ...editForm, aktif_mi: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">Aktif</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Profil;

