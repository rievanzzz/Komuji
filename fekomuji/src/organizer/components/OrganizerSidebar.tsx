import React from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiCalendar, 
  FiCreditCard, 
  FiUsers, 
  FiDollarSign, 
  FiSettings, 
  FiLogOut 
} from 'react-icons/fi';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', path: '/organizer', icon: FiHome },
  { name: 'Kelola Acara', path: '/organizer/events', icon: FiCalendar },
  { name: 'Peserta', path: '/organizer/participants', icon: FiUsers },
  { name: 'Tiket', path: '/organizer/tickets', icon: FiCreditCard },
  { name: 'Keuangan', path: '/organizer/finance', icon: FiDollarSign },
  { name: 'Pengaturan', path: '/organizer/settings', icon: FiSettings },
];

const OrganizerSidebar: React.FC = () => {
  const location = useLocation();

  const handleLogout = () => {
    // TODO: Implement logout logic
    localStorage.removeItem('token');
    window.location.href = '/signin';
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Komuji</h1>
        <p className="text-sm text-gray-500">Organizer Panel</p>
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
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

export default OrganizerSidebar;
