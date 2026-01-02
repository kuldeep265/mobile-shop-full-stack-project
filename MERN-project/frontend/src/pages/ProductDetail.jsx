import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';
import { FaStar, FaShoppingCart, FaHeart, FaCheck } from 'react-icons/fa';
import SaleTag from '../components/SaleTag';
import CompareButton from '../components/CompareButton';
import CouponDisplay from '../components/CouponDisplay';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    fetchRecommendations();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      setProduct(res.data.product);
      if (res.data.product.variants && res.data.product.variants.length > 0) {
        setSelectedVariant(res.data.product.variants[0]);
      }
    } catch (error) {
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/product/${id}`);
      setReviews(res.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await api.get(`/recommendations/${id}`);
      setRecommendations(res.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      await api.post('/cart', {
        productId: id,
        quantity,
        variant: selectedVariant
      });
      toast.success('Product added to cart!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }

    try {
      await api.post(`/wishlist/${id}`);
      toast.success('Added to wishlist!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to wishlist');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }

    try {
      await api.post('/reviews', {
        productId: id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      toast.success('Review submitted!');
      setReviewForm({ rating: 5, comment: '' });
      setShowReviewForm(false);
      fetchReviews();
      fetchProduct();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!product) {
    return null;
  }

  const images = product.images.map(img => ({
    original: img.url,
    thumbnail: img.url
  }));

  const currentPrice = (selectedVariant && selectedVariant.price) ? selectedVariant.price : product.price;

  // Debug logging (remove in production)
  console.log('Product price:', product.price);
  console.log('Selected variant:', selectedVariant);
  console.log('Current price:', currentPrice);
  console.log('Original price:', product.originalPrice);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div>
          {images.length > 0 ? (
            <ImageGallery items={images} showPlayButton={false} />
          ) : (
            <img src="/placeholder.png" alt={product.name} className="w-full" />
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-xl text-gray-600 mb-4">{product.brand}</p>
          
          <div className="flex items-center mb-4">
            <div className="flex text-yellow-400 mr-2">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < Math.floor(product.ratings?.average || 0) ? 'fill-current' : ''} />
              ))}
            </div>
            <span className="text-gray-600">({product.numReviews || 0} reviews)</span>
          </div>

          <div className="mb-6">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-3xl font-bold text-blue-600">₹{currentPrice.toLocaleString()}</span>
              {product.originalPrice && product.originalPrice > currentPrice && (
                <span className="text-xl text-gray-500 line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
              {product.discount > 0 && (
                <span className="text-green-600 font-semibold">{product.discount}% OFF</span>
              )}
            </div>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Select Variant:</h3>
              <div className="grid grid-cols-2 gap-2">
                {product.variants.map((variant, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedVariant(variant)}
                    className={`p-3 border rounded ${
                      selectedVariant.storage === variant.storage &&
                      selectedVariant.color === variant.color
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <div className="text-sm">
                      <div>{variant.storage} / {variant.ram}</div>
                      <div className="text-gray-600">{variant.color}</div>
                      <div className="font-semibold">₹{variant.price.toLocaleString()}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <div className="flex items-center text-green-600">
                <FaCheck className="mr-2" />
                <span>In Stock ({product.stock} available)</span>
              </div>
            ) : (
              <div className="text-red-600">Out of Stock</div>
            )}
          </div>

          {/* Quantity & Actions */}
          <div className="mb-6">
            <label className="block mb-2">Quantity:</label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-20 border border-gray-300 rounded px-3 py-2"
              />
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                <FaShoppingCart className="mr-2" />
                Add to Cart
              </button>
              <button
                onClick={handleAddToWishlist}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                <FaHeart />
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Description:</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Available Coupons */}
          <CouponDisplay productId={id} className="mb-6" />
        </div>
      </div>

      {/* Specifications */}
      {product.specifications && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Specifications</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key}>
                  <span className="font-semibold capitalize">{key}:</span> {value}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Reviews ({reviews.length})</h2>
          {user && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Write Review
            </button>
          )}
        </div>

        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="bg-gray-50 p-6 rounded-lg mb-6">
            <div className="mb-4">
              <label className="block mb-2">Rating:</label>
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value={5}>5 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={2}>2 Stars</option>
                <option value={1}>1 Star</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Comment:</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows="4"
                required
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Submit Review
            </button>
          </form>
        )}

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-600">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold">{review.user?.name || 'Anonymous'}</span>
                    <div className="flex text-yellow-400 ml-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < review.rating ? 'fill-current' : ''} />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Similar Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((rec) => (
              <div key={rec._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow relative">
                <SaleTag discount={rec.discount} />
                <Link to={`/product/${rec._id}`}>
                  <img src={rec.images[0]?.url || '/placeholder.png'} alt={rec.name} className="w-full h-48 object-cover" />
                </Link>
                <div className="p-4">
                  <Link to={`/product/${rec._id}`}>
                    <h3 className="font-semibold mb-2 hover:text-blue-600">{rec.name}</h3>
                  </Link>
                  <div className="mb-3">
                    <span className="text-blue-600 font-bold">₹{rec.price.toLocaleString()}</span>
                    {rec.originalPrice && rec.originalPrice > rec.price && (
                      <span className="ml-2 text-gray-500 line-through text-sm">
                        ₹{rec.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <CompareButton product={rec} className="w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;

