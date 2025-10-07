import React from 'react';
import OrganizerSidebar from './OrganizerSidebar';
import OrganizerTopbar from './OrganizerTopbar';

interface OrganizerLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const OrganizerLayout: React.FC<OrganizerLayoutProps> = ({ children, title }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <OrganizerSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <OrganizerTopbar title={title} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default OrganizerLayout;
