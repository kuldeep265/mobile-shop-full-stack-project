import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { FaTag } from "react-icons/fa";
import api from "../utils/api";
import AuthContext from "../context/AuthContext";

// ----------------------------
// FIX: VITE Environment Access
// ----------------------------
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_123"
);

const CheckoutForm = ({ orderData, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    try {
      const { data } = await api.post("/orders/create-payment-intent", {
        amount: orderData.totalPrice,
        orderId: orderData._id,
      });

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (error) {
        toast.error(error.message);
      } else if (paymentIntent.status === "succeeded") {
        await api.post(`/orders/${orderData._id}/pay`, {
          paymentIntentId: paymentIntent.id,
        });

        toast.success("Payment successful!");
        onSuccess();
      }
    } catch {
      toast.error("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-white border rounded shadow">
        <CardElement />
      </div>
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Processing..." : `Pay ₹${orderData.totalPrice.toLocaleString()}`}
      </button>
    </form>
  );
};

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupons, setAppliedCoupons] = useState([]); // Changed to array for multiple coupons
  const [totalCouponDiscount, setTotalCouponDiscount] = useState(0); // Total discount from all coupons
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // -------------------------
  // INITIAL LOAD
  // -------------------------
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchCart();

    // default address selection
    if (user.addresses?.length > 0) {
      const defaultAddr =
        user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setShippingAddress(defaultAddr);
    }
  }, [user]);

  // Fetch coupons whenever cart changes
  useEffect(() => {
    if (cart && cart.length > 0) {
      console.log('Cart changed, fetching coupons for:', cart);
      fetchAvailableCoupons(cart);
    } else {
      setAvailableCoupons([]);
    }
  }, [cart]);

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      console.log('Cart API response:', res.data);
      setCart(res.data.cart || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCoupons = async (cartItems) => {
    setLoadingCoupons(true);
    try {
      console.log('=== COUPON FETCH DEBUG ===');
      console.log('Cart items received:', cartItems);
      
      if (!cartItems || cartItems.length === 0) {
        console.log('No cart items provided');
        setAvailableCoupons([]);
        return;
      }
      
      // Extract product IDs from cart items
      const productIds = cartItems
        .map(item => {
          const productId = item.product; // This should be a string ID based on cart API
          console.log('Item:', item.name, 'Product ID:', productId);
          return productId;
        })
        .filter(id => id); // Remove any null/undefined IDs
      
      const uniqueProductIds = [...new Set(productIds)];
      console.log('Unique product IDs to fetch coupons for:', uniqueProductIds);
      
      if (uniqueProductIds.length === 0) {
        console.log('No valid product IDs found');
        setAvailableCoupons([]);
        return;
      }
      
      // Fetch coupons for each product
      const couponPromises = uniqueProductIds.map(async (productId) => {
        try {
          console.log(`Fetching coupons for product: ${productId}`);
          const response = await api.get(`/coupons/product/${productId}`);
          console.log(`Coupons for ${productId}:`, response.data.coupons);
          return response.data.coupons || [];
        } catch (error) {
          console.log(`Error fetching coupons for product ${productId}:`, error.response?.status, error.response?.data?.message);
          return [];
        }
      });
      
      const couponArrays = await Promise.all(couponPromises);
      const allCoupons = couponArrays.flat();
      
      console.log('All fetched coupons:', allCoupons);
      
      // Remove duplicates based on coupon ID
      const uniqueCoupons = allCoupons.filter((coupon, index, self) => 
        index === self.findIndex(c => c._id === coupon._id)
      );
      
      console.log('Final unique coupons to display:', uniqueCoupons);
      setAvailableCoupons(uniqueCoupons);
      
      if (uniqueCoupons.length > 0) {
        toast.success(`🎉 Found ${uniqueCoupons.length} available coupon(s) for your cart!`);
      } else {
        console.log('No coupons available for any cart items');
      }
    } catch (error) {
      console.error('Error in fetchAvailableCoupons:', error);
    } finally {
      setLoadingCoupons(false);
    }
  };

  // -------------------------
  // COUPON VALIDATION (MULTIPLE COUPONS SUPPORT)
  // -------------------------
  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    // Check if coupon is already applied
    if (appliedCoupons.some(c => c.coupon.code === couponCode.toUpperCase())) {
      toast.error("This coupon is already applied");
      return;
    }

    setValidatingCoupon(true);
    try {
      const cartItems = cart.map(item => ({
        product: item.product,
        price: item.price,
        quantity: item.quantity
      }));

      // Validate all coupons including the new one
      const allCouponCodes = [...appliedCoupons.map(c => c.coupon.code), couponCode];
      
      const res = await api.post("/coupons/validate-multiple", {
        coupons: allCouponCodes,
        cartItems
      });

      setAppliedCoupons(res.data.validatedCoupons);
      setTotalCouponDiscount(res.data.totalDiscount);
      setCouponCode(""); // Clear input after successful application
      toast.success(`Coupon applied! Total savings: ₹${res.data.totalDiscount}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = (couponToRemove) => {
    const updatedCoupons = appliedCoupons.filter(c => c.coupon.code !== couponToRemove.coupon.code);
    setAppliedCoupons(updatedCoupons);
    
    // Recalculate total discount
    const newTotalDiscount = updatedCoupons.reduce((sum, c) => sum + c.discountAmount, 0);
    setTotalCouponDiscount(newTotalDiscount);
    
    toast.success(`Coupon ${couponToRemove.coupon.code} removed`);
  };

  const removeAllCoupons = () => {
    setAppliedCoupons([]);
    setTotalCouponDiscount(0);
    setCouponCode("");
    toast.success("All coupons removed");
  };

  const applyQuickCoupon = async (coupon) => {
    // Check if coupon is already applied
    if (appliedCoupons.some(c => c.coupon.code === coupon.code)) {
      toast.error("This coupon is already applied");
      return;
    }

    setValidatingCoupon(true);
    
    try {
      const cartItems = cart.map(item => ({
        product: item.product,
        price: item.price,
        quantity: item.quantity
      }));

      // Validate all coupons including the new one
      const allCouponCodes = [...appliedCoupons.map(c => c.coupon.code), coupon.code];
      
      const res = await api.post("/coupons/validate-multiple", {
        coupons: allCouponCodes,
        cartItems
      });

      setAppliedCoupons(res.data.validatedCoupons);
      setTotalCouponDiscount(res.data.totalDiscount);
      toast.success(`Coupon ${coupon.code} applied! Total savings: ₹${res.data.totalDiscount}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  // -------------------------
  // PLACE ORDER (COD + Stripe Init)
  // -------------------------
  const handlePlaceOrder = async () => {
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address) {
      toast.error("Please fill all shipping details");
      return;
    }

    try {
      const res = await api.post("/orders", {
        orderItems: cart,
        shippingAddress,
        paymentMethod,
        appliedCoupons: appliedCoupons.map(c => ({
          code: c.coupon.code,
          discount: c.discountAmount,
          applicableItems: c.applicableItems
        })),
        totalCouponDiscount: totalCouponDiscount
      });

      setOrder(res.data.order);

      // Apply coupon usage for all applied coupons
      if (appliedCoupons.length > 0) {
        const couponCodes = appliedCoupons.map(c => c.coupon.code);
        await api.post("/coupons/apply-multiple", { codes: couponCodes });
      }

      if (paymentMethod === "cod") {
        toast.success("Order placed successfully!");
        navigate("/orders");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Order failed");
    }
  };

  // -------------------------
  // Razorpay Checkout
  // -------------------------
  const handleRazorpayPayment = async () => {
    if (!window.Razorpay) {
      toast.error("Razorpay SDK not loaded");
      return;
    }

    try {
      const { data } = await api.post("/orders/create-razorpay-order", {
        amount: order.totalPrice,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_123",
        amount: order.totalPrice * 100,
        currency: "INR",
        name: "Fone Factory",
        description: "Order Payment",
        order_id: data.orderId,
        handler: async (resp) => {
          await api.post(`/orders/${order._id}/pay`, {
            paymentId: resp.razorpay_payment_id,
            orderId: resp.razorpay_order_id,
            signature: resp.razorpay_signature,
          });
          toast.success("Payment successful!");
          navigate("/orders");
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch {
      toast.error("Failed to initialize payment");
    }
  };

  // -------------------------
  // LOADING SCREEN
  // -------------------------
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // -------------------------
  // EMPTY CART
  // -------------------------
  if (cart.length === 0 && !order) {
    return (
      <div className="container px-4 py-12 mx-auto text-center">
        <h2 className="mb-4 text-2xl font-bold">Your cart is empty</h2>
        <button onClick={() => navigate("/products")} className="text-blue-600 underline">
          Continue Shopping
        </button>
      </div>
    );
  }

  // -------------------------
  // PRICE CALCULATION
  // -------------------------
  const subtotal = total;
  const discount = totalCouponDiscount;
  const afterDiscount = subtotal - discount;
  const tax = Math.round(afterDiscount * 0.18);
  const shipping = afterDiscount > 5000 ? 0 : 100;
  const finalTotal = afterDiscount + tax + shipping;

  // -------------------------
  // PAYMENT SCREEN
  // -------------------------
  if (order) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <h1 className="mb-8 text-3xl font-bold">Payment</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-xl font-bold">Order Summary</h2>

            <div className="p-6 mb-6 bg-white rounded-lg shadow">
              <p>Order ID: {order._id}</p>
              <p>Total: ₹{order.totalPrice.toLocaleString()}</p>
            </div>

            {paymentMethod === "stripe" && (
              <Elements stripe={stripePromise}>
                <CheckoutForm orderData={order} onSuccess={() => navigate("/orders")} />
              </Elements>
            )}

            {paymentMethod === "razorpay" && (
              <button
                onClick={handleRazorpayPayment}
                className="w-full py-3 text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Pay with Razorpay
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------
  // CHECKOUT PAGE
  // -------------------------
  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

        {/* LEFT: SHIPPING */}
        <div>
          <h2 className="mb-4 text-xl font-bold">Shipping Address</h2>

          <div className="p-6 space-y-4 bg-white rounded-lg shadow">
            <input
              type="text"
              placeholder="Full Name"
              value={shippingAddress.name}
              onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
              className="w-full p-2 border rounded"
            />

            <input
              type="tel"
              placeholder="Phone Number"
              value={shippingAddress.phone}
              onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
              className="w-full p-2 border rounded"
            />

            <textarea
              placeholder="Address"
              value={shippingAddress.address}
              onChange={(e) =>
                setShippingAddress({ ...shippingAddress, address: e.target.value })
              }
              className="w-full p-2 border rounded"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="City"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="State"
                value={shippingAddress.state}
                onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                className="p-2 border rounded"
              />
            </div>

            <input
              type="text"
              placeholder="Pincode"
              value={shippingAddress.pincode}
              onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* PAYMENT METHOD */}
          <h2 className="mt-8 mb-4 text-xl font-bold">Payment Method</h2>

          <div className="p-6 space-y-2 bg-white rounded-lg shadow">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              Cash on Delivery
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={paymentMethod === "stripe"}
                onChange={() => setPaymentMethod("stripe")}
              />
              Stripe (Card)
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={paymentMethod === "razorpay"}
                onChange={() => setPaymentMethod("razorpay")}
              />
              Razorpay (UPI/Card)
            </label>
          </div>

          {/* Coupon */}
          <div className="p-6 mt-4 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Apply Coupons</h3>
              {appliedCoupons.length > 0 && (
                <button
                  onClick={removeAllCoupons}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove All
                </button>
              )}
            </div>
            
            {/* Applied Coupons Display */}
            {appliedCoupons.length > 0 && (
              <div className="mb-4 space-y-2">
                <h4 className="text-sm font-medium text-green-700">Applied Coupons:</h4>
                {appliedCoupons.map((appliedCoupon, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                    <div>
                      <span className="font-semibold text-green-800">{appliedCoupon.coupon.code}</span>
                      <p className="text-sm text-green-600">
                        Saved ₹{appliedCoupon.discountAmount} on {appliedCoupon.applicableItems.length} item(s)
                      </p>
                    </div>
                    <button
                      onClick={() => removeCoupon(appliedCoupon)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div className="p-2 bg-green-100 rounded text-center">
                  <span className="font-semibold text-green-800">
                    Total Savings: ₹{totalCouponDiscount}
                  </span>
                </div>
              </div>
            )}

            {/* Add New Coupon */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={validateCoupon}
                disabled={validatingCoupon || !couponCode.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {validatingCoupon ? "Validating..." : "Add Coupon"}
              </button>
              <button
                onClick={() => fetchAvailableCoupons(cart)}
                disabled={loadingCoupons}
                className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                title="Refresh available coupons"
              >
                🔄
              </button>
            </div>

                {/* Available Coupons */}
                {availableCoupons.filter(coupon => 
                  !appliedCoupons.some(applied => applied.coupon.code === coupon.code)
                ).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FaTag className="text-green-600" />
                      <h4 className="text-sm font-medium text-gray-700">Available offers for your cart:</h4>
                    </div>
                    <div className="space-y-2">
                      {availableCoupons
                        .filter(coupon => !appliedCoupons.some(applied => applied.coupon.code === coupon.code))
                        .map((coupon) => (
                        <div key={coupon._id} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono font-bold text-green-700 bg-white px-2 py-1 rounded text-sm border">
                                {coupon.code}
                              </span>
                              <span className="text-sm font-semibold text-green-800">
                                {coupon.discountType === 'percentage' 
                                  ? `${coupon.discount}% OFF` 
                                  : `₹${coupon.discount} OFF`}
                              </span>
                            </div>
                            {coupon.description && (
                              <p className="text-xs text-gray-600">{coupon.description}</p>
                            )}
                            {coupon.minPurchase > 0 && (
                              <p className="text-xs text-gray-500">Min purchase: ₹{coupon.minPurchase.toLocaleString()}</p>
                            )}
                          </div>
                          <button
                            onClick={() => applyQuickCoupon(coupon)}
                            disabled={validatingCoupon}
                            className="ml-3 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            {validatingCoupon ? "Applying..." : "Apply"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {loadingCoupons && (
                  <div className="text-center py-2">
                    <span className="text-sm text-gray-500">Loading available offers...</span>
                  </div>
                )}

                {!loadingCoupons && 
                 availableCoupons.filter(coupon => 
                   !appliedCoupons.some(applied => applied.coupon.code === coupon.code)
                 ).length === 0 && 
                 cart.length > 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <FaTag className="mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">
                      {availableCoupons.length === 0 
                        ? "No coupons available for items in your cart."
                        : "All available coupons have been applied!"
                      }
                    </p>
                    {availableCoupons.length === 0 && (
                      <p className="text-xs">Generate coupons from Admin → Manage Products</p>
                    )}
                    <button
                      onClick={() => fetchAvailableCoupons(cart)}
                      className="mt-2 px-3 py-1 bg-blue-200 text-blue-700 text-xs rounded hover:bg-blue-300"
                    >
                      🔄 Refresh Available Coupons
                    </button>
                  </div>
                )}
          </div>
        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <div>
          <h2 className="mb-4 text-xl font-bold">Order Summary</h2>

          <div className="p-6 bg-white rounded-lg shadow">
            {cart.map((item) => (
              <div key={item.product} className="flex justify-between mb-2">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}

            <div className="pt-4 mt-4 space-y-1 border-t">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>

              {discount > 0 && (
                <div className="text-green-600">
                  {appliedCoupons.length === 1 ? (
                    <div className="flex justify-between">
                      <span>Coupon Discount ({appliedCoupons[0].coupon.code}):</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between font-medium">
                        <span>Total Coupon Discounts ({appliedCoupons.length} coupons):</span>
                        <span>-₹{discount.toLocaleString()}</span>
                      </div>
                      {appliedCoupons.map((appliedCoupon, index) => (
                        <div key={index} className="flex justify-between text-sm ml-4">
                          <span>• {appliedCoupon.coupon.code}:</span>
                          <span>-₹{appliedCoupon.discountAmount.toLocaleString()}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>

              <div className="flex justify-between">
                <span>Tax (18%):</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>

              <div className="flex justify-between pt-2 text-lg font-bold border-t">
                <span>Total:</span>
                <span>₹{finalTotal.toLocaleString()}</span>
              </div>

              {discount > 0 && (
                <div className="text-sm text-green-600 text-center">
                  You saved ₹{discount.toLocaleString()} with {appliedCoupons.length} coupon{appliedCoupons.length > 1 ? 's' : ''}!
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                className="w-full py-3 mt-6 text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Place Order
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Checkout;
