import React from 'react';

export const TestError: React.FC = () => {
  // This will definitely throw an error
  throw new Error('Test error to verify error boundary is working');
  
  return <div>This won't render</div>;
};