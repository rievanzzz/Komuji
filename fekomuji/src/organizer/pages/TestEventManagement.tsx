import React from 'react';
import OrganizerLayout from '../components/OrganizerLayout';

const TestEventManagement: React.FC = () => {
  console.log('TestEventManagement rendering...');
  
  return (
    <OrganizerLayout title="Test Event Management">
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Test Event Management Page
          </h1>
          <p className="text-gray-600 mb-4">
            This is a test page to verify that the organizer layout and routing works correctly.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              ✅ If you can see this page, the routing and layout are working correctly!
            </p>
          </div>
        </div>
      </div>
    </OrganizerLayout>
  );
};

export default TestEventManagement;
