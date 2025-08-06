import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Phone, Smartphone, Tablet, Laptop, Monitor, Cpu, Shield, Users, Star } from 'lucide-react';
import { AuthContext } from './context/AuthContext';

export default function Register() {
  const { api } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptMarketing: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        isAdmin: false
      };
      
      const response = await api.post('/api/users/register', userData);
      
      console.log('Registration successful:', response.data);
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setErrors({ form: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
            {/* Left Column - Info Section */}
            <div className="lg:col-span-5 mb-8 lg:mb-0 mt-8 lg:mt-16">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl font-bold mb-6" style={{ color: '#165B28' }}>
                  Welcome to the Digital Device Platform
                </h1>

                <div className="mb-8 border border-[#6ECC5A]/30 rounded-xl p-6">
                  <div className="font-semibold text-[#165B28] mb-4">Find or sell your device type:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col items-center">
                      <Smartphone className="h-8 w-8 text-[#165B28] mb-2" />
                      <span className="text-slate-700 text-sm">Smartphones</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Tablet className="h-8 w-8 text-[#165B28] mb-2" />
                      <span className="text-slate-700 text-sm">Tablets</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Laptop className="h-8 w-8 text-[#165B28] mb-2" />
                      <span className="text-slate-700 text-sm">Laptops</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Monitor className="h-8 w-8 text-[#165B28] mb-2" />
                      <span className="text-slate-700 text-sm">Desktops</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Cpu className="h-8 w-8 text-[#165B28] mb-2" />
                      <span className="text-slate-700 text-sm text-center">Components</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Shield className="h-8 w-8 text-[#165B28] mb-2" />
                      <span className="text-slate-700 text-sm text-center">Accessories</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3 text-green-500" />
                    <span className="text-slate-700">Direct contact between buyers and sellers</span>
                  </div>
                  <div className="flex items-center">
                    <Smartphone className="h-5 w-5 mr-3 text-green-500" />
                    <span className="text-slate-700">Wide range of digital devices</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 mr-3 text-green-500" />
                    <span className="text-slate-700">Community-driven and easy to use</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 mr-3 text-green-500" />
                    <span className="text-slate-700">Secure transactions and user verification</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Form Section */}
            <div className="lg:col-span-7">
              <div className="max-w-2xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-200">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2" style={{ color: '#165B28' }}>Create Your Account</h2>
                    <p className="text-slate-600">Join our community of buyers and sellers</p>
                  </div>

                  {errors.form && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{errors.form}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Fields Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                          First Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors"
                               style={{ color: formData.firstName ? '#6ECC5A' : '' }} />
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6ECC5A] focus:border-transparent transition-all ${
                              errors.firstName ? 'border-red-500' : 'border-slate-300'
                            }`}
                            placeholder="First name"
                          />
                        </div>
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                          Last Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors"
                               style={{ color: formData.lastName ? '#6ECC5A' : '' }} />
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6ECC5A] focus:border-transparent transition-all ${
                              errors.lastName ? 'border-red-500' : 'border-slate-300'
                            }`}
                            placeholder="Last name"
                          />
                        </div>
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    {/* Username Field */}
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                        Username
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors"
                             style={{ color: formData.username ? '#6ECC5A' : '' }} />
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6ECC5A] focus:border-transparent transition-all ${
                            errors.username ? 'border-red-500' : 'border-slate-300'
                          }`}
                          placeholder="Choose a username"
                        />
                      </div>
                      {errors.username && (
                        <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                      )}
                    </div>

                    {/* Email and Phone Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
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
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6ECC5A] focus:border-transparent transition-all ${
                              errors.email ? 'border-red-500' : 'border-slate-300'
                            }`}
                            placeholder="your@email.com"
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors"
                                 style={{ color: formData.phone ? '#6ECC5A' : '' }} />
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6ECC5A] focus:border-transparent transition-all ${
                              errors.phone ? 'border-red-500' : 'border-slate-300'
                            }`}
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Password Fields Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
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
                            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6ECC5A] focus:border-transparent transition-all ${
                              errors.password ? 'border-red-500' : 'border-slate-300'
                            }`}
                            placeholder="Create password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors"
                               style={{ color: formData.confirmPassword ? '#6ECC5A' : '' }} />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6ECC5A] focus:border-transparent transition-all ${
                              errors.confirmPassword ? 'border-red-500' : 'border-slate-300'
                            }`}
                            placeholder="Confirm password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>

                    {/* Terms and Marketing Checkboxes */}
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="acceptTerms"
                          name="acceptTerms"
                          checked={formData.acceptTerms}
                          onChange={handleChange}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-[#6ECC5A] focus:ring-[#6ECC5A] focus:ring-offset-0"
                        />
                        <label htmlFor="acceptTerms" className="ml-3 text-sm text-slate-700">
                          I agree to the{' '}
                          <a href="#" className="font-medium text-[#165B28] hover:text-[#6ECC5A] transition-colors hover:underline">
                            Terms and Conditions
                          </a>{' '}
                          and{' '}
                          <a href="#" className="font-medium text-[#165B28] hover:text-[#6ECC5A] transition-colors hover:underline">
                            Privacy Policy
                          </a>
                        </label>
                      </div>
                      {errors.acceptTerms && (
                        <p className="text-sm text-red-600 ml-7">{errors.acceptTerms}</p>
                      )}
                      
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="acceptMarketing"
                          name="acceptMarketing"
                          checked={formData.acceptMarketing}
                          onChange={handleChange}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-[#6ECC5A] focus:ring-[#6ECC5A] focus:ring-offset-0"
                        />
                        <label htmlFor="acceptMarketing" className="ml-3 text-sm text-slate-700">
                          I want to receive marketing communications and updates about new features
                        </label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-[#165B28] to-[#6ECC5A] text-white py-3 px-4 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>

                    {/* Sign In Link */}
                    <div className="text-center">
                      <p className="text-sm text-slate-600">
                        Already have an account?{' '}
                        <button
                          type="button"
                          className="font-medium text-[#165B28] hover:text-[#6ECC5A] transition-colors hover:underline bg-transparent border-none p-0 m-0 cursor-pointer"
                          onClick={() => navigate('/login')}
                        >
                          Sign in here
                        </button>
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}