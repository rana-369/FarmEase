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
      className="w-full bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => handleNavigation('/')}
          >
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <FiTruck className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AgriConnect</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Farm Equipment Rental</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => handleNavigation('/')}
              className={`font-medium transition-colors ${
                location.pathname === '/' ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavigation('/about')}
              className={`font-medium transition-colors ${
                location.pathname === '/about' ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              About
            </button>
            <button
              onClick={() => handleNavigation('/how-it-works')}
              className={`font-medium transition-colors ${
                location.pathname === '/how-it-works' ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavigation('/contact')}
              className={`font-medium transition-colors ${
                location.pathname === '/contact' ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
              }`}
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
                className="primary-button"
              >
                Go to Dashboard
              </motion.button>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavigation('/login')}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  <FiLogIn />
                  Login
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavigation('/register')}
                  className="primary-button"
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
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
            className="md:hidden py-4 border-t border-gray-200"
          >
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleNavigation('/')}
                className="text-left font-medium text-gray-600 hover:text-primary-600 transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => handleNavigation('/about')}
                className="text-left font-medium text-gray-600 hover:text-primary-600 transition-colors"
              >
                About
              </button>
              <button
                onClick={() => handleNavigation('/how-it-works')}
                className="text-left font-medium text-gray-600 hover:text-primary-600 transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => handleNavigation('/contact')}
                className="text-left font-medium text-gray-600 hover:text-primary-600 transition-colors"
              >
                Contact
              </button>
              
              <div className="pt-4 border-t border-gray-200 flex flex-col gap-3">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      const role = localStorage.getItem('role');
                      if (role === 'Farmer') navigate('/farmer');
                      else if (role === 'Owner') navigate('/owner');
                      else if (role === 'Admin') navigate('/admin');
                    }}
                    className="primary-button w-full"
                  >
                    Go to Dashboard
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleNavigation('/login')}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors w-full"
                    >
                      <FiLogIn />
                      Login
                    </button>
                    <button
                      onClick={() => handleNavigation('/register')}
                      className="primary-button w-full"
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