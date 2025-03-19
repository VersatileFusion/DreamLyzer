const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;
const Analyzer = require('natural').SentimentAnalyzer;
const stemmer = require('natural').PorterStemmer;
const sentimentAnalyzer = new Analyzer("English", stemmer, "afinn");

// Enhanced dream symbols dictionary
const dreamSymbols = {
  // Moving and travel symbols
  flying: 'Represents freedom, ambition, or escaping limitations',
  falling: 'May symbolize insecurity, loss of control, or failure',
  chase: 'May represent avoiding a problem or feeling threatened',
  running: 'Often indicates a desire to escape from something or anxiety',
  swimming: 'Symbolizes emotional state or how you navigate through feelings',
  driving: 'Represents control over your life direction or journey',
  
  // Environmental symbols
  water: 'Often relates to emotions, the unconscious mind, or purification',
  fire: 'Can symbolize transformation, passion, destruction, or purification',
  earth: 'Represents stability, groundedness, or fertility',
  wind: 'May indicate changes, forces beyond your control, or freedom',
  storm: 'Often symbolizes emotional turmoil or brewing conflict',
  mountain: 'Represents challenges, ambition, or feeling "on top" of a situation',
  forest: 'Can represent the unknown, mystery, or personal growth',
  desert: 'May symbolize isolation, spiritual seeking, or feeling empty',
  
  // Buildings and structures
  house: 'Typically symbolizes the self, personal identity, or security',
  school: 'Often relates to learning experiences or unresolved childhood issues',
  hospital: 'May represent healing, health concerns, or vulnerability',
  church: 'Can symbolize spiritual beliefs, moral questions, or sanctuary',
  tower: 'Often represents ambition, isolation, or perspective',
  bridge: 'Symbolizes transitions, connections, or overcoming obstacles',
  
  // People and relationships
  mother: 'Represents nurturing, protection, or origin',
  father: 'Often symbolizes authority, guidance, or traditional values',
  child: 'May represent innocence, vulnerability, or a new beginning',
  stranger: 'Often symbolizes unknown aspects of yourself or new situations',
  crowd: 'Can represent social pressure, overwhelm, or anonymity',
  
  // Animals
  dog: 'Often represents loyalty, friendship, or protection',
  cat: 'May symbolize independence, mystery, or feminine energy',
  snake: 'May symbolize transformation, knowledge, healing, or hidden fears',
  bird: 'Often represents freedom, perspective, or spiritual aspirations',
  spider: 'Can symbolize creativity, entrapment, or manipulation',
  horse: 'Often represents personal power, freedom, or sexual energy',
  fish: 'May symbolize the unconscious, spirituality, or fertility',
  
  // Objects and symbols
  teeth: 'Can represent anxiety, self-image concerns, or communication issues',
  money: 'Often symbolizes self-worth, power, or values',
  key: 'Represents access, solutions, or new opportunities',
  mirror: 'Often symbolizes self-reflection, identity, or truth',
  book: 'Can represent knowledge, memory, or life story',
  door: 'Symbolizes opportunities, transitions, or choices',
  clock: 'Often represents time pressure, mortality, or life timing',
  
  // Common scenarios
  death: 'Usually symbolizes change, endings, or transformation rather than literal death',
  birth: 'Represents new beginnings, creativity, or potential',
  wedding: 'Often symbolizes commitment, union of different aspects of self, or life transitions',
  exam: 'Can represent self-evaluation, testing, or fear of failure',
  naked: 'May symbolize vulnerability, authenticity, or fear of exposure',
  flying: 'Often represents freedom, transcendence, or a new perspective'
};

// Expanded emotion words dictionary
const emotionWords = {
  positive: [
    'happy', 'joy', 'peaceful', 'excited', 'love', 'wonderful', 'amazing', 'beautiful', 
    'calm', 'free', 'safe', 'friendly', 'gentle', 'pleasant', 'satisfied', 'grateful',
    'confident', 'proud', 'inspired', 'hopeful', 'amused', 'blissful', 'cheerful',
    'content', 'delight', 'eager', 'ecstatic', 'elated', 'enchanted', 'energetic',
    'enthusiastic', 'exhilarated', 'fulfilled', 'glad', 'graceful', 'harmonious',
    'jubilant', 'light', 'lively', 'optimistic', 'playful', 'pleased', 'radiant',
    'refreshed', 'relaxed', 'relieved', 'serene', 'sunny', 'thrilled', 'uplifted'
  ],
  negative: [
    'fear', 'scary', 'afraid', 'anxious', 'panic', 'terrified', 'worried', 'angry', 
    'sad', 'depressed', 'confused', 'lost', 'trapped', 'dark', 'falling', 'dying',
    'abandoned', 'agitated', 'annoyed', 'ashamed', 'bitter', 'crushed', 'defeated',
    'desperate', 'disappointed', 'disgusted', 'disturbed', 'dread', 'embarrassed',
    'enraged', 'frustrated', 'grief', 'guilty', 'helpless', 'hopeless', 'horror',
    'hostile', 'hurt', 'insecure', 'irritated', 'jealous', 'lonely', 'miserable',
    'nervous', 'overwhelmed', 'pain', 'regretful', 'rejected', 'stressed', 'suffering'
  ],
  neutral: [
    'strange', 'unexpected', 'surprising', 'unclear', 'different', 'changing', 
    'thinking', 'wondering', 'curious', 'unknown', 'aware', 'contemplative',
    'detached', 'disoriented', 'distant', 'doubtful', 'hesitant', 'indifferent',
    'mysterious', 'numb', 'observant', 'puzzled', 'questioning', 'reserved',
    'resigned', 'skeptical', 'thoughtful', 'uncertain', 'undecided', 'waiting'
  ]
};

/**
 * Analyzes dream content to extract keywords, emotions, and symbols
 * @param {string} dreamContent - The text content of the dream
 * @returns {Object} Analysis results including keywords, emotions, and symbols
 */
function analyzeDream(dreamContent) {
  console.log('Starting dream analysis for content:', dreamContent.substring(0, 50) + '...');
  
  if (!dreamContent || dreamContent.trim() === '') {
    console.log('Empty dream content provided, returning minimal analysis');
    return {
      keywords: [],
      emotions: {
        primary: 'neutral',
        score: 0,
        breakdown: {
          positive: 0,
          negative: 0,
          neutral: 100
        }
      },
      symbols: [],
      sentiment: {
        score: 0,
        comparative: 0,
        vote: 'neutral'
      }
    };
  }
  
  // Tokenize and normalize the text
  const tokens = tokenizer.tokenize(dreamContent.toLowerCase());
  console.log('Tokenized dream content into', tokens.length, 'tokens');
  
  // Extract keywords (using TF-IDF for better results)
  const keywords = extractKeywordsTfIdf(dreamContent);
  console.log('Extracted keywords:', keywords);
  
  // Analyze emotions
  const emotions = analyzeEmotions(tokens);
  console.log('Emotion analysis results:', emotions);
  
  // Find relevant symbols
  const symbols = findSymbols(tokens, dreamContent);
  console.log('Identified dream symbols:', symbols.map(s => s.symbol));
  
  // Perform sentiment analysis
  const sentiment = analyzeSentiment(dreamContent);
  console.log('Sentiment analysis results:', sentiment);
  
  return {
    keywords,
    emotions,
    symbols,
    sentiment
  };
}

/**
 * Extracts important keywords using TF-IDF algorithm
 * @param {string} text - The text content to analyze
 * @returns {Array} List of keywords
 */
function extractKeywordsTfIdf(text) {
  console.log('Extracting keywords using TF-IDF analysis');
  
  // Create a new TF-IDF instance
  const tfidf = new TfIdf();
  
  // Common English stopwords to filter out
  const stopwords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 
    'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 
    'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 
    'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 
    'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 
    'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 
    'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 
    'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 
    'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 
    'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 
    'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 
    'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now'];
  
  // Add the document
  tfidf.addDocument(text);
  
  // Get the terms and their measures
  let terms = [];
  tfidf.listTerms(0).forEach(item => {
    // Filter out stopwords, short words, and numbers
    if (!stopwords.includes(item.term) && 
        item.term.length > 3 && 
        isNaN(parseFloat(item.term))) {
      terms.push({
        term: item.term,
        tfidf: item.tfidf
      });
    }
  });
  
  // Sort by TF-IDF score and take the top 15
  terms = terms.sort((a, b) => b.tfidf - a.tfidf).slice(0, 15);
  console.log('TF-IDF analysis complete, found', terms.length, 'significant terms');
  
  // Return just the terms
  return terms.map(item => item.term);
}

/**
 * Analyzes emotional tone of the dream
 * @param {Array} tokens - Array of word tokens
 * @returns {Object} Emotion analysis results
 */
function analyzeEmotions(tokens) {
  console.log('Analyzing emotional tone of dream');
  const emotionCounts = {
    positive: 0,
    negative: 0,
    neutral: 0
  };
  
  // Count emotion words by category with weighted importance
  const emotionInstances = [];
  
  tokens.forEach(token => {
    if (emotionWords.positive.includes(token)) {
      emotionCounts.positive++;
      emotionInstances.push({
        word: token,
        type: 'positive',
        position: tokens.indexOf(token)
      });
    } else if (emotionWords.negative.includes(token)) {
      emotionCounts.negative++;
      emotionInstances.push({
        word: token,
        type: 'negative',
        position: tokens.indexOf(token)
      });
    } else if (emotionWords.neutral.includes(token)) {
      emotionCounts.neutral++;
      emotionInstances.push({
        word: token,
        type: 'neutral',
        position: tokens.indexOf(token)
      });
    }
  });
  
  console.log('Emotion counts:', emotionCounts);
  
  // Calculate total emotion words
  const totalEmotionWords = emotionCounts.positive + emotionCounts.negative + emotionCounts.neutral;
  
  // Calculate emotional percentages
  const emotions = {
    primary: 'neutral', // default
    score: 0,
    breakdown: {
      positive: totalEmotionWords ? (emotionCounts.positive / totalEmotionWords) * 100 : 0,
      negative: totalEmotionWords ? (emotionCounts.negative / totalEmotionWords) * 100 : 0,
      neutral: totalEmotionWords ? (emotionCounts.neutral / totalEmotionWords) * 100 : 0
    },
    instances: emotionInstances
  };
  
  // Determine primary emotion
  if (emotions.breakdown.positive > emotions.breakdown.negative && 
      emotions.breakdown.positive > emotions.breakdown.neutral) {
    emotions.primary = 'positive';
    emotions.score = emotions.breakdown.positive;
  } else if (emotions.breakdown.negative > emotions.breakdown.positive && 
             emotions.breakdown.negative > emotions.breakdown.neutral) {
    emotions.primary = 'negative';
    emotions.score = emotions.breakdown.negative;
  } else {
    emotions.primary = 'neutral';
    emotions.score = emotions.breakdown.neutral;
  }
  
  return emotions;
}

/**
 * Finds dream symbols in the content
 * @param {Array} tokens - Array of word tokens
 * @param {string} content - Full dream content for context detection
 * @returns {Array} List of relevant dream symbols and their meanings
 */
function findSymbols(tokens, content) {
  console.log('Searching for known dream symbols in content');
  const foundSymbols = [];
  const uniqueTokens = [...new Set(tokens)]; // Get unique tokens
  
  // First check for exact matches
  uniqueTokens.forEach(token => {
    if (dreamSymbols[token]) {
      foundSymbols.push({
        symbol: token,
        meaning: dreamSymbols[token],
        context: getSymbolContext(token, content)
      });
    }
  });
  
  // Then check for symbols that might be part of compound words
  // or slightly different forms (running vs run, etc.)
  Object.keys(dreamSymbols).forEach(symbol => {
    // Skip symbols we've already found exact matches for
    if (!foundSymbols.some(found => found.symbol === symbol)) {
      // Check if the symbol appears as part of the content
      if (content.toLowerCase().includes(symbol)) {
        foundSymbols.push({
          symbol: symbol,
          meaning: dreamSymbols[symbol],
          context: getSymbolContext(symbol, content)
        });
      }
    }
  });
  
  return foundSymbols;
}

/**
 * Gets the context around a symbol in the text
 * @param {string} symbol - The symbol to find
 * @param {string} content - The full text
 * @returns {string} A short excerpt showing the context
 */
function getSymbolContext(symbol, content) {
  const lowercaseContent = content.toLowerCase();
  const symbolIndex = lowercaseContent.indexOf(symbol);
  
  if (symbolIndex === -1) return '';
  
  // Get a window of text around the symbol (about 100 characters)
  const startIndex = Math.max(0, symbolIndex - 50);
  const endIndex = Math.min(lowercaseContent.length, symbolIndex + symbol.length + 50);
  
  let context = content.substring(startIndex, endIndex);
  
  // Add ellipsis if we're not at the beginning or end
  if (startIndex > 0) {
    context = '...' + context;
  }
  if (endIndex < content.length) {
    context = context + '...';
  }
  
  return context;
}

/**
 * Performs sentiment analysis on dream content
 * @param {string} content - The dream content to analyze
 * @returns {Object} Sentiment analysis results
 */
function analyzeSentiment(content) {
  console.log('Performing sentiment analysis');
  
  // Use natural's sentiment analyzer
  const tokenized = tokenizer.tokenize(content);
  const score = sentimentAnalyzer.getSentiment(tokenized);
  
  // Calculate comparative score (normalized by text length)
  const comparative = tokenized.length > 0 ? score / tokenized.length : 0;
  
  // Determine overall sentiment
  let vote = 'neutral';
  if (comparative > 0.05) {
    vote = 'positive';
  } else if (comparative < -0.05) {
    vote = 'negative';
  }
  
  console.log('Sentiment analysis complete:', { score, comparative, vote });
  
  return {
    score,
    comparative,
    vote
  };
}

/**
 * Determines potential dream categories based on content analysis
 * @param {Object} analysis - The complete dream analysis
 * @returns {Array} Suggested categories for the dream
 */
function suggestDreamCategories(analysis) {
  console.log('Suggesting dream categories based on analysis');
  
  const suggestedCategories = [];
  const { emotions, symbols, sentiment, keywords } = analysis;
  
  // Check for nightmares (intense negative emotions)
  if (emotions.primary === 'negative' && emotions.score > 70) {
    suggestedCategories.push({
      category: 'nightmare',
      confidence: Math.min(90, emotions.score)
    });
  }
  
  // Check for adventure dreams
  const adventureKeywords = ['adventure', 'journey', 'travel', 'exploring', 'quest'];
  const hasAdventureKeywords = keywords.some(keyword => 
    adventureKeywords.includes(keyword)
  );
  
  if (hasAdventureKeywords || symbols.some(s => 
    ['mountain', 'forest', 'journey', 'travel'].includes(s.symbol)
  )) {
    suggestedCategories.push({
      category: 'adventure',
      confidence: 75
    });
  }
  
  // Check for fantasy dreams
  const fantasyKeywords = ['magic', 'dragon', 'fairy', 'wizard', 'mythical'];
  const hasFantasyKeywords = keywords.some(keyword => 
    fantasyKeywords.includes(keyword)
  );
  
  if (hasFantasyKeywords) {
    suggestedCategories.push({
      category: 'fantasy',
      confidence: 80
    });
  }
  
  // If no specific categories found, provide a default
  if (suggestedCategories.length === 0) {
    if (emotions.primary === 'positive') {
      suggestedCategories.push({
        category: 'healing',
        confidence: 50
      });
    } else {
      suggestedCategories.push({
        category: 'uncategorized',
        confidence: 30
      });
    }
  }
  
  // Sort by confidence
  suggestedCategories.sort((a, b) => b.confidence - a.confidence);
  
  return suggestedCategories;
}

module.exports = {
  analyzeDream,
  suggestDreamCategories
}; 