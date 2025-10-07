import React from 'react';
import { Link } from 'react-router-dom';
import OrganizerLayout from '../components/OrganizerLayout';

const SimpleEventManagement: React.FC = () => {
  console.log('SimpleEventManagement rendering...');
  
  return (
    <OrganizerLayout title="Event Management">
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Event Management
          </h1>
          <p className="text-gray-600 mb-4">
            Kelola acara Anda di sini.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800">
              🚧 Halaman Event Management sedang dalam pengembangan...
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Debug Links:</h3>
            <div className="flex flex-col space-y-2">
              <Link 
                to="/organizer/events-full" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-fit"
              >
                🔧 Test Full Event Management
              </Link>
              <Link 
                to="/organizer/test" 
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-fit"
              >
                ✅ Test Basic Layout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </OrganizerLayout>
  );
};

export default SimpleEventManagement;
