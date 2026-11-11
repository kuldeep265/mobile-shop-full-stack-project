import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaCreditCard, FaCheckCircle, FaTimesCircle, FaTruck, FaClock } from 'react-icons/fa';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Order not found');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status });
      toast.success('Order status updated');
      fetchOrder(); // Refresh order data
    } catch (error) {
      toast.error('Failed to update status');
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

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Order not found</h2>
        <Link to="/admin/orders" className="text-blue-600 hover:underline">
          Back to Orders
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
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft />
            Back to Orders
          </button>
          <h1 className="text-3xl font-bold">Order Details</h1>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(order.status)}
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
            {order.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Order ID:</span>
                <p className="font-semibold">#{order._id}</p>
              </div>
              <div>
                <span className="text-gray-600">Order Date:</span>
                <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-600">Payment Status:</span>
                <p className={`font-semibold ${order.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                  {order.isPaid ? 'Paid' : 'Unpaid'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Payment Method:</span>
                <p className="font-semibold">{order.paymentMethod || 'N/A'}</p>
              </div>
              {order.isPaid && order.paidAt && (
                <div>
                  <span className="text-gray-600">Paid At:</span>
                  <p className="font-semibold">{new Date(order.paidAt).toLocaleDateString()}</p>
                </div>
              )}
              {order.isDelivered && order.deliveredAt && (
                <div>
                  <span className="text-gray-600">Delivered At:</span>
                  <p className="font-semibold">{new Date(order.deliveredAt).toLocaleDateString()}</p>
                </div>
              )}
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
                    <h3 className="font-semibold">{item.name}</h3>
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
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaUser />
              Customer Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FaUser className="text-gray-400" />
                <span>{order.user?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-gray-400" />
                <span>{order.user?.email || 'N/A'}</span>
              </div>
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
                <p>{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>{order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="flex items-center gap-2 mt-2">
                    <FaPhone className="text-gray-400" />
                    {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Status Update */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Update Status</h2>
            <div className="space-y-3">
              <select
                value={order.status}
                onChange={(e) => updateStatus(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <p className="text-sm text-gray-600">
                Current status: <span className="font-semibold">{order.status}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => updateStatus('processing')}
                disabled={order.status === 'processing'}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark as Processing
              </button>
              <button
                onClick={() => updateStatus('shipped')}
                disabled={order.status === 'shipped' || order.status === 'delivered'}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark as Shipped
              </button>
              <button
                onClick={() => updateStatus('delivered')}
                disabled={order.status === 'delivered'}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark as Delivered
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;