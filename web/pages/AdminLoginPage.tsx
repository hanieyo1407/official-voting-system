// web/pages/AdminLoginPage.tsx

import React, { useState } from 'react';
import { AdminUser } from '../types';
import Button from '../components/Button';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import axios, { isAxiosError } from 'axios';
import sjbuApi from '../src/api/sjbuApi'; // Import API client

interface AdminLoginPageProps {
  // REMOVED: adminUsers is no longer needed as the login is handled by the API
  // adminUsers: AdminUser[]; 
  onLoginSuccess: (user: AdminUser) => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Replaced mock handleLogin with live API call
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        // API Endpoint: POST /admin/login
        const response = await sjbuApi.post('/admin/login', {
            // CRITICAL FIX: Backend expects 'email', not 'username'.
            // The user input in the "Username" field is actually the email.
            email: username, // CHANGED from 'username' to 'email'
            password: password,
        });
        
        // The API successfully sets the admin token cookie
        if (response.status === 200) {
            // The API response body contains the admin profile: { "admin": { ... } } (Inferred/Page 3)
            const adminProfile: AdminUser = response.data.admin;
            
            // Successful login
            onLoginSuccess(adminProfile); 
        } else {
            // This is a safety net; axios typically throws for non-2xx status
            setError('An unexpected server response occurred.');
        }

    } catch (err) {
        // Use the universally available imported function
        if (isAxiosError(err) && err.response) { 
            const status = err.response.status;
            
            if (status === 401 || status === 404) {
                // Unauthorized or Admin not found (API docs page 3)
                setError('Invalid username or password. Please check your credentials.');
            } else {
                 // Other errors (500, etc.)
                setError(`Login failed: Server Error (${status}).`);
            }
        } else {
            setError('Network or server connection failed. Check your API URL.');
        }
    } finally  {
      setIsLoading(false);
      // Clear password field after attempt for security
      setPassword(''); 
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 bg-gray-50">
      <div className="max-w-md w-full">
        <h2 className="text-center text-3xl font-extrabold text-dmi-blue-900 mb-6">
          Admin Portal Login
        </h2>
        <Card>
          <form onSubmit={handleLogin}>
            <div className="p-8 space-y-6">
              <div>
                <label
                  // NOTE: Changed htmlFor to 'email' for better semantics, but kept input name as 'username' to match state
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email" // Changed ID to 'email'
                  name="username" // Keeps state binding simple
                  type="text"
                  autoComplete="email" // Changed autocomplete
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-dmi-blue-500 focus:border-dmi-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-dmi-blue-500 focus:border-dmi-blue-500 sm:text-sm"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            <div className="bg-gray-50 px-8 py-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Spinner /> : 'Sign In'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminLoginPage;