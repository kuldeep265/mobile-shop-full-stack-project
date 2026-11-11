const axios = require('axios');

const API_URL = 'https://mobile-shop-full-stack-project.onrender.com/api';

// Test products data
const testProducts = [
  {
    name: "iPhone 15 Pro",
    description: "Latest iPhone with A17 Pro chip",
    price: 999,
    brand: "Apple",
    category: "Smartphone",
    stock: 50,
    images: ["https://via.placeholder.com/400x400?text=iPhone+15+Pro"],
    specifications: {
      display: "6.1-inch Super Retina XDR",
      processor: "A17 Pro",
      storage: "128GB",
      camera: "48MP Main Camera"
    }
  },
  {
    name: "Samsung Galaxy S24",
    description: "Premium Android smartphone",
    price: 899,
    brand: "Samsung",
    category: "Smartphone", 
    stock: 30,
    images: ["https://via.placeholder.com/400x400?text=Galaxy+S24"],
    specifications: {
      display: "6.2-inch Dynamic AMOLED",
      processor: "Snapdragon 8 Gen 3",
      storage: "256GB",
      camera: "50MP Triple Camera"
    }
  }
];

async function addTestProducts() {
  try {
    // First login as admin
    console.log('Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'piyush@gmail.com',
      password: 'Piyush123'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful!');
    
    // Add products
    for (const product of testProducts) {
      console.log(`Adding product: ${product.name}`);
      const response = await axios.post(`${API_URL}/products`, product, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ Added: ${response.data.product.name}`);
    }
    
    console.log('All test products added successfully!');
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

addTestProducts();