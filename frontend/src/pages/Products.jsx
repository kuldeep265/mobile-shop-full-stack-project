import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { FaStar, FaShoppingCart, FaHeart, FaFilter, FaSearch, FaTh, FaList, FaChevronDown } from 'react-icons/fa';
import SaleTag from '../components/SaleTag';
import CompareButton from '../components/CompareButton';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';

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
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState(filters.search);

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

  const handleSearch = (e) => {
    e.preventDefault();
    handleFilterChange('search', searchQuery);
  };

  const ProductCard = ({ product, index = 0 }) => (
    <AnimatedContainer animation="fadeIn" delay={index * 50}>
      <Card className="overflow-hidden group relative h-full">
        <SaleTag discount={product.discount} />
        <div className="relative overflow-hidden">
          <Link to={`/product/${product._id}`}>
            <img
              src={product.images[0]?.url || '/placeholder.png'}
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
        <div className="p-4 flex flex-col flex-grow">
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
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="ml-2 text-gray-500 line-through text-sm">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {product.stock > 0 ? (
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">In Stock</span>
            ) : (
              <span className="text-sm text-red-600 dark:text-red-400 font-medium">Out of Stock</span>
            )}
          </div>
          <div className="flex space-x-2 mt-auto">
            <Button 
              variant="primary" 
              size="sm" 
              className="flex-1 group"
              disabled={product.stock === 0}
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

  const ProductListItem = ({ product, index = 0 }) => (
    <AnimatedContainer animation="slideInLeft" delay={index * 50}>
      <Card className="flex flex-col md:flex-row overflow-hidden group">
        <div className="relative md:w-48 h-48 md:h-auto overflow-hidden">
          <SaleTag discount={product.discount} />
          <Link to={`/product/${product._id}`}>
            <img
              src={product.images[0]?.url || '/placeholder.png'}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </Link>
        </div>
        <div className="flex-1 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex-1">
              <Link to={`/product/${product._id}`}>
                <h3 className="text-xl font-semibold mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                  {product.name}
                </h3>
              </Link>
              <p className="text-gray-600 dark:text-gray-400 mb-3">{product.brand}</p>
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
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                {product.description}
              </p>
            </div>
            <div className="md:text-right mt-4 md:mt-0 md:ml-6">
              <div className="mb-4">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="text-gray-500 line-through text-sm">
                    ₹{product.originalPrice.toLocaleString()}
                  </div>
                )}
              </div>
              {product.stock > 0 ? (
                <span className="text-sm text-green-600 dark:text-green-400 font-medium block mb-4">In Stock</span>
              ) : (
                <span className="text-sm text-red-600 dark:text-red-400 font-medium block mb-4">Out of Stock</span>
              )}
              <div className="flex space-x-2">
                <Button 
                  variant="primary" 
                  size="sm"
                  disabled={product.stock === 0}
                >
                  <FaShoppingCart className="mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="sm">
                  <FaHeart />
                </Button>
                <CompareButton product={product} />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </AnimatedContainer>
  );

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
    setSearchQuery('');
    setCurrentPage(1);
    setSearchParams({});
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <AnimatedContainer animation="fadeIn">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Products</h1>
            <p className="text-gray-600 dark:text-gray-400">Discover our amazing collection of smartphones</p>
          </div>
        </AnimatedContainer>

        {/* Search Bar */}
        <AnimatedContainer animation="fadeIn" delay={200}>
          <Card className="mb-8">
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                icon={FaSearch}
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="md">
                Search
              </Button>
            </form>
          </Card>
        </AnimatedContainer>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <AnimatedContainer animation="slideInLeft" delay={300}>
            <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <Card className="sticky top-24">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center">
                    <FaFilter className="mr-2" />
                    Filters
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                  >
                    Clear All
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Brand Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Brand</label>
                    <select
                      value={filters.brand}
                      onChange={(e) => handleFilterChange('brand', e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <option value="">All Brands</option>
                      {brands.map((brand) => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Price Range</label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Minimum Rating</label>
                    <select
                      value={filters.minRating}
                      onChange={(e) => handleFilterChange('minRating', e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <option value="">All Ratings</option>
                      <option value="4">4+ Stars</option>
                      <option value="3">3+ Stars</option>
                      <option value="2">2+ Stars</option>
                      <option value="1">1+ Stars</option>
                    </select>
                  </div>

                  {/* Storage Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Storage</label>
                    <select
                      value={filters.storage}
                      onChange={(e) => handleFilterChange('storage', e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <option value="">All Storage</option>
                      <option value="64GB">64GB</option>
                      <option value="128GB">128GB</option>
                      <option value="256GB">256GB</option>
                      <option value="512GB">512GB</option>
                    </select>
                  </div>

                  {/* RAM Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">RAM</label>
                    <select
                      value={filters.ram}
                      onChange={(e) => handleFilterChange('ram', e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <option value="">All RAM</option>
                      <option value="4GB">4GB</option>
                      <option value="6GB">6GB</option>
                      <option value="8GB">8GB</option>
                      <option value="12GB">12GB</option>
                    </select>
                  </div>
                </div>
              </Card>
            </div>
          </AnimatedContainer>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Controls */}
            <AnimatedContainer animation="fadeIn" delay={400}>
              <Card className="mb-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    <FaFilter className="mr-2" /> 
                    {showFilters ? 'Hide' : 'Show'} Filters
                  </Button>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {products.length} products found
                    </span>
                    
                    {/* View Mode Toggle */}
                    <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 ${viewMode === 'grid' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        } transition-colors duration-200`}
                      >
                        <FaTh />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 ${viewMode === 'list' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        } transition-colors duration-200`}
                      >
                        <FaList />
                      </button>
                    </div>
                    
                    {/* Sort Dropdown */}
                    <div className="relative">
                      <select
                        value={filters.sort}
                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                        className="appearance-none border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      >
                        <option value="newest">Newest</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                      </select>
                      <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </Card>
            </AnimatedContainer>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : products.length === 0 ? (
              <AnimatedContainer animation="fadeIn">
                <Card className="text-center py-20">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">No products found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your filters or search terms</p>
                  <Button onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </Card>
              </AnimatedContainer>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.map((product, index) => (
                      <ProductCard key={product._id} product={product} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {products.map((product, index) => (
                      <ProductListItem key={product._id} product={product} index={index} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <AnimatedContainer animation="fadeIn" delay={600}>
                    <Card className="mt-8">
                      <div className="flex justify-center items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        {[...Array(totalPages)].map((_, i) => (
                          <Button
                            key={i + 1}
                            variant={currentPage === i + 1 ? 'primary' : 'outline'}
                            onClick={() => setCurrentPage(i + 1)}
                            size="sm"
                          >
                            {i + 1}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </Card>
                  </AnimatedContainer>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;

