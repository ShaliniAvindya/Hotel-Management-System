import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../components/context/AuthContext';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../apiconfig';
import { LogIn } from 'lucide-react';

const Login = () => {
  const { api, login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f2742 0%, #1a3a52 100%)' }}>
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-2xl">
        <div className="flex items-center mb-6">
          <img src="/assets/LushWare Logo.png" alt="LushWare" className="h-20 w-20 mr-4 rounded-md object-cover" />
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#0f2742' }}>Sign in</h2>
            <p className="text-sm text-gray-500">Welcome back — please sign in to continue</p>
          </div>
        </div>
        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium" style={{ color: '#0f2742' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-3"
              style={{ 
                focusColor: '#c9a24a',
                outlineColor: '#c9a24a'
              }}
              placeholder="you@company.com"
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
              placeholder="Your password"
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
          <div className="flex items-center justify-between mb-6">
            <label className="inline-flex items-center text-sm">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="mr-2" />
              Remember me
            </label>
            <a href="#" className="text-sm font-medium" style={{ color: '#c9a24a' }}>Forgot?</a>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-md shadow font-medium transition-all flex items-center justify-center gap-2"
            style={{ 
              backgroundColor: submitting ? '#1a3a52' : '#0f2742',
              color: 'white',
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => !submitting && (e.target.style.backgroundColor = '#1a3a52')}
            onMouseLeave={(e) => !submitting && (e.target.style.backgroundColor = '#0f2742')}
          >
            <LogIn size={18} />
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/register" className="font-medium" style={{ color: '#c9a24a' }}>Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
