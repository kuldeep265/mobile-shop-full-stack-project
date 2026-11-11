import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { FaHeart, FaShoppingCart, FaTrash } from 'react-icons/fa';
import SaleTag from '../components/SaleTag';
import CompareButton from '../components/CompareButton';

const Wishlist = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      setWishlist(res.data.wishlist || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      toast.success('Removed from wishlist');
      fetchWishlist();
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const addToCart = async (productId) => {
    try {
      await api.post('/cart', { productId, quantity: 1 });
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <FaHeart className="text-6xl text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
        <Link to="/products" className="text-blue-600 hover:underline">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow relative">
            <SaleTag discount={product.discount} />
            <Link to={`/product/${product._id}`}>
              <img
                src={product.images[0]?.url || '/placeholder.png'}
                alt={product.name}
                className="w-full h-64 object-cover"
              />
            </Link>
            <div className="p-4">
              <Link to={`/product/${product._id}`}>
                <h3 className="text-lg font-semibold mb-2 hover:text-blue-600">{product.name}</h3>
              </Link>
              <p className="text-gray-600 mb-2">{product.brand}</p>
              <div className="mb-4">
                <span className="text-2xl font-bold text-blue-600">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="ml-2 text-gray-500 line-through text-sm">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="flex space-x-2 mb-2">
                <button
                  onClick={() => addToCart(product._id)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center"
                >
                  <FaShoppingCart className="mr-2" />
                  Add to Cart
                </button>
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50"
                >
                  <FaTrash />
                </button>
              </div>
              <div className="flex justify-center">
                <CompareButton product={product} className="w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;

