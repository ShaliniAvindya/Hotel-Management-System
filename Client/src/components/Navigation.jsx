import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Smartphone, Menu, X, User } from 'lucide-react';
import { AuthContext } from './context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../apiconfig';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userMode, setUserMode] = useState(() => localStorage.getItem('userMode') || 'buyer');
  const [activeMobileBtn, setActiveMobileBtn] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showNoShopPopup, setShowNoShopPopup] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('userMode', userMode);
  }, [userMode]);

  useEffect(() => {
    if (user && (location.pathname === '/register' || location.pathname === '/login')) {
      setUserMode('buyer');
      navigate('/'); 
    }
    if (location.pathname === '/login') {
      setActiveMobileBtn('signin');
    }
  }, [user, location.pathname, navigate]);

  const handleUserModeChange = (mode) => {
    setUserMode(mode);
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
    if (mode === 'seller') {
      window.location.reload();
    } else {
      navigate('/');
    }
  };

  let navLinks = [
    { to: '/', label: 'Home' },
    { to: '/listings', label: 'Listings' },
  ];
  if (userMode === 'buyer') {
    navLinks.push(
      { to: user ? '/buyer-request' : '/login', label: 'Buyer Request' },
      ...(user ? [{ to: '/profile', label: 'My Profile' }] : []),
      { to: '/contact', label: 'Contact' }
    );
  } else {
    navLinks.push(
      { to: user ? '/post-product' : '/login', label: 'Post Product' },
      ...(user ? [{ to: '/my-shop', label: 'My Shop Page' }] : []),
      { to: '/contact', label: 'Contact' }
    );
  }


  const handleMyShopPageClick = async (e) => {
    e.preventDefault();
    if (user) {
      try {
        // Get shop for this user by userId
        const response = await axios.get(`${API_BASE_URL}/shops/by-user/${user._id}`);
        const shop = response.data;
        // Only redirect if shop exists 
        if (shop && shop._id && shop.sellerId === shop._id) {
          navigate(`/seller-posts/${shop._id}`);
        } else {
          setShowNoShopPopup(true);
        }
      } catch (error) {
        setShowNoShopPopup(true);
      }
    } else {
      navigate('/login');
      setActiveMobileBtn('signin');
    }
  };

  const handleSignOut = () => {
    logout('You have been logged out.');
    navigate('/');
    setIsMenuOpen(false);
    setUserMode('buyer');
    setIsProfileDropdownOpen(false);
    localStorage.setItem('userMode', 'buyer');
  };

  // Handle clicks on links that may redirect to login
  const handleNavLinkClick = (to, label) => {
    if (!user && (label === 'Post Product' || label === 'Buyer Request')) {
      setActiveMobileBtn('signin'); 
    } else if (label === 'Listings') {
      setActiveMobileBtn('listings');
    }
    setIsMenuOpen(false);
    navigate(to);
  };

  return (
    <>
      {/* Popup for no shop profile */}
      {showNoShopPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-sm w-full flex flex-col items-center animate-fade-in">
            <div className="text-2xl font-bold text-[#1A3C34] mb-2">No Shop Profile Found</div>
            <div className="text-gray-700 mb-6 text-center">You haven't created a shop profile page yet. Please create a shop page first to continue.</div>
            <button
              className="bg-[#2E7D32] hover:bg-[#388E3C] text-white font-semibold px-6 py-2 rounded-lg shadow transition-colors mb-2 w-full"
              onClick={() => {
                setShowNoShopPopup(false);
                navigate('/create-shop');
              }}
            >
              Create your Shop Now
            </button>
            <button
              className="text-[#2E7D32] hover:underline text-sm mt-1"
              onClick={() => setShowNoShopPopup(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <header className="bg-white/80 backdrop-blur-lg border-b border-[#E0E6E9]/50 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="ml-4">
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#1A3C34' }}>
                2ndChoiz
              </h1>
              <p className="text-xs -mt-1" style={{ color: '#666666' }}>
                Secondhand Marketplace
              </p>
            </div>
          </div>

          <nav className="hidden lg:flex space-x-8" aria-label="Main navigation">
            {navLinks.map((link) => {
              if (link.label === 'My Shop Page') {
                return (
                  <a
                    key={link.label}
                    href={link.to}
                    className="font-medium transition-colors relative group"
                    style={{
                      color:
                        location.pathname === '/login'
                          ? '#333333'
                          : (link.label === 'Listings' && (
                              activeMobileBtn === 'listings' ||
                              /^\/listings$/.test(location.pathname) ||
                              /^\/category\//.test(location.pathname) ||
                              /^\/product\//.test(location.pathname) ||
                              /^\/shops\//.test(location.pathname)
                            ))
                          ? '#2E7D32'
                          : location.pathname === link.to
                          ? '#2E7D32'
                          : '#333333',
                    }}
                    onClick={handleMyShopPageClick}
                    onMouseOver={(e) => {
                      if (location.pathname !== link.to) {
                        e.currentTarget.style.color = '#4CAF50';
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = location.pathname === '/login' ? '#333333' : (location.pathname === link.to ? '#2E7D32' : '#333333');
                    }}
                  >
                    {link.label}
                    <span
                      className="absolute -bottom-1 left-0 h-0.5 transition-all"
                      style={{
                        width:
                          location.pathname === '/login'
                            ? '0%'
                            : (link.label === 'Listings' && (
                                activeMobileBtn === 'listings' ||
                                /^\/listings$/.test(location.pathname) ||
                                /^\/category\//.test(location.pathname) ||
                                /^\/product\//.test(location.pathname) ||
                                /^\/shops\//.test(location.pathname)
                              ))
                            ? '100%'
                            : location.pathname === link.to
                            ? '100%'
                            : '0%',
                        backgroundColor:
                          (link.label === 'Listings' && (
                            activeMobileBtn === 'listings' ||
                            /^\/listings$/.test(location.pathname) ||
                            /^\/category\//.test(location.pathname) ||
                            /^\/product\//.test(location.pathname) ||
                            /^\/shops\//.test(location.pathname)
                          )) || location.pathname === link.to
                            ? '#2E7D32'
                            : '#4CAF50',
                      }}
                      onMouseOver={(e) => {
                        if (location.pathname !== link.to) {
                          e.currentTarget.style.width = '100%';
                          e.currentTarget.style.backgroundColor = '#4CAF50';
                        }
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.width =
                          location.pathname === '/login'
                            ? '0%'
                            : (link.label === 'Listings' && (
                                activeMobileBtn === 'listings' ||
                                /^\/listings$/.test(location.pathname) ||
                                /^\/category\//.test(location.pathname) ||
                                /^\/product\//.test(location.pathname) ||
                                /^\/shops\//.test(location.pathname)
                              ))
                            ? '100%'
                            : location.pathname === link.to
                            ? '100%'
                            : '0%';
                        e.currentTarget.style.backgroundColor =
                          (link.label === 'Listings' && (
                            activeMobileBtn === 'listings' ||
                            /^\/listings$/.test(location.pathname) ||
                            /^\/category\//.test(location.pathname) ||
                            /^\/product\//.test(location.pathname) ||
                            /^\/shops\//.test(location.pathname)
                          )) || location.pathname === link.to
                            ? '#2E7D32'
                            : '#4CAF50';
                      }}
                    ></span>
                  </a>
                );
              } else {
                return (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="font-medium transition-colors relative group"
                    style={{
                      color: location.pathname === '/login' ? '#333333' : (location.pathname === link.to ? '#2E7D32' : '#333333'),
                    }}
                    onClick={() => handleNavLinkClick(link.to, link.label)}
                    onMouseOver={(e) => {
                      if (location.pathname !== link.to) {
                        e.currentTarget.style.color = '#4CAF50';
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = location.pathname === '/login' ? '#333333' : (location.pathname === link.to ? '#2E7D32' : '#333333');
                    }}
                  >
                    {link.label}
                    <span
                      className="absolute -bottom-1 left-0 h-0.5 transition-all"
                      style={{
                        width: location.pathname === '/login' ? '0%' : (location.pathname === link.to ? '100%' : '0%'),
                        backgroundColor: location.pathname === link.to ? '#2E7D32' : '#4CAF50',
                      }}
                      onMouseOver={(e) => {
                        if (location.pathname !== link.to) {
                          e.currentTarget.style.width = '100%';
                          e.currentTarget.style.backgroundColor = '#4CAF50';
                        }
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.width = location.pathname === '/login' ? '0%' : (location.pathname === link.to ? '100%' : '0%');
                        e.currentTarget.style.backgroundColor = location.pathname === link.to ? '#2E7D32' : '#4CAF50';
                      }}
                    ></span>
                  </Link>
                );
              }
            })}
          </nav>

          <div className="hidden md:flex items-center space-x-6">
            <div className="flex bg-white/80 rounded-xl p-1 backdrop-blur-sm border" style={{ borderColor: '#E0E6E9' }}>
              <button
                onClick={() => handleUserModeChange('buyer')}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
                style={{
                  backgroundColor: userMode === 'buyer' ? '#2E7D32' : 'transparent',
                  color: userMode === 'buyer' ? '#FFFFFF' : '#333333',
                  boxShadow: userMode === 'buyer' ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
                }}
                onMouseOver={(e) => {
                  if (userMode !== 'buyer') {
                    e.currentTarget.style.backgroundColor = '#4CAF50';
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = userMode === 'buyer' ? '#2E7D32' : 'transparent';
                  e.currentTarget.style.color = userMode === 'buyer' ? '#FFFFFF' : '#333333';
                }}
                aria-pressed={userMode === 'buyer'}
              >
                Buy
              </button>
              <button
                onClick={() => handleUserModeChange('seller')}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105"
                style={{
                  backgroundColor: userMode === 'seller' ? '#2E7D32' : 'transparent',
                  color: userMode === 'seller' ? '#FFFFFF' : '#333333',
                  boxShadow: userMode === 'seller' ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
                }}
                onMouseOver={(e) => {
                  if (userMode !== 'seller') {
                    e.currentTarget.style.backgroundColor = '#4CAF50';
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = userMode === 'seller' ? '#2E7D32' : 'transparent';
                  e.currentTarget.style.color = userMode === 'seller' ? '#FFFFFF' : '#333333';
                }}
                aria-pressed={userMode === 'seller'}
              >
                Sell
              </button>
            </div>
            {user ? (
              <div className="relative flex items-center space-x-2">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 font-medium transition-colors duration-300 px-3 py-2 rounded-xl shadow-md"
                  style={{
                    color: '#fff',
                    background: 'linear-gradient(90deg, #4CAF50 0%, #1A3C34 100%)',
                    boxShadow: '0 2px 8px 0 rgba(76,175,80,0.10)',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(90deg, #388E3C 0%, #165B28 100%)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(90deg, #4CAF50 0%, #1A3C34 100%)';
                  }}
                >
                  <span className="font-semibold drop-shadow flex items-center">
                    {user.name || user.email || 'User'}
                    <svg className={`ml-2 w-4 h-4 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                  <User className="h-5 w-5 ml-2" style={{ color: '#fff' }} />
                </button>
                {isProfileDropdownOpen && (
                  <div className="absolute top-12 right-0 bg-white border rounded-lg shadow-lg p-2 z-50 min-w-[160px]">
                    {userMode === 'buyer' ? (
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm font-medium transition-colors"
                        style={{ color: '#333333' }}
                        onClick={() => setIsProfileDropdownOpen(false)}
                        onMouseOver={(e) => e.currentTarget.style.color = '#4CAF50'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#333333'}
                      >
                        My Profile
                      </Link>
                    ) : (
                      <a
                        href="/my-shop"
                        className="block px-4 py-2 text-sm font-medium transition-colors"
                        style={{ color: '#333333' }}
                        onClick={(e) => {
                          e.preventDefault();
                          setIsProfileDropdownOpen(false);
                          handleMyShopPageClick(e); 
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = '#4CAF50'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#333333'}
                      >
                        My Shop Page
                      </a>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block px-4 py-2 text-sm font-medium transition-colors w-full text-left"
                      style={{ color: '#333333' }}
                      onMouseOver={(e) => e.currentTarget.style.color = '#4CAF50'}
                      onMouseOut={(e) => e.currentTarget.style.color = '#333333'}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="font-medium transition-colors duration-300 transform hover:scale-105"
                  style={{
                    color: activeMobileBtn === 'signin' || location.pathname === '/login' ? '#2E7D32' : '#333333',
                    backgroundColor: activeMobileBtn === 'signin' || location.pathname === '/login' ? '#E8F5E9' : 'transparent',
                    borderRadius: activeMobileBtn === 'signin' || location.pathname === '/login' ? '0.5rem' : undefined,
                    padding: activeMobileBtn === 'signin' || location.pathname === '/login' ? '0.5rem 1rem' : undefined,
                  }}
                  onClick={() => setActiveMobileBtn('signin')}
                  onMouseOver={(e) => {
                    if (location.pathname !== '/login') {
                      e.currentTarget.style.color = '#4CAF50';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = activeMobileBtn === 'signin' || location.pathname === '/login' ? '#2E7D32' : '#333333';
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform scale-100 hover:scale-105"
                  style={{
                    backgroundColor:
                      activeMobileBtn === 'getstarted'
                        ? '#E8F5E9'
                        : location.pathname === '/register'
                        ? '#2E7D32'
                        : '#165B28',
                    color: activeMobileBtn === 'getstarted' ? '#2E7D32' : '#fff',
                    border: activeMobileBtn === 'getstarted' ? '2px solid #2E7D32' : undefined,
                  }}
                  onClick={() => setActiveMobileBtn('getstarted')}
                  onMouseOver={(e) => {
                    if (location.pathname !== '/register') {
                      e.currentTarget.style.backgroundColor = '#038D11';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor =
                      activeMobileBtn === 'getstarted'
                        ? '#E8F5E9'
                        : location.pathname === '/register'
                        ? '#2E7D32'
                        : '#165B28';
                  }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="transition-colors duration-300"
              style={{ color: '#333333' }}
              onMouseOver={(e) => e.currentTarget.style.color = '#4CAF50'}
              onMouseOut={(e) => e.currentTarget.style.color = '#333333'}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden bg-white/90 backdrop-blur-lg border-t" style={{ borderColor: '#E0E6E9/50' }}>
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="block font-medium transition-colors py-2"
                  style={{
                    color: location.pathname === '/login' ? '#333333' : (location.pathname === link.to ? '#2E7D32' : '#333333'),
                  }}
                  onClick={() => handleNavLinkClick(link.to, link.label)}
                  onMouseOver={(e) => {
                    if (location.pathname !== link.to) {
                      e.currentTarget.style.color = '#4CAF50';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = location.pathname === '/login' ? '#333333' : (location.pathname === link.to ? '#2E7D32' : '#333333');
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col space-y-4 pt-4 border-t" style={{ borderColor: '#E0E6E9/50' }}>
                <button
                  onClick={() => handleUserModeChange('buyer')}
                  className="text-left py-2 font-medium transition-colors duration-300 transform hover:scale-105"
                  style={{
                    color: userMode === 'buyer' ? '#2E7D32' : '#333333',
                  }}
                  onMouseOver={(e) => {
                    if (userMode !== 'buyer') {
                      e.currentTarget.style.color = '#4CAF50';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = userMode === 'buyer' ? '#2E7D32' : '#333333';
                  }}
                  aria-pressed={userMode === 'buyer'}
                >
                  Buy
                </button>
                <button
                  onClick={() => handleUserModeChange('seller')}
                  className="text-left py-2 font-medium transition-colors duration-300 transform hover:scale-105"
                  style={{
                    color: userMode === 'seller' ? '#2E7D32' : '#333333',
                  }}
                  onMouseOver={(e) => {
                    if (userMode !== 'seller') {
                      e.currentTarget.style.color = '#4CAF50';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = userMode === 'seller' ? '#2E7D32' : '#333333';
                  }}
                  aria-pressed={userMode === 'seller'}
                >
                  Sell
                </button>
                {user ? (
                  <div className="flex flex-col space-y-4">
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center space-x-2 font-medium transition-colors"
                      style={{ color: '#333333' }}
                      onMouseOver={(e) => e.currentTarget.style.color = '#4CAF50'}
                      onMouseOut={(e) => e.currentTarget.style.color = '#333333'}
                    >
                      <span>{user.name || user.email || 'User'}</span>
                      <User className="h-5 w-5" style={{ color: '#333333' }} />
                    </button>
                    {isProfileDropdownOpen && (
                      <div className="flex flex-col pl-4 space-y-2">
                        <Link
                          to="/profile"
                          className="block font-medium transition-colors py-2"
                          style={{ color: '#333333' }}
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            setIsMenuOpen(false);
                          }}
                          onMouseOver={(e) => e.currentTarget.style.color = '#4CAF50'}
                          onMouseOut={(e) => e.currentTarget.style.color = '#333333'}
                        >
                          My Profile
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="text-left font-medium py-2 transition-colors duration-300 transform hover:scale-105"
                          style={{ color: '#333333' }}
                          onMouseOver={(e) => e.currentTarget.style.color = '#4CAF50'}
                          onMouseOut={(e) => e.currentTarget.style.color = '#333333'}
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-left font-medium py-2 transition-colors duration-300 transform hover:scale-105"
                      style={{
                        color: activeMobileBtn === 'signin' || location.pathname === '/login' ? '#2E7D32' : '#333333',
                        backgroundColor: activeMobileBtn === 'signin' || location.pathname === '/login' ? '#E8F5E9' : 'transparent',
                        borderRadius: activeMobileBtn === 'signin' || location.pathname === '/login' ? '0.5rem' : undefined,
                        padding: activeMobileBtn === 'signin' || location.pathname === '/login' ? '0.5rem 1rem' : undefined,
                      }}
                      onClick={() => {
                        setActiveMobileBtn('signin');
                        setIsMenuOpen(false);
                      }}
                      onMouseOver={(e) => {
                        if (location.pathname !== '/login') {
                          e.currentTarget.style.color = '#4CAF50';
                        }
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = activeMobileBtn === 'signin' || location.pathname === '/login' ? '#2E7D32' : '#333333';
                      }}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform scale-100 hover:scale-105"
                      style={{
                        backgroundColor:
                          activeMobileBtn === 'getstarted'
                            ? '#E8F5E9'
                            : location.pathname === '/register'
                            ? '#2E7D32'
                            : '#165B28',
                        color: activeMobileBtn === 'getstarted' ? '#2E7D32' : '#fff',
                        border: activeMobileBtn === 'getstarted' ? '2px solid #2E7D32' : undefined,
                      }}
                      onClick={() => {
                        setActiveMobileBtn('getstarted');
                        setIsMenuOpen(false);
                      }}
                      onMouseOver={(e) => {
                        if (location.pathname !== '/register') {
                          e.currentTarget.style.backgroundColor = '#038D11';
                        }
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor =
                          activeMobileBtn === 'getstarted'
                            ? '#E8F5E9'
                            : location.pathname === '/register'
                            ? '#2E7D32'
                            : '#165B28';
                      }}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
    </>
  );
}