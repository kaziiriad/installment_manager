// This is a completely isolated component with NO imports except React
const IsolatedDashboard = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Isolated Admin Dashboard</h1>
      <p style={{ marginBottom: '8px' }}>This component has no dependencies or imports.</p>
      <p style={{ marginBottom: '8px' }}>If you can see this, the route itself is working.</p>
      <p style={{ color: 'green', fontWeight: 'bold' }}>✓ Route is functional</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <pre>{JSON.stringify({ timestamp: new Date().toISOString() }, null, 2)}</pre>
      </div>
    </div>
  );
};

export default IsolatedDashboard;