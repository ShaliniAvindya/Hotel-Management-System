import React, { useState, useEffect, useContext } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Smartphone } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { api, login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    if (location.state?.message) {
      setErrors({ form: location.state.message, isSuccess: true });
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(prev => ({ ...prev, ...newErrors, form: '' }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await api.post('/api/users/login', {
        email: formData.email,
        password: formData.password
      });

      const { token, user } = response.data;
      await login({ token, user, rememberMe: formData.rememberMe });
      localStorage.setItem('userMode', 'buyer'); // Set default mode to buyer
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid credentials. Please try again.';
      setErrors({ form: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className={`w-full max-w-lg transform transition-all duration-700 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center transform hover:scale-105 transition-transform duration-300" 
                 style={{ background: 'linear-gradient(135deg, #165B28 0%, #6ECC5A 100%)' }}>
              <Smartphone className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#165B28' }}>Welcome Back</h1>
            <p className="text-slate-600">Sign in to your DeviceMarket account</p>
            <p className="text-sm text-slate-500 mt-1">Your trusted marketplace for 2nd hand digital devices</p>
          </div>

          {errors.form && (
            <p className={`text-center text-sm mb-4 ${errors.isSuccess ? 'text-green-600' : 'text-red-600'}`}>
              {errors.form}
            </p>
          )}

          <div className="space-y-6">
            <div className="group">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors" 
                     style={{ color: formData.email ? '#6ECC5A' : '' }} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                    errors.email ? 'border-red-500' : 'border-slate-300'
                  }`}
                  style={{ 
                    borderColor: formData.email && !errors.email ? '#6ECC5A' : ''
                  }}
                  placeholder="Enter your email"
                  onFocus={(e) => e.target.style.borderColor = '#6ECC5A'}
                  onBlur={(e) => e.target.style.borderColor = formData.email && !errors.email ? '#6ECC5A' : '#cbd5e1'}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 animate-pulse">{errors.email}</p>
              )}
            </div>

            <div className="group">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors"
                     style={{ color: formData.password ? '#6ECC5A' : '' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 ${
                    errors.password ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Enter your password"
                  onFocus={(e) => e.target.style.borderColor = '#6ECC5A'}
                  onBlur={(e) => e.target.style.borderColor = formData.password && !errors.password ? '#6ECC5A' : '#cbd5e1'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  style={{ color: showPassword ? '#6ECC5A' : '' }}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 animate-pulse">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 border-slate-300 rounded focus:ring-2 transition-colors"
                  style={{ 
                    accentColor: '#6ECC5A',
                    focusRingColor: '#6ECC5A'
                  }}
                />
                <span className="ml-2 text-sm text-slate-700 group-hover:text-slate-800 transition-colors">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm font-medium transition-colors hover:underline"
                style={{ color: '#165B28' }}
                onMouseEnter={(e) => e.target.style.color = '#6ECC5A'}
                onMouseLeave={(e) => e.target.style.color = '#165B28'}
              >
                Forgot password?
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              style={{ 
                background: 'linear-gradient(135deg, #165B28 0%, #6ECC5A 100%)',
                backgroundSize: '200% 200%',
                animation: isLoading ? 'none' : 'gradient 3s ease infinite'
              }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-600">
              Don't have an account?{' '}
              <button 
                className="font-medium transition-colors hover:underline"
                style={{ color: '#165B28' }}
                onMouseEnter={(e) => e.target.style.color = '#6ECC5A'}
                onMouseLeave={(e) => e.target.style.color = '#165B28'}
                onClick={() => navigate('/register')}
              >
                Sign up for free
              </button>
            </p>
            <div className="mt-4 text-xs text-slate-500">
              <p>Connect with buyers and sellers of:</p>
              <p className="font-medium">Smartphones • Tablets • Laptops • Desktops • Components</p>
            </div>
          </div>
        </div>
      </div>
      
      <style>
        {`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </div>
  );
}