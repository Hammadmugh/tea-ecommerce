import { useState } from 'react';
import { Link } from 'react-router-dom';
import CartBag from './CartBag';
import UserProfile from './UserProfile';
import NotificationBell from './NotificationBell';
import { useCart } from '../context/CartContext';
import { LogIn, Settings, User } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { totalItems } = useCart();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin' || user.role === 'superadmin';

  const menuItems = [
    { name: 'TEA COLLECTIONS', path: '/collections' },
    { name: 'ACCESSORIES', path: '#' },
    { name: 'BLOG', path: '#' },
    { name: 'CONTACT US', path: '#' },
  ];

  return (
    <>
      <nav className="bg-white shadow-sm">
        {/* Main Container */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between md:px-16 md:py-6 px-4 py-4">
          
          {/* Header Row: Logo + Hamburger */}
          <div className="flex items-center justify-between md:flex-none md:gap-0 gap-0">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="Brand Logo"
                className="w-8 h-8"
              />
            </div>
            <span className="text-xl font-prosto-one font-normal text-gray-950 whitespace-nowrap">
              Brand Name
            </span>
          </Link>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8"
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-gray-900 transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-gray-900 my-1.5 transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-gray-900 transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>

        {/* Menu Bar & Icons Container */}
        <div className={`flex flex-col md:flex-row md:items-center md:gap-12 md:flex-1 md:justify-between mt-4 md:mt-0 ${isMenuOpen ? 'block' : 'hidden md:flex'}`}>
            
            {/* Menu Items */}
            <div className="flex flex-col md:flex-row md:justify-center md:mx-auto md:gap-2 gap-3 mb-4 md:mb-0">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex flex-col md:flex-row md:justify-center md:items-center px-3 md:px-3 py-2.5 md:py-2.5 md:h-10 rounded hover:bg-gray-100 transition-colors"
                >
                  <span className="text-xs lg:text-sm font-montserrat font-medium text-gray-950 tracking-wider uppercase">
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>

            {/* Icons Section */}
            <div className="flex items-center gap-2 pt-4 md:pt-0 md:gap-2 border-t md:border-t-0">
              {/* Search Icon */}
              <button className="flex items-center justify-center w-12 md:w-10 h-12 md:h-10 bg-gray-200 rounded hover:bg-gray-300 transition-colors">
                <img 
                  src="/search-icon.png" 
                  alt="Search"
                  className="w-5 md:w-6 h-5 md:h-6"
                />
              </button>

              {/* Profile Icon */}
              <button 
                onClick={() => user.email ? setIsProfileOpen(true) : null}
                className="flex items-center justify-center w-12 md:w-10 h-12 md:h-10 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                title={user.email ? 'My Profile' : 'Login to view profile'}
              >
                <User size={20} />
              </button>

              {/* Admin Panel Link */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center justify-center w-12 md:w-10 h-12 md:h-10 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  title="Admin Panel"
                >
                  <Settings size={20} />
                </Link>
              )}

              {/* Login/Logout/Signup Links */}
              {!user.email ? (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-1 px-3 md:px-2 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors text-sm font-montserrat font-medium"
                  >
                    <LogIn size={18} />
                    <span className="md:hidden">Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center justify-center px-3 md:px-2 py-2 bg-gray-950 text-white rounded hover:bg-gray-800 transition-colors text-sm font-montserrat font-medium"
                  >
                    <span className="hidden md:inline">Sign Up</span>
                    <span className="md:hidden">Sign Up</span>
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/';
                  }}
                  className="flex items-center justify-center px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors text-xs font-montserrat font-medium"
                >
                  Logout
                </button>
              )}

              {/* Notification Bell */}
              {user.email && <NotificationBell />}

              {/* Cart Icon */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="flex items-center justify-center relative w-12 md:w-10 h-12 md:h-10 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              >
                <img 
                  src="/cart-icon.png" 
                  alt="Cart"
                  className="w-5 md:w-6 h-5 md:h-6"
                />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <CartBag isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <UserProfile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
}
