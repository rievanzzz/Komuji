import React from 'react';
import { FiBell, FiUser } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

interface AdminTopbarProps {
  title?: string;
}

const AdminTopbar: React.FC<AdminTopbarProps> = ({ title }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          {title && (
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
            <FiBell size={20} className="text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <FiUser className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
