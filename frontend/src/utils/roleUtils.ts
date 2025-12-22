export const getRoleLabel = (rol: string): string => {
  switch (rol) {
    case 'admin':
      return 'Yönetici';
    case 'personel':
      return 'Personel';
    default:
      return rol;
  }
};

export const getRoleBadgeClass = (rol: string): string => {
  switch (rol) {
    case 'admin':
      return 'role-badge-admin bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg border-2 border-amber-300 hover:shadow-xl transition-all duration-300 transform hover:scale-105';
    case 'personel':
      return 'role-badge-personel bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/50 border-2 border-blue-400 hover:shadow-xl hover:shadow-blue-500/60 transition-all duration-300 transform hover:scale-105';
    default:
      return 'bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold';
  }
};

export const isAdmin = (rol: string | undefined): boolean => {
  return rol === 'admin';
};

