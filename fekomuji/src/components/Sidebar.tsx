import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiCalendar, 
  FiUsers, 
  FiDollarSign, 
  FiSettings, 
  FiBarChart,
  FiLogOut 
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/organizer',
      icon: FiHome
    },
    {
      name: 'Event Management',
      path: '/organizer/events',
      icon: FiCalendar
    },
    {
      name: 'Participants',
      path: '/organizer/participants',
      icon: FiUsers
    },
    {
      name: 'Finance',
      path: '/organizer/finance',
      icon: FiDollarSign
    },
    {
      name: 'Tickets',
      path: '/organizer/tickets',
      icon: FiBarChart
    },
    {
      name: 'Settings',
      path: '/organizer/settings',
      icon: FiSettings
    }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Komuji Panel</h1>
          <p className="text-sm text-gray-500 mt-1">Event Organizer</p>
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200
                      ${isActive 
                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
          >
            <FiLogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
