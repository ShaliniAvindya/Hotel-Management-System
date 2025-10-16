import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../components/context/AuthContext';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../apiconfig';

const Register = () => {
  const { api, login } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('A valid email is required');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
      try {
        await api.post(`${API_BASE_URL}/auth/register`, { name, email, password, role });
    // show success and redirect to login 
    setSuccess('Registration successful. Redirecting to login...');
    toast.success('Registration successful');
        setTimeout(() => navigate('/login'), 1000);
      } catch (err) {
      const serverMsg = err.response?.data?.error || err.response?.data?.message;
      if (serverMsg) {
        if (typeof serverMsg === 'string' && serverMsg.toLowerCase().includes('validation')) {
          const parts = serverMsg.split(':').slice(1).join(':').trim();
          setError(parts || 'Registration validation failed');
        } else {
          setError(serverMsg);
        }
      } else {
        setError('Registration failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="flex items-center mb-6">
          <div className="h-12 w-12 bg-green-600 rounded-md flex items-center justify-center mr-3">
            <span className="text-white font-bold">HM</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Create an account</h2>
            <p className="text-sm text-gray-500">Sign up to access the hotel management dashboard</p>
          </div>
        </div>

        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        {success && <div className="mb-4 text-sm text-green-600">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-200"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-200"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-200"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3"
            >
              <option value="staff">Staff</option>
              <option value="guest">Guest</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-md shadow">Create account</button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 font-medium">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
