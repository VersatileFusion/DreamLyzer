const express = require('express');
const router = express.Router();
const Dream = require('../models/dream.model');
const { analyzeDream } = require('../utils/dreamAnalyzer');

/**
 * @swagger
 * components:
 *   schemas:
 *     Dream:
 *       type: object
 *       required:
 *         - user
 *         - title
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the dream
 *         user:
 *           type: string
 *           description: ID of the user who created the dream
 *         title:
 *           type: string
 *           description: Title of the dream
 *         content:
 *           type: string
 *           description: Content/description of the dream
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the dream
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: User-added tags for the dream
 *         keywords:
 *           type: array
 *           items:
 *             type: string
 *           description: Automatically extracted keywords from dream content
 *         emotions:
 *           type: object
 *           properties:
 *             primary:
 *               type: string
 *               description: Primary emotion detected in the dream
 *             score:
 *               type: number
 *               description: Confidence score for the primary emotion
 *             breakdown:
 *               type: object
 *               description: Detailed breakdown of emotions
 *         symbols:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               symbol:
 *                 type: string
 *               meaning:
 *                 type: string
 *           description: Dream symbols detected and their meanings
 *         notes:
 *           type: string
 *           description: User's own notes about the dream
 *         isPrivate:
 *           type: boolean
 *           description: Whether the dream is private or public
 *         createdAt:
 *           type: string
 *           format: date
 *           description: Date when the dream was recorded
 *       example:
 *         _id: 60d6ec9f1f6a4e001fcf1ca2
 *         user: 60d6ec9f1f6a4e001fcf1ca1
 *         title: Flying over mountains
 *         content: I dreamed I was flying over beautiful mountains with clear blue skies.
 *         date: 2023-06-25T00:00:00.000Z
 *         tags: ['flying', 'mountains', 'positive']
 *         keywords: ['flying', 'mountains', 'beautiful', 'skies', 'clear']
 *         emotions: 
 *           primary: positive
 *           score: 75
 *           breakdown: 
 *             positive: 75
 *             negative: 0
 *             neutral: 25
 *         symbols: 
 *           - symbol: flying
 *             meaning: Represents freedom, ambition, or escaping limitations
 *         notes: This dream made me feel really free and happy
 *         isPrivate: true
 *         createdAt: 2023-06-25T10:00:00.000Z
 */

/**
 * @swagger
 * tags:
 *   name: Dreams
 *   description: Dream journal management API
 */

/**
 * @swagger
 * /api/dreams:
 *   post:
 *     summary: Create a new dream entry
 *     tags: [Dreams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *               content:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *               isPrivate:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Dream created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dream'
 *       401:
 *         description: Not authenticated
 */
router.post('/', async (req, res) => {
  // Normally would include auth middleware
  // For this example we'll use a mock authenticated user
  console.log('POST /api/dreams - Request received (mock auth)');
  
  try {
    const userId = req.headers['x-mock-user-id'];
    
    if (!userId) {
      console.log('Dream creation failed - No mock user ID provided');
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { title, content, date, tags, notes, isPrivate } = req.body;
    
    console.log('Creating new dream entry:', { 
      userId, 
      title, 
      contentLength: content ? content.length : 0,
      tags 
    });
    
    // Analyze dream content
    console.log('Analyzing dream content...');
    const analysis = analyzeDream(content);
    
    // Create new dream entry
    const dream = new Dream({
      user: userId,
      title,
      content,
      date: date || new Date(),
      tags: tags || [],
      notes: notes || '',
      isPrivate: isPrivate !== undefined ? isPrivate : true,
      // Add analysis results
      keywords: analysis.keywords,
      emotions: analysis.emotions,
      symbols: analysis.symbols
    });
    
    await dream.save();
    console.log('Dream entry created successfully:', { 
      id: dream._id, 
      title,
      userId,
      keywordsCount: analysis.keywords.length,
      symbolsCount: analysis.symbols.length,
      primaryEmotion: analysis.emotions.primary
    });
    
    res.status(201).json(dream);
    
  } catch (error) {
    console.error('Error creating dream entry:', error.message);
    res.status(500).json({ message: 'Server error creating dream entry' });
  }
});

/**
 * @swagger
 * /api/dreams:
 *   get:
 *     summary: Get all dreams for current user
 *     tags: [Dreams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of dreams to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of dreams to skip for pagination
 *     responses:
 *       200:
 *         description: List of dreams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Dream'
 *       401:
 *         description: Not authenticated
 */
router.get('/', async (req, res) => {
  // Normally would include auth middleware
  console.log('GET /api/dreams - Request received (mock auth)');
  
  try {
    const userId = req.headers['x-mock-user-id'];
    
    if (!userId) {
      console.log('Dream retrieval failed - No mock user ID provided');
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    
    console.log('Retrieving dreams for user:', { 
      userId, 
      limit, 
      skip 
    });
    
    const dreams = await Dream.find({ user: userId })
      .sort({ date: -1 })
      .limit(limit)
      .skip(skip);
    
    console.log('Retrieved dreams successfully:', { 
      userId, 
      count: dreams.length 
    });
    
    res.status(200).json(dreams);
    
  } catch (error) {
    console.error('Error retrieving dreams:', error.message);
    res.status(500).json({ message: 'Server error retrieving dreams' });
  }
});

/**
 * @swagger
 * /api/dreams/{id}:
 *   get:
 *     summary: Get a dream by ID
 *     tags: [Dreams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the dream to retrieve
 *     responses:
 *       200:
 *         description: Dream found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dream'
 *       404:
 *         description: Dream not found
 *       401:
 *         description: Not authenticated or not authorized
 */
router.get('/:id', async (req, res) => {
  console.log('GET /api/dreams/:id - Request received (mock auth):', { 
    dreamId: req.params.id 
  });
  
  try {
    const userId = req.headers['x-mock-user-id'];
    
    if (!userId) {
      console.log('Dream retrieval failed - No mock user ID provided');
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const dream = await Dream.findById(req.params.id);
    
    if (!dream) {
      console.log('Dream not found:', { dreamId: req.params.id });
      return res.status(404).json({ message: 'Dream not found' });
    }
    
    // Check if user owns the dream
    if (dream.user.toString() !== userId) {
      console.log('Unauthorized access to dream:', { 
        dreamId: req.params.id, 
        dreamOwner: dream.user, 
        requestingUser: userId 
      });
      return res.status(401).json({ message: 'Not authorized to access this dream' });
    }
    
    console.log('Dream retrieved successfully:', { 
      dreamId: dream._id, 
      title: dream.title 
    });
    
    res.status(200).json(dream);
    
  } catch (error) {
    console.error('Error retrieving dream:', error.message);
    res.status(500).json({ message: 'Server error retrieving dream' });
  }
});

/**
 * @swagger
 * /api/dreams/{id}:
 *   put:
 *     summary: Update a dream
 *     tags: [Dreams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the dream to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *               isPrivate:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Dream updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dream'
 *       404:
 *         description: Dream not found
 *       401:
 *         description: Not authenticated or not authorized
 */
router.put('/:id', async (req, res) => {
  console.log('PUT /api/dreams/:id - Request received (mock auth):', { 
    dreamId: req.params.id 
  });
  
  try {
    const userId = req.headers['x-mock-user-id'];
    
    if (!userId) {
      console.log('Dream update failed - No mock user ID provided');
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    let dream = await Dream.findById(req.params.id);
    
    if (!dream) {
      console.log('Dream not found for update:', { dreamId: req.params.id });
      return res.status(404).json({ message: 'Dream not found' });
    }
    
    // Check if user owns the dream
    if (dream.user.toString() !== userId) {
      console.log('Unauthorized attempt to update dream:', { 
        dreamId: req.params.id, 
        dreamOwner: dream.user, 
        requestingUser: userId 
      });
      return res.status(401).json({ message: 'Not authorized to update this dream' });
    }
    
    const { title, content, date, tags, notes, isPrivate } = req.body;
    
    // If content has changed, re-analyze the dream
    let analysis = {};
    if (content && content !== dream.content) {
      console.log('Content changed, re-analyzing dream...');
      analysis = analyzeDream(content);
    }
    
    // Update dream fields
    const dreamData = {
      title: title || dream.title,
      content: content || dream.content,
      date: date || dream.date,
      tags: tags || dream.tags,
      notes: notes || dream.notes,
      isPrivate: isPrivate !== undefined ? isPrivate : dream.isPrivate
    };
    
    // Add analysis results if content changed
    if (Object.keys(analysis).length > 0) {
      dreamData.keywords = analysis.keywords;
      dreamData.emotions = analysis.emotions;
      dreamData.symbols = analysis.symbols;
    }
    
    // Update the dream
    dream = await Dream.findByIdAndUpdate(
      req.params.id,
      dreamData,
      { new: true }
    );
    
    console.log('Dream updated successfully:', { 
      dreamId: dream._id, 
      title: dream.title,
      contentChanged: content && content !== dream.content
    });
    
    res.status(200).json(dream);
    
  } catch (error) {
    console.error('Error updating dream:', error.message);
    res.status(500).json({ message: 'Server error updating dream' });
  }
});

/**
 * @swagger
 * /api/dreams/{id}:
 *   delete:
 *     summary: Delete a dream
 *     tags: [Dreams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the dream to delete
 *     responses:
 *       200:
 *         description: Dream deleted successfully
 *       404:
 *         description: Dream not found
 *       401:
 *         description: Not authenticated or not authorized
 */
router.delete('/:id', async (req, res) => {
  console.log('DELETE /api/dreams/:id - Request received (mock auth):', { 
    dreamId: req.params.id 
  });
  
  try {
    const userId = req.headers['x-mock-user-id'];
    
    if (!userId) {
      console.log('Dream deletion failed - No mock user ID provided');
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const dream = await Dream.findById(req.params.id);
    
    if (!dream) {
      console.log('Dream not found for deletion:', { dreamId: req.params.id });
      return res.status(404).json({ message: 'Dream not found' });
    }
    
    // Check if user owns the dream
    if (dream.user.toString() !== userId) {
      console.log('Unauthorized attempt to delete dream:', { 
        dreamId: req.params.id, 
        dreamOwner: dream.user, 
        requestingUser: userId 
      });
      return res.status(401).json({ message: 'Not authorized to delete this dream' });
    }
    
    await Dream.findByIdAndDelete(req.params.id);
    
    console.log('Dream deleted successfully:', { 
      dreamId: req.params.id, 
      title: dream.title 
    });
    
    res.status(200).json({ message: 'Dream deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting dream:', error.message);
    res.status(500).json({ message: 'Server error deleting dream' });
  }
});

/**
 * @swagger
 * /api/dreams/stats:
 *   get:
 *     summary: Get dream statistics for the current user
 *     tags: [Dreams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dream statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalDreams:
 *                   type: integer
 *                 emotionBreakdown:
 *                   type: object
 *                 commonKeywords:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       keyword:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 commonSymbols:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       symbol:
 *                         type: string
 *                       count:
 *                         type: integer
 *       401:
 *         description: Not authenticated
 */
router.get('/stats', async (req, res) => {
  console.log('GET /api/dreams/stats - Request received (mock auth)');
  
  try {
    const userId = req.headers['x-mock-user-id'];
    
    if (!userId) {
      console.log('Stats retrieval failed - No mock user ID provided');
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    console.log('Generating dream statistics for user:', { userId });
    
    // Get all dreams for the user
    const dreams = await Dream.find({ user: userId });
    
    if (dreams.length === 0) {
      console.log('No dreams found for user statistics:', { userId });
      return res.status(200).json({
        totalDreams: 0,
        emotionBreakdown: { positive: 0, negative: 0, neutral: 0 },
        commonKeywords: [],
        commonSymbols: []
      });
    }
    
    // Calculate emotion breakdown
    const emotionCounts = {
      positive: 0,
      negative: 0,
      neutral: 0
    };
    
    // Track keywords and symbols
    const keywordCounts = {};
    const symbolCounts = {};
    
    dreams.forEach(dream => {
      // Count emotions
      emotionCounts[dream.emotions.primary] = 
        (emotionCounts[dream.emotions.primary] || 0) + 1;
      
      // Count keywords
      dream.keywords.forEach(keyword => {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
      });
      
      // Count symbols
      dream.symbols.forEach(symbolObj => {
        symbolCounts[symbolObj.symbol] = (symbolCounts[symbolObj.symbol] || 0) + 1;
      });
    });
    
    // Calculate percentages for emotion breakdown
    const emotionBreakdown = {
      positive: (emotionCounts.positive / dreams.length) * 100,
      negative: (emotionCounts.negative / dreams.length) * 100,
      neutral: (emotionCounts.neutral / dreams.length) * 100
    };
    
    // Get top 5 keywords
    const commonKeywords = Object.entries(keywordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword, count]) => ({ keyword, count }));
    
    // Get top 5 symbols
    const commonSymbols = Object.entries(symbolCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symbol, count]) => ({ symbol, count }));
    
    console.log('Dream statistics generated successfully:', { 
      userId, 
      totalDreams: dreams.length,
      topEmotion: Object.entries(emotionCounts)
        .sort((a, b) => b[1] - a[1])[0][0]
    });
    
    res.status(200).json({
      totalDreams: dreams.length,
      emotionBreakdown,
      commonKeywords,
      commonSymbols
    });
    
  } catch (error) {
    console.error('Error generating dream statistics:', error.message);
    res.status(500).json({ message: 'Server error generating statistics' });
  }
});

module.exports = router; 