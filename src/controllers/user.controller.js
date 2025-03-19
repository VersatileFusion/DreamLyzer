const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Register a new user
 * @route POST /api/users/register
 * @access Public
 */
const registerUser = async (req, res) => {
  console.log('Controller: registerUser - Request received:', { 
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
};

/**
 * Login a user
 * @route POST /api/users/login
 * @access Public
 */
const loginUser = async (req, res) => {
  console.log('Controller: loginUser - Login attempt:', { 
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
};

/**
 * Get current user profile
 * @route GET /api/users/profile
 * @access Private
 */
const getUserProfile = async (req, res) => {
  console.log('Controller: getUserProfile - Request received');
  
  try {
    res.status(200).json({
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      createdAt: req.user.createdAt
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({ message: 'Server error retrieving user profile' });
  }
};

/**
 * Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
const updateUserProfile = async (req, res) => {
  console.log('Controller: updateUserProfile - Request received');
  
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    if (req.body.username) user.username = req.body.username;
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) user.password = req.body.password;
    
    const updatedUser = await user.save();
    
    res.status(200).json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      createdAt: updatedUser.createdAt
    });
    
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error updating user profile' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
}; 