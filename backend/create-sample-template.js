const XLSX = require('xlsx');
const path = require('path');

// Create sample template for users
const templateData = [
  {
    'CustomerName': 'John Doe',
    'Email': 'john@example.com',
    'City': 'New York',
    'Product': 'Laptop',
    'Category': 'Electronics',
    'Quantity': 2,
    'Price': 999.99,
    'Date': '2024-01-15',
    'Region': 'North',
    'PaymentMode': 'Card'
  },
  {
    'CustomerName': 'Jane Smith',
    'Email': 'jane@example.com',
    'City': 'Los Angeles',
    'Product': 'T-Shirt',
    'Category': 'Clothing',
    'Quantity': 3,
    'Price': 29.99,
    'Date': '2024-01-16',
    'Region': 'West',
    'PaymentMode': 'Cash'
  },
  {
    'CustomerName': 'Bob Johnson',
    'Email': 'bob@example.com',
    'City': 'Chicago',
    'Product': 'Coffee',
    'Category': 'Food & Beverages',
    'Quantity': 5,
    'Price': 4.99,
    'Date': '2024-01-17',
    'Region': 'Central',
    'PaymentMode': 'Online'
  }
];

// Create workbook
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(templateData);

// Set column widths
const wscols = [
  { wch: 15 }, // CustomerName
  { wch: 20 }, // Email
  { wch: 15 }, // City
  { wch: 20 }, // Product
  { wch: 20 }, // Category
  { wch: 10 }, // Quantity
  { wch: 12 }, // Price
  { wch: 12 }, // Date
  { wch: 12 }, // Region
  { wch: 15 }  // PaymentMode
];
ws['!cols'] = wscols;

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, 'Sales Data');

// Write file
const filePath = path.join(__dirname, 'sample-template.xlsx');
XLSX.writeFile(wb, filePath);

console.log('✅ Sample template created:', filePath);
console.log('📊 Columns required:', Object.keys(templateData[0]));
console.log('📁 Users can download this template and fill their data');
