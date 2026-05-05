const XLSX = require('xlsx');
const path = require('path');

// Create sample data for Excel upload
const sampleData = [
  {
    'Product': 'Laptop',
    'Category': 'Electronics',
    'Customer': 'John Doe',
    'Email': 'john@example.com',
    'City': 'New York',
    'Quantity': 2,
    'Price': 999.99,
    'Date': '2024-01-15',
    'Region': 'North',
    'PaymentMode': 'card'
  },
  {
    'Product': 'T-Shirt',
    'Category': 'Clothing',
    'Customer': 'Jane Smith',
    'Email': 'jane@example.com',
    'City': 'Los Angeles',
    'Quantity': 3,
    'Price': 29.99,
    'Date': '2024-01-16',
    'Region': 'West',
    'PaymentMode': 'cash'
  },
  {
    'Product': 'Coffee',
    'Category': 'Food & Beverages',
    'Customer': 'Bob Johnson',
    'Email': 'bob@example.com',
    'City': 'Chicago',
    'Quantity': 5,
    'Price': 4.99,
    'Date': '2024-01-17',
    'Region': 'Central',
    'PaymentMode': 'online'
  },
  {
    'Product': 'Fiction Book',
    'Category': 'Books',
    'Customer': 'Alice Brown',
    'Email': 'alice@example.com',
    'City': 'Houston',
    'Quantity': 1,
    'Price': 19.99,
    'Date': '2024-01-18',
    'Region': 'South',
    'PaymentMode': 'card'
  },
  {
    'Product': 'Smartphone',
    'Category': 'Electronics',
    'Customer': 'Charlie Wilson',
    'Email': 'charlie@example.com',
    'City': 'Phoenix',
    'Quantity': 1,
    'Price': 699.99,
    'Date': '2024-01-19',
    'Region': 'West',
    'PaymentMode': 'online'
  }
];

// Create workbook
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(sampleData);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, 'Sales Data');

// Write file
const filePath = path.join(__dirname, 'sample-sales-data.xlsx');
XLSX.writeFile(wb, filePath);

console.log('✅ Sample Excel file created:', filePath);
console.log('📊 Columns required:', Object.keys(sampleData[0]));
console.log('📁 Use this file to test the upload functionality');
