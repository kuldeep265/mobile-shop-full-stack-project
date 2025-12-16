import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaTag, FaTicketAlt } from 'react-icons/fa';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    price: '',
    originalPrice: '',
    stock: '',
    discount: '',
    isNewArrival: false,
    isBestSeller: false,
    isFeatured: false,
    specifications: {
      display: '',
      processor: '',
      camera: '',
      battery: '',
      os: '',
      dimensions: '',
      weight: ''
    }
  });
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [couponData, setCouponData] = useState({
    discount: '',
    discountType: 'percentage',
    minPurchase: '',
    maxDiscount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    description: ''
  });

  const brands = ['Samsung', 'Apple', 'Xiaomi', 'OnePlus', 'Oppo', 'Vivo', 'Realme', 'Nothing', 'Google', 'Motorola', 'Other'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?limit=100');
      setProducts(res.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('specifications.')) {
      const specField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specField]: value
        }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setImageFiles(prev => [...prev, ...files]);
    setImages(prev => [...prev, ...newFiles]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const submitData = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        stock: Number(formData.stock),
        discount: formData.discount ? Number(formData.discount) : 0
      };

      // Remove empty specification fields
      Object.keys(submitData.specifications).forEach(key => {
        if (!submitData.specifications[key]) {
          delete submitData.specifications[key];
        }
      });

      const formDataToSend = new FormData();
      formDataToSend.append('data', JSON.stringify(submitData));

      // Add new image files
      imageFiles.forEach((file) => {
        formDataToSend.append('images', file);
      });

      let response;
      if (editingProduct) {
        // Update existing product
        // Include existing images that weren't removed
        const allImages = [...existingImages];
        submitData.images = allImages;
        formDataToSend.set('data', JSON.stringify(submitData));
        
        response = await api.put(`/products/${editingProduct._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Product updated successfully');
      } else {
        // Create new product
        response = await api.post('/products', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Product created successfully');
      }

      // Reset form
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      description: '',
      price: '',
      originalPrice: '',
      stock: '',
      discount: '',
      isNewArrival: false,
      isBestSeller: false,
      isFeatured: false,
      specifications: {
        display: '',
        processor: '',
        camera: '',
        battery: '',
        os: '',
        dimensions: '',
        weight: ''
      }
    });
    setImages([]);
    setImageFiles([]);
    setExistingImages([]);
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      brand: product.brand || '',
      description: product.description || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      stock: product.stock || '',
      discount: product.discount || 0,
      isNewArrival: product.isNewArrival || false,
      isBestSeller: product.isBestSeller || false,
      isFeatured: product.isFeatured || false,
      specifications: {
        display: product.specifications?.display || '',
        processor: product.specifications?.processor || '',
        camera: product.specifications?.camera || '',
        battery: product.specifications?.battery || '',
        os: product.specifications?.os || '',
        dimensions: product.specifications?.dimensions || '',
        weight: product.specifications?.weight || ''
      }
    });
    setExistingImages(product.images || []);
    setImages([]);
    setImageFiles([]);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGenerateCoupon = (product) => {
    setSelectedProduct(product);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    setCouponData({
      discount: '10',
      discountType: 'percentage',
      minPurchase: '',
      maxDiscount: '',
      validFrom: tomorrow.toISOString().split('T')[0],
      validUntil: nextMonth.toISOString().split('T')[0],
      usageLimit: '100',
      description: `Special offer for ${product.name}`
    });
    setShowCouponForm(true);
  };

  const handleQuickGenerateCoupon = async (product) => {
    try {
      const res = await api.post(`/coupons/generate/${product._id}`);
      toast.success(res.data.message);
    } catch (error) {
      console.error('Error generating quick coupon:', error);
      toast.error(error.response?.data?.message || 'Failed to generate coupon');
    }
  };

  const handleCouponInputChange = (e) => {
    const { name, value } = e.target;
    setCouponData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    
    try {
      const couponCode = generateCouponCode();
      const submitData = {
        code: couponCode,
        discount: Number(couponData.discount),
        discountType: couponData.discountType,
        minPurchase: couponData.minPurchase ? Number(couponData.minPurchase) : 0,
        maxDiscount: couponData.maxDiscount ? Number(couponData.maxDiscount) : null,
        validFrom: new Date(couponData.validFrom),
        validUntil: new Date(couponData.validUntil),
        usageLimit: couponData.usageLimit ? Number(couponData.usageLimit) : null,
        couponType: 'product-specific',
        applicableProducts: [selectedProduct._id],
        description: couponData.description,
        isActive: true
      };

      await api.post('/coupons', submitData);
      toast.success(`Coupon ${couponCode} created successfully for ${selectedProduct.name}!`);
      
      resetCouponForm();
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    }
  };

  const resetCouponForm = () => {
    setShowCouponForm(false);
    setSelectedProduct(null);
    setCouponData({
      discount: '',
      discountType: 'percentage',
      minPurchase: '',
      maxDiscount: '',
      validFrom: '',
      validUntil: '',
      usageLimit: '',
      description: ''
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          <FaPlus />
          Add Product
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-4 bg-white border-b">
              <h2 className="text-2xl font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-2 text-sm font-medium">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Brand *</label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select Brand</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Original Price (₹)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block mb-2 text-sm font-medium">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              {/* Specifications */}
              <div>
                <h3 className="mb-4 text-lg font-semibold">Specifications</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Display</label>
                    <input
                      type="text"
                      name="specifications.display"
                      value={formData.specifications.display}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Processor</label>
                    <input
                      type="text"
                      name="specifications.processor"
                      value={formData.specifications.processor}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Camera</label>
                    <input
                      type="text"
                      name="specifications.camera"
                      value={formData.specifications.camera}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Battery</label>
                    <input
                      type="text"
                      name="specifications.battery"
                      value={formData.specifications.battery}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">OS</label>
                    <input
                      type="text"
                      name="specifications.os"
                      value={formData.specifications.os}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Dimensions</label>
                    <input
                      type="text"
                      name="specifications.dimensions"
                      value={formData.specifications.dimensions}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Weight</label>
                    <input
                      type="text"
                      name="specifications.weight"
                      value={formData.specifications.weight}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
              </div>

              {/* Product Flags */}
              <div>
                <h3 className="mb-4 text-lg font-semibold">Product Flags</h3>
                <div className="flex gap-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isNewArrival"
                      checked={formData.isNewArrival}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    New Arrival
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isBestSeller"
                      checked={formData.isBestSeller}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Best Seller
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Featured
                  </label>
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block mb-2 text-sm font-medium">Product Images (Max 5)</label>
                
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-sm text-gray-600">Existing Images:</p>
                    <div className="flex flex-wrap gap-4">
                      {existingImages.map((img, index) => (
                        <div key={index} className="relative">
                          <img
                            src={img.url}
                            alt={`Existing ${index + 1}`}
                            className="object-cover w-24 h-24 border rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute flex items-center justify-center w-6 h-6 text-white bg-red-500 rounded-full -top-2 -right-2"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Image Previews */}
                {images.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-sm text-gray-600">New Images:</p>
                    <div className="flex flex-wrap gap-4">
                      {images.map((img, index) => (
                        <div key={index} className="relative">
                          <img
                            src={img.preview}
                            alt={`Preview ${index + 1}`}
                            className="object-cover w-24 h-24 border rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute flex items-center justify-center w-6 h-6 text-white bg-red-500 rounded-full -top-2 -right-2"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={images.length + existingImages.length >= 5}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {images.length + existingImages.length} / 5 images selected
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {uploading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Generation Form */}
      {showCouponForm && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 bg-white border-b">
              <h2 className="text-xl font-bold">
                Generate Coupon for {selectedProduct.name}
              </h2>
              <button
                onClick={resetCouponForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Discount Type *</label>
                  <select
                    name="discountType"
                    value={couponData.discountType}
                    onChange={handleCouponInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Discount Value * {couponData.discountType === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={couponData.discount}
                    onChange={handleCouponInputChange}
                    required
                    min="1"
                    max={couponData.discountType === 'percentage' ? '100' : undefined}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Min Purchase (₹)</label>
                  <input
                    type="number"
                    name="minPurchase"
                    value={couponData.minPurchase}
                    onChange={handleCouponInputChange}
                    min="0"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Optional"
                  />
                </div>

                {couponData.discountType === 'percentage' && (
                  <div>
                    <label className="block mb-2 text-sm font-medium">Max Discount (₹)</label>
                    <input
                      type="number"
                      name="maxDiscount"
                      value={couponData.maxDiscount}
                      onChange={handleCouponInputChange}
                      min="0"
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Optional"
                    />
                  </div>
                )}

                <div>
                  <label className="block mb-2 text-sm font-medium">Valid From *</label>
                  <input
                    type="date"
                    name="validFrom"
                    value={couponData.validFrom}
                    onChange={handleCouponInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Valid Until *</label>
                  <input
                    type="date"
                    name="validUntil"
                    value={couponData.validUntil}
                    onChange={handleCouponInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Usage Limit</label>
                <input
                  type="number"
                  name="usageLimit"
                  value={couponData.usageLimit}
                  onChange={handleCouponInputChange}
                  min="1"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  value={couponData.description}
                  onChange={handleCouponInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Optional description"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 text-white bg-green-600 rounded hover:bg-green-700"
                >
                  Generate Coupon
                </button>
                <button
                  type="button"
                  onClick={resetCouponForm}
                  className="px-6 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="overflow-hidden bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Image</th>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Brand</th>
                <th className="p-4 text-left">Price</th>
                <th className="p-4 text-left">Stock</th>
                <th className="p-4 text-left w-48">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No products found. Click "Add Product" to create one.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <img
                        src={product.images?.[0]?.url || '/placeholder.png'}
                        alt={product.name}
                        className="object-cover w-16 h-16 rounded"
                        onError={(e) => {
                          e.target.src = '/placeholder.png';
                        }}
                      />
                    </td>
                    <td className="p-4 font-medium">{product.name}</td>
                    <td className="p-4">{product.brand}</td>
                    <td className="p-4">₹{product.price?.toLocaleString()}</td>
                    <td className="p-4">{product.stock}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleQuickGenerateCoupon(product)}
                          className="px-3 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700 flex items-center gap-1"
                          title={`Quick Generate Coupon (${product.discount > 0 ? product.discount : 10}% off)`}
                        >
                          <FaTicketAlt size={12} />
                          {product.discount > 0 ? `${product.discount}%` : '10%'} Coupon
                        </button>
                        <button
                          onClick={() => handleGenerateCoupon(product)}
                          className="p-2 text-green-600 hover:text-green-800"
                          title="Custom Coupon Settings"
                        >
                          <FaTag />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
