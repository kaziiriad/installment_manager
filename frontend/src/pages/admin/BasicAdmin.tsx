import React from 'react';

const BasicAdmin = () => {
  return (
    <div style={{ padding: '40px', backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px', color: '#333' }}>Admin Dashboard</h1>
      <p style={{ fontSize: '18px', color: '#666' }}>Welcome to the admin dashboard.</p>
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>System Status</h2>
        <p>All systems operational</p>
      </div>
    </div>
  );
};

export default BasicAdmin;