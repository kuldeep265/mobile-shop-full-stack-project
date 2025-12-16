import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FaStar, FaShoppingCart, FaHeart } from 'react-icons/fa';
import SaleTag from '../components/SaleTag';
import CompareButton from '../components/CompareButton';

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

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow relative">
      <SaleTag discount={product.discount} />
      <Link to={`/product/${product._id}`}>
        <img
          src={product.images?.[0]?.url || '/placeholder.png'}
          alt={product.name}
          className="w-full h-64 object-cover"
        />
      </Link>
      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-semibold mb-2 hover:text-blue-600">{product.name}</h3>
        </Link>
        <p className="text-gray-600 mb-2">{product.brand}</p>
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={i < Math.floor(product.ratings?.average || 0) ? 'fill-current' : ''} />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">
            ({product.numReviews || 0})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-blue-600">₹{product.price?.toLocaleString() || '0'}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="ml-2 text-gray-500 line-through text-sm">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <div className="mt-4 flex space-x-2">
          <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center">
            <FaShoppingCart className="mr-2" />
            Add to Cart
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100">
            <FaHeart />
          </button>
          <CompareButton product={product} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Loading...</div>
          {error && <div className="text-red-600">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to Fone Factory</h1>
          <p className="text-xl mb-8">Discover the latest smartphones at unbeatable prices</p>
          <Link
            to="/products"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No featured products available. Add products through admin dashboard.</p>
        )}
      </section>

      {/* Best Sellers */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Best Sellers</h2>
          {bestSellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No best sellers available yet.</p>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-12 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">New Arrivals</h2>
        {newArrivals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No new arrivals available yet.</p>
        )}
      </section>
    </div>
  );
};

export default Home;
