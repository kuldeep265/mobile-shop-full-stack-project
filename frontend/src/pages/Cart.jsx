import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { FaTrash, FaPlus, FaMinus, FaShoppingBag, FaArrowLeft, FaHeart } from 'react-icons/fa';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { PageLoader } from '../components/ui/LoadingSpinner';

const Cart = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState(new Set());

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
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await api.put(`/cart/${itemId}`, { quantity: newQuantity });
      fetchCart();
      toast.success('Quantity updated');
    } catch (error) {
      toast.error('Failed to update quantity');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const removeItem = async (itemId) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await api.delete(`/cart/${itemId}`);
      toast.success('Item removed from cart');
      fetchCart();
    } catch (error) {
      toast.error('Failed to remove item');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (cart.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        <div className="container mx-auto px-4 py-20">
          <AnimatedContainer animation="fadeIn">
            <Card className="text-center py-16 max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaShoppingBag className="text-4xl text-gray-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Your cart is empty</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Looks like you haven't added anything to your cart yet
              </p>
              <Link to="/products">
                <Button size="lg">
                  <FaArrowLeft className="mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </Card>
          </AnimatedContainer>
        </div>
      </div>
    );
  }

  const subtotal = total;
  const shipping = total > 5000 ? 0 : 100;
  const tax = total * 0.18;
  const finalTotal = subtotal + shipping + tax;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <AnimatedContainer animation="fadeIn">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
            <Link to="/products">
              <Button variant="outline">
                <FaArrowLeft className="mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </AnimatedContainer>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimatedContainer animation="slideInLeft">
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                    Cart Items ({cart.length})
                  </h2>
                  <div className="space-y-6">
                    {cart.map((item, index) => (
                      <AnimatedContainer key={item._id || item.product} animation="fadeIn" delay={index * 100}>
                        <div className={`flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-300 ${
                          updatingItems.has(item._id || item.product) ? 'opacity-50' : 'hover:shadow-md'
                        }`}>
                          <div className="relative group">
                            <img
                              src={item.image || '/placeholder.png'}
                              alt={item.name}
                              className="w-24 h-24 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg"></div>
                          </div>
                          
                          <div className="flex-1 ml-6">
                            <Link 
                              to={`/product/${item.product}`} 
                              className="font-semibold text-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 text-gray-900 dark:text-white"
                            >
                              {item.name}
                            </Link>
                            {item.variant && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {item.variant.storage} • {item.variant.ram} • {item.variant.color}
                              </p>
                            )}
                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                              ₹{item.price.toLocaleString()}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item._id || item.product, item.quantity - 1)}
                                disabled={item.quantity <= 1 || updatingItems.has(item._id || item.product)}
                                className="rounded-none border-0"
                              >
                                <FaMinus />
                              </Button>
                              <span className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold min-w-[3rem] text-center">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item._id || item.product, item.quantity + 1)}
                                disabled={updatingItems.has(item._id || item.product)}
                                className="rounded-none border-0"
                              >
                                <FaPlus />
                              </Button>
                            </div>
                            
                            {/* Item Total */}
                            <div className="text-right min-w-[6rem]">
                              <p className="font-bold text-lg text-gray-900 dark:text-white">
                                ₹{(item.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:text-red-500 hover:border-red-500"
                              >
                                <FaHeart />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeItem(item._id || item.product)}
                                disabled={updatingItems.has(item._id || item.product)}
                                className="hover:text-red-500 hover:border-red-500"
                                loading={updatingItems.has(item._id || item.product)}
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </AnimatedContainer>
                    ))}
                  </div>
                </div>
              </Card>
            </AnimatedContainer>
          </div>

          <div className="lg:col-span-1">
            <AnimatedContainer animation="slideInRight" delay={200}>
              <Card className="sticky top-24">
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Subtotal ({cart.length} items):</span>
                      <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Shipping:</span>
                      <span className="font-semibold">
                        {shipping === 0 ? (
                          <span className="text-green-600 dark:text-green-400">Free</span>
                        ) : (
                          `₹${shipping}`
                        )}
                      </span>
                    </div>
                    
                    {shipping === 0 && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        🎉 You saved ₹100 on shipping!
                      </p>
                    )}
                    
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Tax (18%):</span>
                      <span className="font-semibold">₹{tax.toLocaleString()}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                        <span>Total:</span>
                        <span>₹{finalTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Link to="/checkout" className="block">
                    <Button size="lg" className="w-full group">
                      Proceed to Checkout
                      <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
                    </Button>
                  </Link>
                  
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Secure checkout with SSL encryption
                    </p>
                  </div>
                </div>
              </Card>
            </AnimatedContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

