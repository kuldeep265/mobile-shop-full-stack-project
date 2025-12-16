import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { FaStar, FaShoppingCart, FaHeart, FaFilter } from 'react-icons/fa';
import SaleTag from '../components/SaleTag';
import CompareButton from '../components/CompareButton';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [brands, setBrands] = useState([]);
  const [filters, setFilters] = useState({
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    storage: searchParams.get('storage') || '',
    ram: searchParams.get('ram') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'newest',
    newArrival: searchParams.get('newArrival') || '',
    bestSeller: searchParams.get('bestSeller') || ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, filters]);

  const fetchBrands = async () => {
    try {
      const res = await api.get('/products/brands/list');
      setBrands(res.data.brands);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12,
        ...filters
      };
      const res = await api.get('/products', { params });
      setProducts(res.data.products || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
    const newParams = new URLSearchParams({ ...filters, [key]: value });
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    const clearedFilters = {
      brand: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      storage: '',
      ram: '',
      search: '',
      sort: 'newest',
      newArrival: '',
      bestSeller: ''
    };
    setFilters(clearedFilters);
    setCurrentPage(1);
    setSearchParams({});
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className={`md:w-64 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white p-4 rounded-lg shadow-md sticky top-20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Brand Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Brand</label>
              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Minimum Rating</label>
              <select
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Ratings</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
              </select>
            </div>

            {/* Storage Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Storage</label>
              <select
                value={filters.storage}
                onChange={(e) => handleFilterChange('storage', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All Storage</option>
                <option value="64GB">64GB</option>
                <option value="128GB">128GB</option>
                <option value="256GB">256GB</option>
                <option value="512GB">512GB</option>
              </select>
            </div>

            {/* RAM Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">RAM</label>
              <select
                value={filters.ram}
                onChange={(e) => handleFilterChange('ram', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">All RAM</option>
                <option value="4GB">4GB</option>
                <option value="6GB">6GB</option>
                <option value="8GB">8GB</option>
                <option value="12GB">12GB</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Search and Sort */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden mb-4 flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg"
            >
              <FaFilter /> Filters
            </button>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">No products found</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow relative">
                    <SaleTag discount={product.discount} />
                    <Link to={`/product/${product._id}`}>
                      <img
                        src={product.images[0]?.url || '/placeholder.png'}
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
                        <span className="ml-2 text-sm text-gray-600">({product.numReviews || 0})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-blue-600">₹{product.price.toLocaleString()}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="ml-2 text-gray-500 line-through text-sm">
                              ₹{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {product.stock > 0 ? (
                          <span className="text-sm text-green-600">In Stock</span>
                        ) : (
                          <span className="text-sm text-red-600">Out of Stock</span>
                        )}
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
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 border rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : ''}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;

