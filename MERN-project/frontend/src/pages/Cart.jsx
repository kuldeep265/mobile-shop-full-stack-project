import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';

const Cart = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      navigate('/login');
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCart(res.data.cart || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await api.put(`/cart/${itemId}`, { quantity: newQuantity });
      fetchCart();
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      toast.success('Item removed from cart');
      fetchCart();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link to="/products" className="text-blue-600 hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {cart.map((item) => (
              <div key={item._id || item.product} className="flex items-center border-b p-4">
                <img
                  src={item.image || '/placeholder.png'}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1 ml-4">
                  <Link to={`/product/${item.product}`} className="font-semibold hover:text-blue-600">
                    {item.name}
                  </Link>
                  {item.variant && (
                    <p className="text-sm text-gray-600">
                      {item.variant.storage} / {item.variant.ram} / {item.variant.color}
                    </p>
                  )}
                  <p className="text-lg font-bold text-blue-600">₹{item.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded">
                    <button
                      onClick={() => updateQuantity(item._id || item.product, item.quantity - 1)}
                      className="px-3 py-1"
                    >
                      <FaMinus />
                    </button>
                    <span className="px-4 py-1">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id || item.product, item.quantity + 1)}
                      className="px-3 py-1"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <p className="font-semibold w-24 text-right">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                  <button
                    onClick={() => removeItem(item._id || item.product)}
                    className="text-red-600 hover:text-red-800 ml-4"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{total > 5000 ? 'Free' : '₹100'}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (18%):</span>
                <span>₹{(total * 0.18).toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₹{(total + (total > 5000 ? 0 : 100) + (total * 0.18)).toLocaleString()}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="block w-full bg-blue-600 text-white text-center py-3 rounded hover:bg-blue-700"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

