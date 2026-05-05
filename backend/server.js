require('dotenv').config();
console.log('MONGO_URI:', process.env.MONGO_URI);
const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/sales',     require('./routes/sales'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api',           require('./routes/data'));     // products, categories, analytics
app.use('/api/chat',      require('./routes/chat'));
app.use('/api/upload',    require('./routes/upload'));

// Health check
app.get('/', (req, res) => res.json({ message: 'SmartSalesAI API running' }));

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(process.env.PORT || 5000, () =>
            console.log(`Server running on port ${process.env.PORT || 5000}`)
        );
    })
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    });
