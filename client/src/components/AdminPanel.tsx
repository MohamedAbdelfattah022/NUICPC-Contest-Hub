import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ContestManagement from './ContestManagement';
import UserManagement from './UserManagement';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('contests');

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-auto">
        {activeTab === 'contests' && <ContestManagement />}
        {activeTab === 'users' && <UserManagement />}
      </div>
    </div>
  );
};

export default AdminPanel;