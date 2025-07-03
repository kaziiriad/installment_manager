import React from 'react';

export const TestDashboard: React.FC = () => {
  console.log('TestDashboard component rendered');
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Admin Dashboard</h1>
      <p>This is a test component to isolate the issue</p>
    </div>
  );
};