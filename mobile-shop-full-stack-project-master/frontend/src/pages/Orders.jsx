import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { FaCheckCircle, FaTimesCircle, FaTruck, FaClock } from 'react-icons/fa';

const Orders = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/myorders');
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FaCheckCircle className="text-green-600" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-600" />;
      case 'shipped':
        return <FaTruck className="text-blue-600" />;
      default:
        return <FaClock className="text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
        <Link to="/products" className="text-blue-600 hover:underline">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">Order #{order._id.slice(-8)}</h3>
                <p className="text-sm text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                  {order.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              {order.orderItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <img
                    src={item.image || '/placeholder.png'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <Link to={`/product/${item.product}`} className="font-semibold hover:text-blue-600">
                      {item.name}
                    </Link>
                    {item.variant && (
                      <p className="text-sm text-gray-600">
                        {item.variant.storage} / {item.variant.ram} / {item.variant.color}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mt-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-xl font-bold">₹{order.totalPrice.toLocaleString()}</p>
              </div>
              <Link
                to={`/orders/${order._id}`}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;

