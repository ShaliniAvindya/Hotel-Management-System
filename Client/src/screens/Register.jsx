import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../components/context/AuthContext';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../apiconfig';
import { UserPlus } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f2742 0%, #1a3a52 100%)' }}>
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-2xl">
        <div className="flex items-center mb-6">
          <div className="h-12 w-12 rounded-md flex items-center justify-center mr-3" style={{ backgroundColor: '#0f2742', border: '2px solid #c9a24a' }}>
            <span className="text-white font-bold">HM</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#0f2742' }}>Create an account</h2>
            <p className="text-sm text-gray-500">Sign up to access the hotel management dashboard</p>
          </div>
        </div>

        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        {success && <div className="mb-4 text-sm text-green-600">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium" style={{ color: '#0f2742' }}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3"
              onFocus={(e) => {
                e.target.style.borderColor = '#c9a24a';
                e.target.style.boxShadow = '0 0 0 3px rgba(201, 162, 74, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium" style={{ color: '#0f2742' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3"
              onFocus={(e) => {
                e.target.style.borderColor = '#c9a24a';
                e.target.style.boxShadow = '0 0 0 3px rgba(201, 162, 74, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium" style={{ color: '#0f2742' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3"
              onFocus={(e) => {
                e.target.style.borderColor = '#c9a24a';
                e.target.style.boxShadow = '0 0 0 3px rgba(201, 162, 74, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium" style={{ color: '#0f2742' }}>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3"
              style={{ color: '#0f2742' }}
              onFocus={(e) => {
                e.target.style.borderColor = '#c9a24a';
                e.target.style.boxShadow = '0 0 0 3px rgba(201, 162, 74, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="staff">Staff</option>
              <option value="guest">Guest</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full py-3 rounded-md shadow font-medium transition-all flex items-center justify-center gap-2"
            style={{ 
              backgroundColor: '#0f2742',
              color: 'white'
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#1a3a52')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#0f2742')}
          >
            <UserPlus size={18} />
            Create account
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="font-medium" style={{ color: '#c9a24a' }}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
