import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

export const AuthDebug: React.FC = () => {
  const { user, loading, token } = useAuth();
  const [localToken, setLocalToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setLocalToken(storedToken);
    console.log('AuthDebug Component:');
    console.log('- Auth loading:', loading);
    console.log('- User:', user);
    console.log('- Token from context:', token);
    console.log('- Token from localStorage:', storedToken);
  }, [user, loading, token]);

  return (
    <div style={{ padding: '40px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Auth Debug Information</h1>
      
      <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Auth State</h2>
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
        <p><strong>User Role:</strong> {user?.role || 'N/A'}</p>
      </div>

      <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Token Information</h2>
        <p><strong>Token in Context:</strong> {token ? `${token.substring(0, 20)}...` : 'null'}</p>
        <p><strong>Token in localStorage:</strong> {localToken ? `${localToken.substring(0, 20)}...` : 'null'}</p>
      </div>

      <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Navigation Test</h2>
        <button 
          onClick={() => window.location.href = '/admin/dashboard'} 
          style={{ marginRight: '10px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Go to /admin/dashboard
        </button>
        <button 
          onClick={() => window.location.href = '/admin/dashboard-component'} 
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Go to /admin/dashboard-component
        </button>
      </div>
    </div>
  );
};

export default AuthDebug;