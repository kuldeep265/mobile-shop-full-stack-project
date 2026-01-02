import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaUser, FaSearch, FaBars, FaTimes, FaBalanceScale } from 'react-icons/fa';
import AuthContext from '../../context/AuthContext';
import { useCompare } from '../../context/CompareContext';
import api from '../../utils/api';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { compareCount } = useCompare();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  React.useEffect(() => {
    if (user) {
      fetchCartCount();
    }
  }, [user]);

  const fetchCartCount = async () => {
    try {
      const res = await api.get('/cart');
      setCartCount(res.data.cart?.length || 0);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Fone Factory
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for mobiles..."
              className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
            >
              <FaSearch />
            </button>
          </form>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/products" className="text-gray-700 hover:text-blue-600">
              Products
            </Link>
            <Link to="/compare" className="relative text-gray-700 hover:text-blue-600">
              <FaBalanceScale className="text-xl" />
              {compareCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <Link to="/wishlist" className="relative text-gray-700 hover:text-blue-600">
                  <FaHeart className="text-xl" />
                </Link>
                <Link to="/cart" className="relative text-gray-700 hover:text-blue-600">
                  <FaShoppingCart className="text-xl" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                    <FaUser />
                    <span>{user.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Orders
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Sign Up
                </Link>
                <Link to="/admin/login" className="text-sm text-gray-500 hover:text-blue-600">
                  Admin Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <form onSubmit={handleSearch} className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </form>
            <div className="flex flex-col space-y-2">
              <Link to="/products" className="text-gray-700 hover:text-blue-600">
                Products
              </Link>
              <Link to="/compare" className="text-gray-700 hover:text-blue-600">
                Compare ({compareCount})
              </Link>
              {user ? (
                <>
                  <Link to="/wishlist" className="text-gray-700 hover:text-blue-600">
                    Wishlist
                  </Link>
                  <Link to="/cart" className="text-gray-700 hover:text-blue-600">
                    Cart ({cartCount})
                  </Link>
                  <Link to="/profile" className="text-gray-700 hover:text-blue-600">
                    Profile
                  </Link>
                  <Link to="/orders" className="text-gray-700 hover:text-blue-600">
                    Orders
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600">
                      Admin Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} className="text-left text-gray-700 hover:text-blue-600">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-blue-600">
                    Login
                  </Link>
                  <Link to="/register" className="text-gray-700 hover:text-blue-600">
                    Sign Up
                  </Link>
                  <Link to="/admin/login" className="text-gray-700 hover:text-blue-600">
                    Admin Login
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

