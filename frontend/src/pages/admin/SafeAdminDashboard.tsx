import React from 'react';

export const SafeAdminDashboard: React.FC = () => {
  console.log('SafeAdminDashboard component rendered');
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Safe Admin Dashboard</h1>
      <p>This is a safe admin dashboard component with no dependencies</p>
      <p>If you can see this, the route is working correctly.</p>
    </div>
  );
};