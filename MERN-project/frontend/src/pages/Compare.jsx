import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { FaStar, FaTimes, FaShoppingCart } from 'react-icons/fa';
import { useCompare } from '../context/CompareContext';
import SaleTag from '../components/SaleTag';

const Compare = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (compareList.length >= 2) {
      fetchProducts(compareList.map(p => p._id));
    } else {
      setProducts([]);
    }
  }, [compareList]);

  const fetchProducts = async (ids) => {
    setLoading(true);
    try {
      const res = await api.post("/compare", { productIds: ids });
      setProducts(res.data?.comparison || []);
    } catch (err) {
      toast.error("Failed to load comparison data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await api.post('/cart', { productId, quantity: 1 });
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (compareList.length < 2) {
    return (
      <div className="container px-4 py-12 mx-auto text-center">
        <h2 className="mb-4 text-2xl font-bold">Compare Products</h2>
        <p className="mb-8 text-gray-600">
          Select 2–4 products to compare.  
          Add them using the Compare button on product cards.
        </p>
        {compareList.length === 1 && (
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-4">You have 1 product selected for comparison:</p>
            <div className="inline-block bg-white rounded-lg shadow-md p-4">
              <img 
                src={compareList[0].images?.[0]?.url || '/placeholder.png'} 
                alt={compareList[0].name}
                className="w-16 h-16 object-cover mx-auto mb-2"
              />
              <p className="font-semibold text-sm">{compareList[0].name}</p>
              <button 
                onClick={() => removeFromCompare(compareList[0]._id)}
                className="text-red-600 text-xs mt-1"
              >
                Remove
              </button>
            </div>
          </div>
        )}
        <Link to="/products" className="text-blue-600 hover:underline">
          Browse Products
        </Link>
      </div>
    );
  }

  const specs = ["display", "processor", "camera", "battery", "os", "dimensions", "weight"];

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Compare Products</h1>
        <button
          onClick={clearCompare}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Clear All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow-md">
          <thead>
            <tr>
              <th className="p-4 text-left border-b">Feature</th>

              {products.map((product) => (
                <th key={product.id} className="relative p-4 text-center border-b">
                  <SaleTag discount={product.discount} className="absolute top-4 right-4" />
                  <button
                    onClick={() => removeFromCompare(product.id)}
                    className="absolute text-red-600 top-2 right-2 hover:text-red-800 z-20"
                  >
                    <FaTimes />
                  </button>

                  <Link to={`/product/${product.id}`}>
                    <img
                      src={product.images?.[0]?.url || "/placeholder.png"}
                      alt={product.name}
                      className="object-cover w-32 h-32 mx-auto mb-2"
                    />
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.brand}</p>
                    <div className="mt-2">
                      <span className="text-lg font-bold text-blue-600">
                        ₹{product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="text-sm text-gray-500 line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center justify-center mx-auto"
                  >
                    <FaShoppingCart className="mr-1" />
                    Add to Cart
                  </button>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <tr className="bg-gray-50">
              <td className="p-4 font-semibold">Price</td>
              {products.map((p) => (
                <td key={p.id} className="p-4 text-center">
                  <div className="font-bold text-blue-600">₹{p.price.toLocaleString()}</div>
                  {p.originalPrice && p.originalPrice > p.price && (
                    <div className="text-sm text-gray-500 line-through">
                      ₹{p.originalPrice.toLocaleString()}
                    </div>
                  )}
                  {p.discount > 0 && (
                    <div className="text-sm text-green-600 font-semibold">
                      {p.discount}% OFF
                    </div>
                  )}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-semibold">Rating</td>
              {products.map((p) => (
                <td key={p.id} className="p-4 text-center">
                  <div className="flex items-center justify-center">
                    <FaStar className="mr-1 text-yellow-400" />
                    <span>{p.ratings?.average?.toFixed(1) || "N/A"}</span>
                    <span className="ml-1 text-sm text-gray-600">
                      ({p.ratings?.count || 0})
                    </span>
                  </div>
                </td>
              ))}
            </tr>

            <tr className="bg-gray-50">
              <td className="p-4 font-semibold">Stock</td>
              {products.map((p) => (
                <td key={p.id} className="p-4 text-center">
                  {p.stock > 0 ? (
                    <span className="text-green-600">In Stock ({p.stock})</span>
                  ) : (
                    <span className="text-red-600">Out of Stock</span>
                  )}
                </td>
              ))}
            </tr>

            {specs.map((spec, index) => (
              <tr key={spec} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                <td className="p-4 font-semibold capitalize">{spec}</td>
                {products.map((p) => (
                  <td key={p.id} className="p-4 text-center">
                    {p.specifications?.[spec] || "N/A"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Compare;
