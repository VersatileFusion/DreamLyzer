const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the user
 *         username:
 *           type: string
 *           description: User's username
 *         email:
 *           type: string
 *           description: User's email address
 *         password:
 *           type: string
 *           description: User's password (hashed)
 *         createdAt:
 *           type: string
 *           format: date
 *           description: Date when the user was created
 *       example:
 *         _id: 60d6ec9f1f6a4e001fcf1ca1
 *         username: dreamuser1
 *         email: user@example.com
 *         createdAt: 2023-06-25T10:00:00.000Z
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input or email/username already exists
 */
router.post('/register', async (req, res) => {
  console.log('POST /api/users/register - Request received:', { 
    username: req.body.username, 
    email: req.body.email 
  });
  
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      console.log('Registration failed - User already exists:', { 
        email, 
        username 
      });
      return res.status(400).json({ 
        message: 'Email or username already exists' 
      });
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password
    });
    
    await user.save();
    console.log('User successfully registered:', { id: user._id, username, email });
    
    // Create JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'default_secret_change_in_production',
      { expiresIn: '30d' }
    );
    
    // Send response (exclude password)
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  console.log('POST /api/users/login - Login attempt:', { 
    email: req.body.email 
  });
  
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    // Check if user exists
    if (!user) {
      console.log('Login failed - User not found:', { email });
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      console.log('Login failed - Incorrect password:', { email });
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('User successfully logged in:', { id: user._id, email });
    
    // Create JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'default_secret_change_in_production',
      { expiresIn: '30d' }
    );
    
    // Send response (exclude password)
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 */
router.get('/profile', async (req, res) => {
  // Normally would include auth middleware
  // For this example we'll just use a mock authenticated user
  console.log('GET /api/users/profile - Request received (mock auth)');
  
  try {
    // In a real app, you'd get the user ID from the authenticated request
    // For mock purposes:
    const userId = req.headers['x-mock-user-id'];
    
    if (!userId) {
      console.log('Profile request failed - No mock user ID provided');
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('Profile request failed - User not found:', { userId });
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User profile retrieved successfully:', { id: user._id, username: user.username });
    
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    });
    
  } catch (error) {
    console.error('Profile retrieval error:', error.message);
    res.status(500).json({ message: 'Server error getting profile' });
  }
});

module.exports = router; 