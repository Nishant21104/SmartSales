const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Customer = require('./models/Customer');
const { Product, Category } = require('./models/Product');
const Sale = require('./models/Sale');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartsalesai');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Sale.deleteMany({});

    // Create a test user
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    console.log('Created test user:', user.email);

    // Create categories
    const categories = await Category.create([
      { name: 'Electronics', userId: user._id },
      { name: 'Clothing', userId: user._id },
      { name: 'Food & Beverages', userId: user._id },
      { name: 'Books', userId: user._id }
    ]);

    // Create products
    const products = await Product.create([
      { name: 'Laptop', categoryId: categories[0]._id, userId: user._id },
      { name: 'Smartphone', categoryId: categories[0]._id, userId: user._id },
      { name: 'T-Shirt', categoryId: categories[1]._id, userId: user._id },
      { name: 'Jeans', categoryId: categories[1]._id, userId: user._id },
      { name: 'Coffee', categoryId: categories[2]._id, userId: user._id },
      { name: 'Sandwich', categoryId: categories[2]._id, userId: user._id },
      { name: 'Fiction Book', categoryId: categories[3]._id, userId: user._id },
      { name: 'Technical Book', categoryId: categories[3]._id, userId: user._id }
    ]);

    // Create customers
    const customers = await Customer.create([
      { name: 'John Doe', email: 'john@example.com', city: 'New York', userId: user._id },
      { name: 'Jane Smith', email: 'jane@example.com', city: 'Los Angeles', userId: user._id },
      { name: 'Bob Johnson', email: 'bob@example.com', city: 'Chicago', userId: user._id },
      { name: 'Alice Brown', email: 'alice@example.com', city: 'Houston', userId: user._id },
      { name: 'Charlie Wilson', email: 'charlie@example.com', city: 'Phoenix', userId: user._id }
    ]);

    // Create sales with realistic data
    const sales = [];
    const regions = ['North', 'South', 'East', 'West', 'Central'];
    const paymentModes = ['cash', 'card', 'online'];

    for (let i = 0; i < 50; i++) {
      const randomDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      
      sales.push({
        productId: products[Math.floor(Math.random() * products.length)]._id,
        customerId: customers[Math.floor(Math.random() * customers.length)]._id,
        userId: user._id,
        quantity: Math.floor(Math.random() * 5) + 1,
        price: Math.floor(Math.random() * 500) + 50,
        saleDate: randomDate,
        region: regions[Math.floor(Math.random() * regions.length)],
        paymentMode: paymentModes[Math.floor(Math.random() * paymentModes.length)]
      });
    }

    await Sale.insertMany(sales);

    console.log('✅ Database seeded successfully!');
    console.log(`Created: ${categories.length} categories, ${products.length} products, ${customers.length} customers, ${sales.length} sales`);
    console.log('Login with: test@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
