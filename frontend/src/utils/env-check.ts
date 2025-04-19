// Add this file to check if environment variables are loaded correctly
// Import this in your App.tsx or main.tsx

export function checkEnvironmentVariables() {
  console.log('Environment check:');
  console.log('NODE_ENV:', import.meta.env.MODE);
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL || 'http://localhost:8000');
  
  // Add any other environment variables your app depends on
  
  // Check if API URL is defined in production
  if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
    console.warn('Warning: VITE_API_URL is not defined in production environment');
  }
}