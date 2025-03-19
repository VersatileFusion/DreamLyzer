const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Import routes
const userRoutes = require('./routes/user.routes');
const dreamRoutes = require('./routes/dream.routes');

// Load environment variables
dotenv.config();
console.log('Environment loaded');

// Initialize Express app
const app = express();
console.log('Express app initialized');

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dreamlyzer API',
      version: '1.0.0',
      description: 'API for dream journal management and analysis',
      contact: {
        name: 'Erfan Ahmadvand',
        email: '',
        phone: '+989109924707'
      },
      servers: [
        {
          url: 'http://localhost:5000',
          description: 'Development server'
        }
      ]
    }
  },
  apis: ['./src/routes/*.js'] // Path to the API routes files
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
console.log('Swagger documentation generated');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
console.log('Middleware configured');

// Routes
app.use('/api/users', userRoutes);
app.use('/api/dreams', dreamRoutes);
console.log('Routes registered');

// Health check route
app.get('/health', (req, res) => {
  console.log('Health check request received');
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dreamscope')
  .then(() => {
    console.log('Connected to MongoDB successfully');
    
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
}); 