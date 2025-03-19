const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
} = require('../controllers/user.controller');
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
 *         profile:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             bio:
 *               type: string
 *             avatar:
 *               type: string
 *         preferences:
 *           type: object
 *           properties:
 *             theme:
 *               type: string
 *               enum: [light, dark, system]
 *             emailNotifications:
 *               type: boolean
 *             defaultDreamPrivacy:
 *               type: boolean
 *             dreamReminders:
 *               type: object
 *             preferredDreamCategories:
 *               type: array
 *               items:
 *                 type: string
 *         stats:
 *           type: object
 *           properties:
 *             totalDreams:
 *               type: integer
 *             lastDreamDate:
 *               type: string
 *               format: date
 *             dreamStreak:
 *               type: integer
 *       example:
 *         _id: 60d6ec9f1f6a4e001fcf1ca1
 *         username: dreamuser1
 *         email: user@example.com
 *         createdAt: 2023-06-25T10:00:00.000Z
 *         profile:
 *           firstName: John
 *           lastName: Doe
 *           bio: Dream enthusiast
 *         preferences:
 *           theme: dark
 *         stats:
 *           totalDreams: 12
 *           dreamStreak: 3
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
router.post('/register', registerUser);

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
router.post('/login', loginUser);

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
router.get('/profile', protect, getUserProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *               profile:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   bio:
 *                     type: string
 *                   avatar:
 *                     type: string
 *               preferences:
 *                 type: object
 *                 properties:
 *                   theme:
 *                     type: string
 *                     enum: [light, dark, system]
 *                   emailNotifications:
 *                     type: boolean
 *                   defaultDreamPrivacy:
 *                     type: boolean
 *                   dreamReminders:
 *                     type: object
 *                     properties:
 *                       enabled:
 *                         type: boolean
 *                       frequency:
 *                         type: string
 *                         enum: [daily, weekly, none]
 *                       time:
 *                         type: string
 *                   preferredDreamCategories:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: User not found
 */
router.put('/profile', protect, updateUserProfile);

/**
 * @swagger
 * /api/users/preferences:
 *   get:
 *     summary: Get user preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences retrieved successfully
 *       401:
 *         description: Not authenticated
 */
router.get('/preferences', protect, (req, res) => {
  res.status(200).json(req.user.preferences || {});
});

/**
 * @swagger
 * /api/users/preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *                 enum: [light, dark, system]
 *               emailNotifications:
 *                 type: boolean
 *               defaultDreamPrivacy:
 *                 type: boolean
 *               dreamReminders:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   frequency:
 *                     type: string
 *                     enum: [daily, weekly, none]
 *                   time:
 *                     type: string
 *               preferredDreamCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: User preferences updated successfully
 *       401:
 *         description: Not authenticated
 */
router.put('/preferences', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update preferences if provided
    if (req.body.theme) user.preferences.theme = req.body.theme;
    if (req.body.emailNotifications !== undefined) {
      user.preferences.emailNotifications = req.body.emailNotifications;
    }
    if (req.body.defaultDreamPrivacy !== undefined) {
      user.preferences.defaultDreamPrivacy = req.body.defaultDreamPrivacy;
    }
    if (req.body.dreamReminders) {
      if (req.body.dreamReminders.enabled !== undefined) {
        user.preferences.dreamReminders.enabled = req.body.dreamReminders.enabled;
      }
      if (req.body.dreamReminders.frequency) {
        user.preferences.dreamReminders.frequency = req.body.dreamReminders.frequency;
      }
      if (req.body.dreamReminders.time) {
        user.preferences.dreamReminders.time = req.body.dreamReminders.time;
      }
    }
    if (req.body.preferredDreamCategories) {
      user.preferences.preferredDreamCategories = req.body.preferredDreamCategories;
    }
    
    await user.save();
    
    res.status(200).json(user.preferences);
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Server error updating preferences' });
  }
});

module.exports = router; 