import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FaStar, FaShoppingCart, FaHeart, FaArrowRight, FaTruck, FaShieldAlt, FaHeadset } from 'react-icons/fa';
import SaleTag from '../components/SaleTag';
import CompareButton from '../components/CompareButton';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner, { PageLoader } from '../components/ui/LoadingSpinner';

const Home = () => {
  console.log('Home component is rendering');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setError(null);
      const [featured, bestSeller, newArrival] = await Promise.all([
        api.get('/products?limit=8&isFeatured=true').catch(() => ({ data: { products: [] } })),
        api.get('/products?limit=8&bestSeller=true&sort=rating').catch(() => ({ data: { products: [] } })),
        api.get('/products?limit=8&newArrival=true&sort=newest').catch(() => ({ data: { products: [] } }))
      ]);

      setFeaturedProducts(featured.data?.products || []);
      setBestSellers(bestSeller.data?.products || []);
      setNewArrivals(newArrival.data?.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. The page will still work.');
    } finally {
      setLoading(false);
    }
  };

  const ProductCard = ({ product, index = 0 }) => (
    <AnimatedContainer animation="fadeIn" delay={index * 100}>
      <Card className="overflow-hidden group relative">
        <SaleTag discount={product.discount} />
        <div className="relative overflow-hidden">
          <Link to={`/product/${product._id}`}>
            <img
              src={product.images?.[0]?.url || '/placeholder.png'}
              alt={product.name}
              className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </Link>
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <Link 
              to={`/product/${product._id}`}
              className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
            >
              <Button variant="primary" size="sm">
                Quick View
              </Button>
            </Link>
          </div>
        </div>
        <div className="p-4">
          <Link to={`/product/${product._id}`}>
            <h3 className="text-lg font-semibold mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <p className="text-gray-600 dark:text-gray-400 mb-2 text-sm">{product.brand}</p>
          <div className="flex items-center mb-3">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <FaStar 
                  key={i} 
                  className={`transition-colors duration-200 ${
                    i < Math.floor(product.ratings?.average || 0) ? 'text-yellow-400' : 'text-gray-300'
                  }`} 
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              ({product.numReviews || 0})
            </span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ₹{product.price?.toLocaleString() || '0'}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="ml-2 text-gray-500 line-through text-sm">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="primary" 
              size="sm" 
              className="flex-1 group"
            >
              <FaShoppingCart className="mr-2 group-hover:animate-bounce" />
              Add to Cart
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="hover:text-red-500 hover:border-red-500"
            >
              <FaHeart />
            </Button>
            <CompareButton product={product} />
          </div>
        </div>
      </Card>
    </AnimatedContainer>
  );

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-10 rounded-full animate-bounce"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white opacity-10 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white opacity-10 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <AnimatedContainer animation="fadeIn">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Welcome to Fone Factory
            </h1>
          </AnimatedContainer>
          <AnimatedContainer animation="fadeIn" delay={300}>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Discover the latest smartphones at unbeatable prices with premium quality and exceptional service
            </p>
          </AnimatedContainer>
          <AnimatedContainer animation="fadeIn" delay={600}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/products">
                <button className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-white text-blue-600 hover:bg-gray-100 hover:text-blue-700 shadow-xl hover:shadow-2xl">
                  Shop Now
                  <FaArrowRight className="ml-2" />
                </button>
              </Link>
              <Link to="/products?category=featured">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                  View Featured
                </Button>
              </Link>
            </div>
          </AnimatedContainer>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <AnimatedContainer animation="fadeIn">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Why Choose Fone Factory?
            </h2>
          </AnimatedContainer>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedContainer animation="slideInLeft" delay={200}>
              <Card className="text-center group">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FaTruck className="text-2xl text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Free Shipping</h3>
                <p className="text-gray-600 dark:text-gray-400">Free delivery on orders above ₹999</p>
              </Card>
            </AnimatedContainer>
            <AnimatedContainer animation="fadeIn" delay={400}>
              <Card className="text-center group">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FaShieldAlt className="text-2xl text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Secure Payment</h3>
                <p className="text-gray-600 dark:text-gray-400">100% secure payment processing</p>
              </Card>
            </AnimatedContainer>
            <AnimatedContainer animation="slideInRight" delay={600}>
              <Card className="text-center group">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FaHeadset className="text-2xl text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">24/7 Support</h3>
                <p className="text-gray-600 dark:text-gray-400">Round the clock customer support</p>
              </Card>
            </AnimatedContainer>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <AnimatedContainer animation="fadeIn">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Featured Products</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Handpicked selection of the best smartphones with cutting-edge technology
              </p>
            </div>
          </AnimatedContainer>
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <ProductCard key={product._id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <AnimatedContainer animation="fadeIn">
              <Card className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No featured products available. Add products through admin dashboard.
                </p>
              </Card>
            </AnimatedContainer>
          )}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <AnimatedContainer animation="fadeIn">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Best Sellers</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Most popular phones loved by our customers
              </p>
            </div>
          </AnimatedContainer>
          {bestSellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((product, index) => (
                <ProductCard key={product._id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <AnimatedContainer animation="fadeIn">
              <Card className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No best sellers available yet.
                </p>
              </Card>
            </AnimatedContainer>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <AnimatedContainer animation="fadeIn">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">New Arrivals</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Latest smartphones with the newest technology and features
              </p>
            </div>
          </AnimatedContainer>
          {newArrivals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product, index) => (
                <ProductCard key={product._id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <AnimatedContainer animation="fadeIn">
              <Card className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No new arrivals available yet.
                </p>
              </Card>
            </AnimatedContainer>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
