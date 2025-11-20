import React from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiUserCheck,
  FiDollarSign,
  FiBarChart,
  FiCreditCard,
  FiImage,
  FiMail,
  FiTag
} from 'react-icons/fi';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

// Sidebar yang lebih sederhana dengan fitur yang digabung
const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', path: '/admin', icon: FiHome },
  { name: 'Manajemen User', path: '/admin/users', icon: FiUsers }, // Gabung: User + Panitia
  { name: 'Kategori Event', path: '/admin/categories', icon: FiTag },
  { name: 'Keuangan', path: '/admin/finance', icon: FiDollarSign }, // Gabung: Transaksi + Withdrawal
  { name: 'Konten', path: '/admin/content', icon: FiImage }, // Gabung: Banner + Messages
  { name: 'Pengaturan', path: '/admin/settings', icon: FiSettings },
];

const AdminSidebar: React.FC = () => {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/signin';
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Komuji</h1>
        <p className="text-sm text-gray-500">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 rounded-lg" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}></div>
                  )}
                  <Icon size={20} className="relative z-10" />
                  <span className="font-medium relative z-10">{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
        >
          <FiLogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
