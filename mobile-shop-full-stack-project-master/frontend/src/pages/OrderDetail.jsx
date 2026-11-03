import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaTruck, FaClock, FaMapMarkerAlt, FaCreditCard } from 'react-icons/fa';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrder();
  }, [id, user]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Order not found');
      navigate('/orders');
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
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending':
        return 'Your order has been received and is being processed.';
      case 'processing':
        return 'Your order is being prepared for shipment.';
      case 'shipped':
        return 'Your order has been shipped and is on its way.';
      case 'delivered':
        return 'Your order has been delivered successfully.';
      case 'cancelled':
        return 'Your order has been cancelled.';
      default:
        return 'Order status unknown.';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Order not found</h2>
        <Link to="/orders" className="text-blue-600 hover:underline">
          Back to My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft />
            Back to My Orders
          </button>
          <h1 className="text-3xl font-bold">Order Details</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Order Status</h2>
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                  {order.status.toUpperCase()}
                </span>
              </div>
            </div>
            <p className="text-gray-600">{getStatusMessage(order.status)}</p>
            
            {/* Order Timeline */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm">
                <div className={`flex flex-col items-center ${['pending', 'processing', 'shipped', 'delivered'].includes(order.status) ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-4 h-4 rounded-full ${['pending', 'processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                  <span className="mt-1">Ordered</span>
                </div>
                <div className={`flex-1 h-1 mx-2 ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                <div className={`flex flex-col items-center ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-4 h-4 rounded-full ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                  <span className="mt-1">Processing</span>
                </div>
                <div className={`flex-1 h-1 mx-2 ${['shipped', 'delivered'].includes(order.status) ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                <div className={`flex flex-col items-center ${['shipped', 'delivered'].includes(order.status) ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-4 h-4 rounded-full ${['shipped', 'delivered'].includes(order.status) ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                  <span className="mt-1">Shipped</span>
                </div>
                <div className={`flex-1 h-1 mx-2 ${order.status === 'delivered' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                <div className={`flex flex-col items-center ${order.status === 'delivered' ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-4 h-4 rounded-full ${order.status === 'delivered' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                  <span className="mt-1">Delivered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 border rounded-lg">
                  <img
                    src={item.image || item.product?.images?.[0]?.url || '/placeholder.png'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      e.target.src = '/placeholder.png';
                    }}
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
                    <p className="text-sm text-gray-600">Price: ₹{item.price.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div className="border-t mt-6 pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount:</span>
                <span className="text-blue-600">₹{order.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-semibold">#{order._id.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className={`font-semibold ${order.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                  {order.isPaid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
              {order.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold">{order.paymentMethod}</span>
                </div>
              )}
              {order.isPaid && order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid At:</span>
                  <span className="font-semibold">{new Date(order.paidAt).toLocaleDateString()}</span>
                </div>
              )}
              {order.isDelivered && order.deliveredAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivered At:</span>
                  <span className="font-semibold">{new Date(order.deliveredAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaMapMarkerAlt />
                Shipping Address
              </h2>
              <div className="text-sm space-y-1">
                <p className="font-semibold">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>{order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
                )}
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaCreditCard />
              Payment Information
            </h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className={`font-semibold ${order.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                  {order.isPaid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
              {order.paymentMethod && (
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="font-semibold">{order.paymentMethod}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-semibold text-blue-600">₹{order.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
            <div className="space-y-2">
              <Link
                to="/chat"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center block"
              >
                Contact Support
              </Link>
              <Link
                to="/products"
                className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-center block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;