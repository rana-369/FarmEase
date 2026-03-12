import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTruck, FiMenu, FiX, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext-simple';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isPublicPage = !location.pathname.startsWith('/farmer') && 
                      !location.pathname.startsWith('/owner') && 
                      !location.pathname.startsWith('/admin');

  if (!isPublicPage) return null;

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="w-full sticky top-0 z-50"
      style={{ 
        backgroundColor: 'rgba(10, 10, 10, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleNavigation('/')}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#22c55e' }}>
              <FiTruck className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>AgriConnect</h1>
              <p className="text-xs hidden sm:block" style={{ color: '#a1a1a1' }}>Farm Equipment Rental</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => handleNavigation('/')}
              className="font-medium transition-colors"
              style={{ color: location.pathname === '/' ? '#22c55e' : '#a1a1a1' }}
              onMouseEnter={(e) => e.target.style.color = '#22c55e'}
              onMouseLeave={(e) => e.target.style.color = location.pathname === '/' ? '#22c55e' : '#a1a1a1'}
            >
              Home
            </button>
            <button
              onClick={() => handleNavigation('/about')}
              className="font-medium transition-colors"
              style={{ color: location.pathname === '/about' ? '#22c55e' : '#a1a1a1' }}
              onMouseEnter={(e) => e.target.style.color = '#22c55e'}
              onMouseLeave={(e) => e.target.style.color = location.pathname === '/about' ? '#22c55e' : '#a1a1a1'}
            >
              About
            </button>
            <button
              onClick={() => handleNavigation('/how-it-works')}
              className="font-medium transition-colors"
              style={{ color: location.pathname === '/how-it-works' ? '#22c55e' : '#a1a1a1' }}
              onMouseEnter={(e) => e.target.style.color = '#22c55e'}
              onMouseLeave={(e) => e.target.style.color = location.pathname === '/how-it-works' ? '#22c55e' : '#a1a1a1'}
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavigation('/contact')}
              className="font-medium transition-colors"
              style={{ color: location.pathname === '/contact' ? '#22c55e' : '#a1a1a1' }}
              onMouseEnter={(e) => e.target.style.color = '#22c55e'}
              onMouseLeave={(e) => e.target.style.color = location.pathname === '/contact' ? '#22c55e' : '#a1a1a1'}
            >
              Contact
            </button>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const role = localStorage.getItem('role');
                  if (role === 'Farmer') navigate('/farmer');
                  else if (role === 'Owner') navigate('/owner');
                  else if (role === 'Admin') navigate('/admin');
                }}
                className="px-6 py-2 rounded-lg font-semibold"
                style={{ backgroundColor: '#22c55e', color: '#ffffff' }}
              >
                Go to Dashboard
              </motion.button>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavigation('/login')}
                  className="flex items-center gap-2 px-4 py-2 font-medium transition-colors"
                  style={{ color: '#a1a1a1' }}
                  onMouseEnter={(e) => e.target.style.color = '#22c55e'}
                  onMouseLeave={(e) => e.target.style.color = '#a1a1a1'}
                >
                  <FiLogIn />
                  Login
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavigation('/register')}
                  className="px-6 py-2 rounded-lg font-semibold flex items-center"
                  style={{ backgroundColor: '#22c55e', color: '#ffffff' }}
                >
                  <FiUserPlus className="mr-2" />
                  Register
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg transition-colors"
              style={{ color: '#a1a1a1' }}
            >
              {isMobileMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-4"
            style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleNavigation('/')}
                className="text-left font-medium transition-colors"
                style={{ color: '#a1a1a1' }}
              >
                Home
              </button>
              <button
                onClick={() => handleNavigation('/about')}
                className="text-left font-medium transition-colors"
                style={{ color: '#a1a1a1' }}
              >
                About
              </button>
              <button
                onClick={() => handleNavigation('/how-it-works')}
                className="text-left font-medium transition-colors"
                style={{ color: '#a1a1a1' }}
              >
                How It Works
              </button>
              <button
                onClick={() => handleNavigation('/contact')}
                className="text-left font-medium transition-colors"
                style={{ color: '#a1a1a1' }}
              >
                Contact
              </button>
              
              <div className="pt-4 flex flex-col gap-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      const role = localStorage.getItem('role');
                      if (role === 'Farmer') navigate('/farmer');
                      else if (role === 'Owner') navigate('/owner');
                      else if (role === 'Admin') navigate('/admin');
                    }}
                    className="px-6 py-2 rounded-lg font-semibold w-full"
                    style={{ backgroundColor: '#22c55e', color: '#ffffff' }}
                  >
                    Go to Dashboard
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleNavigation('/login')}
                      className="flex items-center justify-center gap-2 px-4 py-2 font-medium transition-colors w-full"
                      style={{ color: '#a1a1a1' }}
                    >
                      <FiLogIn />
                      Login
                    </button>
                    <button
                      onClick={() => handleNavigation('/register')}
                      className="px-6 py-2 rounded-lg font-semibold w-full flex items-center justify-center"
                      style={{ backgroundColor: '#22c55e', color: '#ffffff' }}
                    >
                      <FiUserPlus className="mr-2" />
                      Register
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;