const Dream = require('../models/dream.model');
const User = require('../models/user.model');
const { analyzeDream, suggestDreamCategories } = require('../utils/dreamAnalyzer');
const advancedNLP = require('../utils/advancedNLP');
const mongoose = require('mongoose');
const { findRelatedDreams, findEvolvingPatterns } = require('../utils/dreamPatternComparison');

// Dream symbols dictionary for use with advancedNLP
const dreamSymbols = require('../utils/dreamSymbols');

/**
 * Create a new dream entry
 * @route POST /api/dreams
 * @access Private
 */
const createDream = async (req, res) => {
  console.log('Controller: createDream - Request received');
  
  try {
    const userId = req.user._id;
    const { title, content, date, tags, notes, isPrivate, category } = req.body;
    
    console.log('Creating new dream entry:', { 
      userId, 
      title, 
      contentLength: content ? content.length : 0,
      tags,
      category
    });
    
    // Analyze dream content with basic analyzer
    console.log('Analyzing dream content...');
    const basicAnalysis = analyzeDream(content);
    
    // Perform advanced NLP analysis
    console.log('Performing advanced NLP analysis...');
    const advancedAnalysis = advancedNLP.analyzeText(content);
    
    // Find dream symbols with context using Compromise
    const symbols = advancedNLP.findDreamSymbols(content, dreamSymbols);
    
    // Suggest dream categories
    const suggestedCategories = advancedNLP.suggestDreamCategories(advancedAnalysis);
    const finalCategory = category || (suggestedCategories.length > 0 ? suggestedCategories[0].category : 'uncategorized');
    
    // Create new dream entry
    const dream = new Dream({
      user: userId,
      title,
      content,
      date: date || new Date(),
      tags: tags || [],
      notes: notes || '',
      isPrivate: isPrivate !== undefined ? isPrivate : true,
      category: finalCategory,
      // Add analysis results
      keywords: advancedAnalysis.keywords || basicAnalysis.keywords,
      emotions: basicAnalysis.emotions, // Keep using basic emotions analysis
      symbols: symbols.length > 0 ? symbols : basicAnalysis.symbols,
      // Add new advanced analysis fields
      entities: advancedAnalysis.entities || [],
      topics: advancedAnalysis.topics || [],
      sentiment: advancedAnalysis.sentiment || basicAnalysis.sentiment
    });
    
    await dream.save();
    
    // Update user stats
    const user = await User.findById(userId);
    if (user) {
      await user.updateDreamStats(true, dream.date);
    }
    
    console.log('Dream entry created successfully:', { 
      id: dream._id, 
      title,
      userId,
      keywordsCount: advancedAnalysis.keywords ? advancedAnalysis.keywords.length : 0,
      symbolsCount: symbols.length,
      primaryEmotion: basicAnalysis.emotions.primary,
      category: finalCategory
    });
    
    res.status(201).json(dream);
    
  } catch (error) {
    console.error('Error creating dream entry:', error.message);
    res.status(500).json({ message: 'Server error creating dream entry' });
  }
};

/**
 * Get all dreams for current user
 * @route GET /api/dreams
 * @access Private
 */
const getDreams = async (req, res) => {
  console.log('Controller: getDreams - Request received');
  
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    const category = req.query.category;
    const tag = req.query.tag;
    const sort = req.query.sort || '-date';  // Default sort by date, newest first
    
    // Build query
    const query = { user: userId };
    
    // Add filters if provided
    if (category) {
      query.category = category;
    }
    
    if (tag) {
      query.tags = tag;
    }
    
    console.log('Fetching dreams with query:', query);
    
    const dreams = await Dream.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip);
    
    const total = await Dream.countDocuments(query);
    
    console.log(`Found ${dreams.length} dreams (total: ${total})`);
    
    res.status(200).json({
      dreams,
      pagination: {
        total,
        limit,
        skip,
        hasMore: total > skip + limit
      }
    });
    
  } catch (error) {
    console.error('Error fetching dreams:', error.message);
    res.status(500).json({ message: 'Server error fetching dreams' });
  }
};

/**
 * Get a single dream by ID
 * @route GET /api/dreams/:id
 * @access Private
 */
const getDreamById = async (req, res) => {
  console.log('Controller: getDreamById - Request received for dream:', req.params.id);
  
  try {
    const dream = await Dream.findById(req.params.id);
    
    if (!dream) {
      console.log('Dream not found:', req.params.id);
      return res.status(404).json({ message: 'Dream not found' });
    }
    
    // Check if the dream belongs to the current user or is public
    if (dream.user.toString() !== req.user._id.toString() && dream.isPrivate) {
      console.log('Unauthorized access attempt to private dream:', req.params.id);
      return res.status(403).json({ message: 'Not authorized to access this dream' });
    }
    
    console.log('Dream retrieved successfully:', req.params.id);
    res.status(200).json(dream);
    
  } catch (error) {
    console.error('Error fetching dream:', error.message);
    res.status(500).json({ message: 'Server error fetching dream' });
  }
};

/**
 * Update a dream
 * @route PUT /api/dreams/:id
 * @access Private
 */
const updateDream = async (req, res) => {
  console.log('Controller: updateDream - Request received for dream:', req.params.id);
  
  try {
    let dream = await Dream.findById(req.params.id);
    
    if (!dream) {
      console.log('Dream not found:', req.params.id);
      return res.status(404).json({ message: 'Dream not found' });
    }
    
    // Check if the dream belongs to the current user
    if (dream.user.toString() !== req.user._id.toString()) {
      console.log('Unauthorized update attempt for dream:', req.params.id);
      return res.status(403).json({ message: 'Not authorized to update this dream' });
    }
    
    const { title, content, date, tags, notes, isPrivate, category } = req.body;
    
    // If content is being updated, reanalyze the dream
    let basicAnalysis = {};
    let advancedAnalysis = {};
    if (content && content !== dream.content) {
      console.log('Content changed, reanalyzing dream...');
      basicAnalysis = analyzeDream(content);
      advancedAnalysis = advancedNLP.analyzeText(content);
      
      // Find dream symbols with context using Compromise
      const symbols = advancedNLP.findDreamSymbols(content, dreamSymbols);
      advancedAnalysis.symbols = symbols;
    }
    
    // Update fields
    const updateFields = {};
    if (title) updateFields.title = title;
    if (content) {
      updateFields.content = content;
      
      // Update analysis results if content changed
      if (Object.keys(advancedAnalysis).length > 0) {
        updateFields.keywords = advancedAnalysis.keywords || basicAnalysis.keywords;
        updateFields.emotions = basicAnalysis.emotions; // Keep using basic emotions analysis
        updateFields.symbols = advancedAnalysis.symbols || basicAnalysis.symbols;
        updateFields.entities = advancedAnalysis.entities || [];
        updateFields.topics = advancedAnalysis.topics || [];
        updateFields.sentiment = advancedAnalysis.sentiment || basicAnalysis.sentiment;
      }
    }
    if (date) updateFields.date = date;
    if (tags) updateFields.tags = tags;
    if (notes !== undefined) updateFields.notes = notes;
    if (isPrivate !== undefined) updateFields.isPrivate = isPrivate;
    
    // If category is provided or content changed, update category
    if (category) {
      updateFields.category = category;
    } else if (content && content !== dream.content) {
      // Suggest new category based on changed content
      const suggestedCategories = advancedNLP.suggestDreamCategories(advancedAnalysis);
      if (suggestedCategories.length > 0) {
        updateFields.category = suggestedCategories[0].category;
      }
    }
    
    // Update the dream
    dream = await Dream.findByIdAndUpdate(
      req.params.id, 
      { $set: updateFields }, 
      { new: true }
    );
    
    console.log('Dream updated successfully:', req.params.id);
    res.status(200).json(dream);
    
  } catch (error) {
    console.error('Error updating dream:', error.message);
    res.status(500).json({ message: 'Server error updating dream' });
  }
};

/**
 * Delete a dream
 * @route DELETE /api/dreams/:id
 * @access Private
 */
const deleteDream = async (req, res) => {
  console.log('Controller: deleteDream - Request received for dream:', req.params.id);
  
  try {
    const dream = await Dream.findById(req.params.id);
    
    if (!dream) {
      console.log('Dream not found:', req.params.id);
      return res.status(404).json({ message: 'Dream not found' });
    }
    
    // Check if the dream belongs to the current user
    if (dream.user.toString() !== req.user._id.toString()) {
      console.log('Unauthorized delete attempt for dream:', req.params.id);
      return res.status(403).json({ message: 'Not authorized to delete this dream' });
    }
    
    await Dream.findByIdAndDelete(req.params.id);
    console.log('Dream deleted successfully:', req.params.id);
    
    // Update user stats
    const user = await User.findById(req.user._id);
    if (user && user.stats.totalDreams > 0) {
      user.stats.totalDreams -= 1;
      await user.save();
    }
    
    res.status(200).json({ message: 'Dream deleted' });
    
  } catch (error) {
    console.error('Error deleting dream:', error.message);
    res.status(500).json({ message: 'Server error deleting dream' });
  }
};

/**
 * Search dreams by keywords
 * @route GET /api/dreams/search
 * @access Private
 */
const searchDreams = async (req, res) => {
  console.log('Controller: searchDreams - Request received');
  
  try {
    const userId = req.user._id;
    const searchQuery = req.query.q;
    
    if (!searchQuery) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    console.log('Searching dreams with query:', searchQuery);
    
    // Use the improved text search with better scoring
    const dreams = await Dream.find({
      user: userId,
      $text: { $search: searchQuery }
    })
    .sort({ score: { $meta: 'textScore' } });
    
    console.log(`Found ${dreams.length} dreams matching search query`);
    
    res.status(200).json(dreams);
    
  } catch (error) {
    console.error('Error searching dreams:', error.message);
    res.status(500).json({ message: 'Server error searching dreams' });
  }
};

/**
 * Get dream statistics
 * @route GET /api/dreams/stats
 * @access Private
 */
const getDreamStats = async (req, res) => {
  console.log('Controller: getDreamStats - Request received');
  
  try {
    const userId = req.user._id;
    
    // Get total count of dreams
    const totalDreams = await Dream.countDocuments({ user: userId });
    
    // Get count by category
    const categoryStats = await Dream.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get emotion distribution
    const emotionStats = await Dream.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$emotions.primary', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get most common symbols
    const symbolStats = await Dream.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $unwind: '$symbols' },
      { $group: { _id: '$symbols.symbol', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get most common entities (new field)
    const entityStats = await Dream.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), entities: { $exists: true } } },
      { $unwind: '$entities' },
      { $group: { 
        _id: { text: '$entities.text', type: '$entities.type' }, 
        count: { $sum: 1 } 
      } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get dreams over time (by month)
    const timeStats = await Dream.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Get sentiment trends by month (new stats)
    const sentimentTrends = await Dream.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), sentiment: { $exists: true } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          avgScore: { $avg: '$sentiment.score' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    console.log('Dream statistics generated successfully');
    
    res.status(200).json({
      totalDreams,
      categoryStats,
      emotionStats,
      symbolStats,
      entityStats,
      timeStats,
      sentimentTrends
    });
    
  } catch (error) {
    console.error('Error generating dream statistics:', error.message);
    res.status(500).json({ message: 'Server error generating dream statistics' });
  }
};

/**
 * Analyze patterns across multiple dreams
 * @route GET /api/dreams/patterns
 * @access Private
 */
const analyzeDreamPatterns = async (req, res) => {
  console.log('Controller: analyzeDreamPatterns - Request received');
  
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 20; // Analyze last 20 dreams by default
    
    // Get the user's dreams
    const dreams = await Dream.find({ user: userId })
      .sort({ date: -1 })
      .limit(limit);
    
    if (dreams.length === 0) {
      return res.status(200).json({
        message: 'No dreams found to analyze patterns',
        patterns: {}
      });
    }
    
    // Extract dream contents for analysis
    const dreamContents = dreams.map(dream => dream.content);
    
    // Analyze recurring patterns
    const patterns = advancedNLP.analyzeRecurringPatterns(dreamContents);
    
    console.log('Dream pattern analysis complete:', {
      analyzedDreams: dreams.length,
      recurringThemes: patterns.recurringThemes.length,
      recurringEntities: patterns.recurringEntities.length,
      recurringPhrases: patterns.recurringPhrases.length
    });
    
    res.status(200).json({
      analyzedDreams: dreams.length,
      patterns
    });
    
  } catch (error) {
    console.error('Error analyzing dream patterns:', error.message);
    res.status(500).json({ message: 'Server error analyzing dream patterns' });
  }
};

/**
 * Share a dream with others
 * @route POST /api/dreams/:id/share
 * @access Private
 */
const shareDream = async (req, res) => {
  console.log('Controller: shareDream - Request received for dream:', req.params.id);
  
  try {
    const dream = await Dream.findById(req.params.id);
    
    if (!dream) {
      console.log('Dream not found:', req.params.id);
      return res.status(404).json({ message: 'Dream not found' });
    }
    
    // Check if the dream belongs to the current user
    if (dream.user.toString() !== req.user._id.toString()) {
      console.log('Unauthorized share attempt for dream:', req.params.id);
      return res.status(403).json({ message: 'Not authorized to share this dream' });
    }
    
    // Set dream to public
    dream.isPrivate = false;
    
    // Update sharing information
    dream.sharing = {
      isShared: true,
      sharedAt: new Date(),
      viewCount: 0
    };
    
    await dream.save();
    
    console.log('Dream shared successfully:', req.params.id);
    
    // Generate a shareable link
    const shareableLink = `${req.protocol}://${req.get('host')}/api/dreams/shared/${dream._id}`;
    
    res.status(200).json({
      message: 'Dream shared successfully',
      shareableLink,
      dream
    });
    
  } catch (error) {
    console.error('Error sharing dream:', error.message);
    res.status(500).json({ message: 'Server error sharing dream' });
  }
};

/**
 * Access a shared dream
 * @route GET /api/dreams/shared/:id
 * @access Public
 */
const getSharedDream = async (req, res) => {
  console.log('Controller: getSharedDream - Request received for dream:', req.params.id);
  
  try {
    const dream = await Dream.findById(req.params.id);
    
    if (!dream) {
      console.log('Dream not found:', req.params.id);
      return res.status(404).json({ message: 'Dream not found' });
    }
    
    // Check if the dream is public
    if (dream.isPrivate) {
      console.log('Attempt to access private dream:', req.params.id);
      return res.status(403).json({ message: 'This dream is not shared' });
    }
    
    // Increment view count
    dream.sharing.viewCount += 1;
    await dream.save();
    
    console.log('Shared dream accessed successfully:', req.params.id);
    
    // Return the dream without sensitive information
    const sharedDream = {
      title: dream.title,
      content: dream.content,
      date: dream.date,
      keywords: dream.keywords,
      emotions: dream.emotions,
      symbols: dream.symbols,
      topics: dream.topics,
      sentiment: dream.sentiment,
      category: dream.category,
      viewCount: dream.sharing.viewCount
    };
    
    res.status(200).json(sharedDream);
    
  } catch (error) {
    console.error('Error accessing shared dream:', error.message);
    res.status(500).json({ message: 'Server error accessing shared dream' });
  }
};

/**
 * Generate personalized insights for a specific dream
 * @route GET /api/dreams/:id/insights
 * @access Private
 */
const generateDreamInsights = async (req, res) => {
  console.log('Controller: generateDreamInsights - Request received for dream:', req.params.id);
  
  try {
    const userId = req.user._id;
    const dream = await Dream.findById(req.params.id);
    
    if (!dream) {
      console.log('Dream not found:', req.params.id);
      return res.status(404).json({ message: 'Dream not found' });
    }
    
    // Check if the dream belongs to the current user
    if (dream.user.toString() !== userId.toString()) {
      console.log('Unauthorized insights attempt for dream:', req.params.id);
      return res.status(403).json({ message: 'Not authorized to access this dream' });
    }
    
    // Get user's dream history for context
    const userDreams = await Dream.find({ user: userId })
      .sort({ date: -1 })
      .limit(20) // Increased to provide more context
      .select('content emotions symbols category sentiment keywords date title');
    
    const dreamHistory = userDreams.filter(d => d._id.toString() !== dream._id.toString());
    
    // Analyze emotional patterns
    const emotionalPatterns = analyzeEmotionalPatterns(dream, dreamHistory);
    
    // Analyze symbolic connections
    const symbolicConnections = analyzeSymbolicConnections(dream, dreamHistory);
    
    // Analyze recurring themes
    const recurringThemes = findRecurringThemes(dream, dreamHistory);
    
    // Find related dreams using the new pattern comparison utility
    const relatedDreams = findRelatedDreams(dream, dreamHistory);
    
    // Analyze evolving patterns over time
    const evolvingPatterns = findEvolvingPatterns(dream, dreamHistory);
    
    // Generate personalized psychological insights
    const psychologicalInsights = generatePsychologicalInsights(dream, emotionalPatterns, symbolicConnections);
    
    // Suggest connections to waking life
    const wakingLifeConnections = suggestWakingLifeConnections(dream);
    
    const insights = {
      dreamId: dream._id,
      title: dream.title,
      date: dream.date,
      emotionalPatterns,
      symbolicConnections,
      recurringThemes,
      psychologicalInsights,
      wakingLifeConnections,
      relatedDreams: relatedDreams.slice(0, 5), // Top 5 related dreams
      evolvingPatterns
    };
    
    console.log('Dream insights generated successfully for dream:', req.params.id);
    
    res.status(200).json(insights);
    
  } catch (error) {
    console.error('Error generating dream insights:', error.message);
    res.status(500).json({ message: 'Server error generating dream insights' });
  }
};

/**
 * Analyze emotional patterns between the current dream and dream history
 * @param {Object} currentDream - The dream to analyze
 * @param {Array} dreamHistory - The user's dream history
 * @returns {Object} Analysis of emotional patterns
 */
function analyzeEmotionalPatterns(currentDream, dreamHistory) {
  // Extract current dream emotions
  const currentEmotions = currentDream.emotions || { primary: 'neutral', breakdown: {} };
  
  // Collect emotions from dream history
  const historicalEmotions = dreamHistory.map(dream => dream.emotions || { primary: 'neutral', breakdown: {} });
  
  // Count emotion frequencies in history
  const emotionFrequency = {};
  historicalEmotions.forEach(emotion => {
    if (emotion.primary) {
      emotionFrequency[emotion.primary] = (emotionFrequency[emotion.primary] || 0) + 1;
    }
  });
  
  // Check if current primary emotion is common in history
  const currentEmotionFrequency = emotionFrequency[currentEmotions.primary] || 0;
  const isRecurringEmotion = currentEmotionFrequency > (dreamHistory.length * 0.3); // More than 30% of dreams
  
  return {
    currentPrimaryEmotion: currentEmotions.primary,
    emotionFrequencyInHistory: emotionFrequency,
    isRecurringEmotion,
    emotionalInsight: isRecurringEmotion 
      ? `Your dream features "${currentEmotions.primary}" emotions, which appear frequently in your dream history. This suggests a significant emotional pattern worth exploring.` 
      : `This dream's primary emotion "${currentEmotions.primary}" is relatively uncommon in your dream history, suggesting it may be connected to recent experiences.`
  };
}

/**
 * Analyze symbolic connections between the current dream and dream history
 * @param {Object} currentDream - The dream to analyze
 * @param {Array} dreamHistory - The user's dream history
 * @returns {Object} Analysis of symbolic connections
 */
function analyzeSymbolicConnections(currentDream, dreamHistory) {
  // Extract symbols from current dream
  const currentSymbols = currentDream.symbols || [];
  const currentSymbolNames = currentSymbols.map(s => s.symbol);
  
  // Collect symbols from dream history
  const historicalSymbols = {};
  dreamHistory.forEach(dream => {
    const symbols = dream.symbols || [];
    symbols.forEach(symbol => {
      historicalSymbols[symbol.symbol] = (historicalSymbols[symbol.symbol] || 0) + 1;
    });
  });
  
  // Find recurring symbols
  const recurringSymbols = currentSymbolNames
    .filter(symbol => historicalSymbols[symbol] > 1)
    .map(symbol => ({
      symbol,
      frequency: historicalSymbols[symbol],
      interpretation: currentSymbols.find(s => s.symbol === symbol)?.interpretation || ''
    }));
  
  return {
    symbolsInCurrentDream: currentSymbolNames,
    recurringSymbols,
    symbolInsight: recurringSymbols.length > 0
      ? `Your dream contains ${recurringSymbols.length} symbols that appear in your past dreams. Pay special attention to "${recurringSymbols[0]?.symbol}" which appears most frequently.`
      : "This dream contains unique symbols compared to your dream history, suggesting new themes or experiences."
  };
}

/**
 * Find recurring themes between current dream and dream history
 * @param {Object} currentDream - The dream to analyze
 * @param {Array} dreamHistory - The user's dream history
 * @returns {Object} Analysis of recurring themes
 */
function findRecurringThemes(currentDream, dreamHistory) {
  // Extract keywords from current dream
  const currentKeywords = currentDream.keywords || [];
  
  // Collect keywords from dream history
  const allKeywords = {};
  dreamHistory.forEach(dream => {
    const keywords = dream.keywords || [];
    keywords.forEach(keyword => {
      allKeywords[keyword] = (allKeywords[keyword] || 0) + 1;
    });
  });
  
  // Find recurring themes (keywords that appear in multiple dreams)
  const recurringThemes = currentKeywords
    .filter(keyword => allKeywords[keyword] > 1)
    .map(keyword => ({
      theme: keyword,
      frequency: allKeywords[keyword]
    }))
    .sort((a, b) => b.frequency - a.frequency);
  
  return {
    recurringThemes,
    themeInsight: recurringThemes.length > 0
      ? `Your dream contains themes that recur in your dream history, especially "${recurringThemes[0]?.theme}". This suggests important ongoing psychological content.`
      : "This dream explores themes that are relatively new in your dream journal."
  };
}

/**
 * Generate psychological insights based on dream analysis
 * @param {Object} dream - The dream to analyze
 * @param {Object} emotionalPatterns - Analysis of emotional patterns
 * @param {Object} symbolicConnections - Analysis of symbolic connections
 * @returns {Array} Psychological insights
 */
function generatePsychologicalInsights(dream, emotionalPatterns, symbolicConnections) {
  const insights = [];
  
  // Generate insight based on emotion
  if (dream.emotions?.primary) {
    const emotion = dream.emotions.primary;
    
    if (emotion === 'fear' || emotion === 'anxiety') {
      insights.push("Your dream exhibits anxiety which may reflect unresolved concerns or challenges you're facing in waking life.");
    } else if (emotion === 'joy' || emotion === 'excitement') {
      insights.push("The positive emotional tone suggests fulfillment or anticipation of something positive in your life.");
    } else if (emotion === 'sadness' || emotion === 'grief') {
      insights.push("The melancholy in this dream might relate to unprocessed loss or disappointment that seeks acknowledgment.");
    } else if (emotion === 'anger' || emotion === 'frustration') {
      insights.push("Your dream reveals frustration that may indicate unresolved conflicts or unmet needs.");
    } else if (emotion === 'confusion') {
      insights.push("The confusion in your dream might reflect uncertainty about decisions or direction in your waking life.");
    }
  }
  
  // Generate insight based on symbols
  if (symbolicConnections.recurringSymbols.length > 0) {
    insights.push(`The presence of recurring symbol "${symbolicConnections.recurringSymbols[0]?.symbol}" suggests this represents an important psychological archetype for you.`);
  }
  
  // Generate insight based on sentiment analysis
  if (dream.sentiment) {
    if (dream.sentiment.score < -0.5) {
      insights.push("The strongly negative tone of this dream may be processing difficult emotions or experiences.");
    } else if (dream.sentiment.score > 0.5) {
      insights.push("The positive nature of this dream could reflect psychological well-being or optimism.");
    } else {
      insights.push("The mixed emotional tone suggests complex feelings around the dream's subject matter.");
    }
  }
  
  // Add insight about dream category
  if (dream.category) {
    if (dream.category === 'nightmare') {
      insights.push("This nightmare may serve as a way for your mind to process and confront fears in a safe environment.");
    } else if (dream.category === 'lucid') {
      insights.push("Your lucid dreaming demonstrates an integration between conscious and unconscious mental processes.");
    } else if (dream.category === 'recurring') {
      insights.push("Recurring dreams often highlight unresolved issues or important themes that demand your attention.");
    }
  }
  
  return insights;
}

/**
 * Suggest potential connections to waking life
 * @param {Object} dream - The dream to analyze
 * @returns {Array} Suggested waking life connections
 */
function suggestWakingLifeConnections(dream) {
  const suggestions = [];
  
  // Add general suggestions
  suggestions.push("Consider recent events that may have triggered similar emotions to those in your dream.");
  
  // Add suggestions based on dream category
  if (dream.category === 'nightmare') {
    suggestions.push("Reflect on current sources of stress or anxiety in your life that might be manifesting in your dreams.");
  } else if (dream.category === 'adventure') {
    suggestions.push("This dream might reflect a desire for more excitement or new experiences in your daily life.");
  }
  
  // Add suggestion based on sentiment
  if (dream.sentiment && dream.sentiment.score < 0) {
    suggestions.push("The negative tone might indicate unresolved conflicts or concerns that would benefit from conscious attention.");
  } else if (dream.sentiment && dream.sentiment.score > 0) {
    suggestions.push("The positive elements may reflect aspects of your life that bring fulfillment or resonate with your values.");
  }
  
  // Add symbol-based suggestion
  if (dream.symbols && dream.symbols.length > 0) {
    const mainSymbol = dream.symbols[0];
    suggestions.push(`The presence of "${mainSymbol.symbol}" might connect to ${mainSymbol.interpretation.toLowerCase()}`);
  }
  
  return suggestions;
}

module.exports = {
  createDream,
  getDreams,
  getDreamById,
  updateDream,
  deleteDream,
  searchDreams,
  getDreamStats,
  analyzeDreamPatterns,
  shareDream,
  getSharedDream,
  generateDreamInsights
}; 