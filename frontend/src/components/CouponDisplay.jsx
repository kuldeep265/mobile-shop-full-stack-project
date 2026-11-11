import React, { useState, useEffect } from 'react';
import { FaTag, FaCopy } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../utils/api';

const CouponDisplay = ({ productId, className = '' }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      fetchApplicableCoupons();
    }
  }, [productId]);

  const fetchApplicableCoupons = async () => {
    try {
      // This would need a new backend route to get applicable coupons for a product
      const res = await api.get(`/coupons/product/${productId}`);
      setCoupons(res.data.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code ${code} copied to clipboard!`);
  };

  if (loading || coupons.length === 0) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <FaTag className="text-green-600" />
        <h3 className="font-semibold text-green-800">Available Offers</h3>
      </div>
      
      <div className="space-y-2">
        {coupons.map((coupon) => (
          <div key={coupon._id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-100">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-green-700 bg-green-100 px-2 py-1 rounded text-sm">
                  {coupon.code}
                </span>
                <span className="text-sm text-gray-600">
                  {coupon.discountType === 'percentage' 
                    ? `${coupon.discount}% OFF` 
                    : `₹${coupon.discount} OFF`}
                </span>
              </div>
              {coupon.description && (
                <p className="text-xs text-gray-500 mt-1">{coupon.description}</p>
              )}
              {coupon.minPurchase > 0 && (
                <p className="text-xs text-gray-500">Min purchase: ₹{coupon.minPurchase}</p>
              )}
            </div>
            <button
              onClick={() => copyCouponCode(coupon.code)}
              className="ml-2 p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
              title="Copy code"
            >
              <FaCopy size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CouponDisplay;