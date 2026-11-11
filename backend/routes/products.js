const express = require('express');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage with file size and type limits
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      brand,
      minPrice,
      maxPrice,
      minRating,
      storage,
      ram,
      search,
      sort,
      newArrival,
      bestSeller
    } = req.query;

    // Build query
    const query = {};

    if (brand) {
      query.brand = brand;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (minRating) {
      query['ratings.average'] = { $gte: Number(minRating) };
    }

    if (storage) {
      query['variants.storage'] = storage;
    }

    if (ram) {
      query['variants.ram'] = ram;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (newArrival === 'true') {
      query.isNewArrival = true;
    }

    if (bestSeller === 'true') {
      query.isBestSeller = true;
    }

    // Build sort
    let sortBy = {};
    if (sort === 'price-low') {
      sortBy = { price: 1 };
    } else if (sort === 'price-high') {
      sortBy = { price: -1 };
    } else if (sort === 'newest') {
      sortBy = { createdAt: -1 };
    } else if (sort === 'rating') {
      sortBy = { 'ratings.average': -1 };
    } else {
      sortBy = { createdAt: -1 };
    }

    const products = await Product.find(query)
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('vendor', 'name email');

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendor', 'name email');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private/Admin
router.post('/', protect, admin, upload.array('images', 5), async (req, res) => {
  try {
    // Check if Cloudinary is configured
    const cloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                 process.env.CLOUDINARY_API_KEY && 
                                 process.env.CLOUDINARY_API_SECRET &&
                                 process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name_here' &&
                                 process.env.CLOUDINARY_API_KEY !== 'your_api_key_here' &&
                                 process.env.CLOUDINARY_API_SECRET !== 'your_api_secret_here';

    let productData;
    try {
      productData = req.body.data ? JSON.parse(req.body.data) : req.body;
    } catch (parseError) {
      return res.status(400).json({ 
        message: 'Invalid JSON data in request body',
        error: parseError.message 
      });
    }
    
    // Upload images
    const images = [];
    if (req.files && req.files.length > 0) {
      console.log(`Processing ${req.files.length} images...`);
      
      if (cloudinaryConfigured) {
        // Upload to Cloudinary if configured
        console.log('Uploading to Cloudinary...');
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          try {
            // Convert buffer to data URI for Cloudinary
            const base64Data = file.buffer.toString('base64');
            const dataUri = `data:${file.mimetype};base64,${base64Data}`;
            
            console.log(`Uploading image ${i + 1}/${req.files.length} to Cloudinary...`);
            
            const uploadResult = await cloudinary.uploader.upload(dataUri, {
              folder: 'fone-factory',
              resource_type: 'image',
              transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto' }
              ]
            });
            
            images.push({
              url: uploadResult.secure_url,
              public_id: uploadResult.public_id
            });
            
            console.log(`Image ${i + 1} uploaded successfully to Cloudinary`);
          } catch (uploadError) {
            console.error(`Error uploading image ${i + 1} to Cloudinary:`, uploadError);
            
            // Clean up any successfully uploaded images
            for (const uploadedImage of images) {
              try {
                await cloudinary.uploader.destroy(uploadedImage.public_id);
              } catch (cleanupError) {
                console.error('Error cleaning up uploaded image:', cleanupError);
              }
            }
            
            return res.status(500).json({ 
              message: `Failed to upload image ${i + 1} to Cloudinary: ${uploadError.message}`,
              error: uploadError.message,
              suggestion: 'Please check your Cloudinary configuration in the .env file'
            });
          }
        }
      } else {
        // Fallback: Store as base64 in database (not recommended for production)
        console.log('Cloudinary not configured, storing images as base64 (temporary solution)...');
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          try {
            const base64Data = file.buffer.toString('base64');
            const dataUri = `data:${file.mimetype};base64,${base64Data}`;
            
            images.push({
              url: dataUri,
              public_id: `temp_${Date.now()}_${i}` // Temporary ID
            });
            
            console.log(`Image ${i + 1} stored as base64 (temporary)`);
          } catch (error) {
            console.error(`Error processing image ${i + 1}:`, error);
            return res.status(500).json({ 
              message: `Failed to process image ${i + 1}`,
              error: error.message 
            });
          }
        }
        
        // Warning about temporary solution
        console.warn('⚠️  WARNING: Images are being stored as base64 in database. This is not recommended for production!');
        console.warn('⚠️  Please configure Cloudinary for proper image storage.');
      }
    }

    productData.images = images;
    
    // Validate required fields
    if (!productData.name || !productData.brand || !productData.description || !productData.price) {
      // Clean up uploaded images if validation fails
      for (const image of images) {
        try {
          await cloudinary.uploader.destroy(image.public_id);
        } catch (cleanupError) {
          console.error('Error cleaning up uploaded image:', cleanupError);
        }
      }
      
      return res.status(400).json({ 
        message: 'Missing required fields: name, brand, description, and price are required' 
      });
    }

    const product = await Product.create(productData);
    console.log('Product created successfully with ID:', product._id);

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Error creating product:', error);
    
    // If it's a validation error, provide more specific feedback
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationErrors 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error while creating product',
      error: error.message 
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
router.put('/:id', protect, admin, upload.array('images', 5), async (req, res) => {
  try {
    // Check if Cloudinary is configured
    const cloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                 process.env.CLOUDINARY_API_KEY && 
                                 process.env.CLOUDINARY_API_SECRET &&
                                 process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name_here' &&
                                 process.env.CLOUDINARY_API_KEY !== 'your_api_key_here' &&
                                 process.env.CLOUDINARY_API_SECRET !== 'your_api_secret_here';

    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let productData;
    try {
      productData = req.body.data ? JSON.parse(req.body.data) : req.body;
    } catch (parseError) {
      return res.status(400).json({ 
        message: 'Invalid JSON data in request body',
        error: parseError.message 
      });
    }

    // Handle images: use images from productData if provided (includes existing + new)
    // Otherwise, add new uploaded images to existing ones
    if (productData.images && Array.isArray(productData.images)) {
      // Images array is provided (from frontend with existing images)
      // Delete old images from Cloudinary that are not in the new array (only if using Cloudinary)
      if (cloudinaryConfigured) {
        const existingImageIds = product.images.map(img => img.public_id);
        const newImageIds = productData.images.map(img => img.public_id).filter(id => id);
        
        // Find images to delete (only Cloudinary images, not base64)
        const imagesToDelete = existingImageIds.filter(id => 
          !newImageIds.includes(id) && !id.startsWith('temp_')
        );
        
        for (const publicId of imagesToDelete) {
          try {
            await cloudinary.uploader.destroy(publicId);
            console.log(`Deleted image from Cloudinary: ${publicId}`);
          } catch (err) {
            console.error('Error deleting image from Cloudinary:', err);
          }
        }
      }
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      console.log(`Processing ${req.files.length} new images...`);
      const newImages = [];
      
      if (cloudinaryConfigured) {
        // Upload to Cloudinary if configured
        console.log('Uploading new images to Cloudinary...');
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          try {
            // Convert buffer to data URI for Cloudinary
            const base64Data = file.buffer.toString('base64');
            const dataUri = `data:${file.mimetype};base64,${base64Data}`;
            
            console.log(`Uploading new image ${i + 1}/${req.files.length} to Cloudinary...`);
            
            const uploadResult = await cloudinary.uploader.upload(dataUri, {
              folder: 'fone-factory',
              resource_type: 'image',
              transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto' }
              ]
            });
            
            newImages.push({
              url: uploadResult.secure_url,
              public_id: uploadResult.public_id
            });
            
            console.log(`New image ${i + 1} uploaded successfully to Cloudinary`);
          } catch (uploadError) {
            console.error(`Error uploading new image ${i + 1} to Cloudinary:`, uploadError);
            
            // Clean up any successfully uploaded new images
            for (const uploadedImage of newImages) {
              try {
                await cloudinary.uploader.destroy(uploadedImage.public_id);
              } catch (cleanupError) {
                console.error('Error cleaning up uploaded image:', cleanupError);
              }
            }
            
            return res.status(500).json({ 
              message: `Failed to upload new image ${i + 1} to Cloudinary: ${uploadError.message}`,
              error: uploadError.message,
              suggestion: 'Please check your Cloudinary configuration in the .env file'
            });
          }
        }
      } else {
        // Fallback: Store as base64 in database (not recommended for production)
        console.log('Cloudinary not configured, storing new images as base64 (temporary solution)...');
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          try {
            const base64Data = file.buffer.toString('base64');
            const dataUri = `data:${file.mimetype};base64,${base64Data}`;
            
            newImages.push({
              url: dataUri,
              public_id: `temp_${Date.now()}_${i}` // Temporary ID
            });
            
            console.log(`New image ${i + 1} stored as base64 (temporary)`);
          } catch (error) {
            console.error(`Error processing new image ${i + 1}:`, error);
            return res.status(500).json({ 
              message: `Failed to process new image ${i + 1}`,
              error: error.message 
            });
          }
        }
        
        console.warn('⚠️  WARNING: New images are being stored as base64 in database. This is not recommended for production!');
      }
      
      // If productData.images exists, append new images, otherwise replace
      if (productData.images && Array.isArray(productData.images)) {
        productData.images = [...productData.images, ...newImages];
      } else {
        productData.images = [...product.images, ...newImages];
      }
    } else if (!productData.images) {
      // No new images and no images in productData, keep existing
      productData.images = product.images;
    }

    product = await Product.findByIdAndUpdate(req.params.id, productData, {
      new: true,
      runValidators: true
    });

    console.log('Product updated successfully with ID:', product._id);
    res.json({ success: true, product });
  } catch (error) {
    console.error('Error updating product:', error);
    
    // If it's a validation error, provide more specific feedback
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationErrors 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error while updating product',
      error: error.message 
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete images from Cloudinary (only if they're Cloudinary images)
    const cloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                 process.env.CLOUDINARY_API_KEY && 
                                 process.env.CLOUDINARY_API_SECRET &&
                                 process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name_here';

    if (cloudinaryConfigured && product.images && product.images.length > 0) {
      for (const image of product.images) {
        // Only delete from Cloudinary if it's not a base64 image
        if (image.public_id && !image.public_id.startsWith('temp_')) {
          try {
            await cloudinary.uploader.destroy(image.public_id);
            console.log(`Deleted image from Cloudinary: ${image.public_id}`);
          } catch (err) {
            console.error('Error deleting image from Cloudinary:', err);
          }
        }
      }
    }

    await product.deleteOne();

    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/products/brands/list
// @desc    Get all unique brands
// @access  Public
router.get('/brands/list', async (req, res) => {
  try {
    const brands = await Product.distinct('brand');
    res.json({ success: true, brands });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

