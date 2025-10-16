import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../components/context/AuthContext';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../apiconfig';

const Login = () => {
  const { api, login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post(`${API_BASE_URL}/auth/login`, { email, password });
      const { token, user } = res.data;
      if (!token) {
        setError('No token returned from server');
        return;
      }
  await login({ token, user, rememberMe: remember });
  toast.success('Login successful');
  navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error', err);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="flex items-center mb-6">
          <div className="h-12 w-12 bg-blue-600 rounded-md flex items-center justify-center mr-3">
            <span className="text-white font-bold">HM</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Sign in</h2>
            <p className="text-sm text-gray-500">Welcome back — please sign in to continue</p>
          </div>
        </div>
        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-200"
              placeholder="you@company.com"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-200"
              placeholder="Your password"
              required
            />
          </div>
          <div className="flex items-center justify-between mb-6">
            <label className="inline-flex items-center text-sm">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="mr-2" />
              Remember me
            </label>
            <a href="#" className="text-sm text-blue-600">Forgot?</a>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md shadow">Sign in</button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/register" className="text-blue-600 font-medium">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
