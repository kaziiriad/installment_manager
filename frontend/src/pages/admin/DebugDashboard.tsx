import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';

export const DebugDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('DebugDashboard useEffect running');
    console.log('User:', user);
    console.log('Loading:', loading);
    console.log('User role:', user?.role);
  }, [user, loading]);
  
  // No redirects, no complex logic, just display
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Debug Admin Dashboard</h1>
      <h2>Debug Information:</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
        {JSON.stringify({
          user: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          } : null,
          loading,
          timestamp: new Date().toISOString()
        }, null, 2)}
      </pre>
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};