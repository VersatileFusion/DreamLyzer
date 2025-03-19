const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

// Dream symbols dictionary (simplified version)
const dreamSymbols = {
  flying: 'Represents freedom, ambition, or escaping limitations',
  falling: 'May symbolize insecurity, loss of control, or failure',
  water: 'Often relates to emotions, the unconscious mind, or purification',
  teeth: 'Can represent anxiety, self-image concerns, or communication issues',
  snake: 'May symbolize transformation, knowledge, healing, or hidden fears',
  dog: 'Often represents loyalty, friendship, or protection',
  house: 'Typically symbolizes the self, personal identity, or security',
  forest: 'Can represent the unknown, mystery, or personal growth',
  death: 'Usually symbolizes change, endings, or transformation rather than literal death',
  chase: 'May represent avoiding a problem or feeling threatened'
};

// Simple emotion words dictionary
const emotionWords = {
  positive: ['happy', 'joy', 'peaceful', 'excited', 'love', 'wonderful', 'amazing', 'beautiful', 
             'calm', 'free', 'safe', 'friendly', 'gentle', 'pleasant', 'satisfied'],
  negative: ['fear', 'scary', 'afraid', 'anxious', 'panic', 'terrified', 'worried', 'angry', 
             'sad', 'depressed', 'confused', 'lost', 'trapped', 'dark', 'falling', 'dying'],
  neutral: ['strange', 'unexpected', 'surprising', 'unclear', 'different', 'changing', 
            'thinking', 'wondering', 'curious', 'unknown']
};

/**
 * Analyzes dream content to extract keywords, emotions, and symbols
 * @param {string} dreamContent - The text content of the dream
 * @returns {Object} Analysis results including keywords, emotions, and symbols
 */
function analyzeDream(dreamContent) {
  console.log('Starting dream analysis for content:', dreamContent.substring(0, 50) + '...');
  
  // Tokenize and normalize the text
  const tokens = tokenizer.tokenize(dreamContent.toLowerCase());
  console.log('Tokenized dream content into', tokens.length, 'tokens');
  
  // Extract keywords (simplistic approach - could be improved with TF-IDF)
  const keywords = extractKeywords(tokens);
  console.log('Extracted keywords:', keywords);
  
  // Analyze emotions
  const emotions = analyzeEmotions(tokens);
  console.log('Emotion analysis results:', emotions);
  
  // Find relevant symbols
  const symbols = findSymbols(tokens);
  console.log('Identified dream symbols:', symbols.map(s => s.symbol));
  
  return {
    keywords,
    emotions,
    symbols
  };
}

/**
 * Extracts important keywords from tokens
 * @param {Array} tokens - Array of word tokens
 * @returns {Array} List of keywords
 */
function extractKeywords(tokens) {
  console.log('Extracting keywords from tokens');
  // Remove common English stopwords
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
    
  // Filter out stopwords and keep only words longer than 3 characters
  const filteredTokens = tokens.filter(token => 
    !stopwords.includes(token) && token.length > 3);
  
  // Count word frequencies
  const wordFrequency = {};
  filteredTokens.forEach(token => {
    wordFrequency[token] = (wordFrequency[token] || 0) + 1;
  });
  
  console.log('Word frequency calculated:', Object.keys(wordFrequency).length, 'unique words');
  
  // Sort by frequency and take the top 10
  const sortedWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(entry => entry[0]);
  
  return sortedWords;
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
  
  // Count emotion words by category
  tokens.forEach(token => {
    if (emotionWords.positive.includes(token)) {
      emotionCounts.positive++;
    } else if (emotionWords.negative.includes(token)) {
      emotionCounts.negative++;
    } else if (emotionWords.neutral.includes(token)) {
      emotionCounts.neutral++;
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
    }
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
 * @returns {Array} List of relevant dream symbols and their meanings
 */
function findSymbols(tokens) {
  console.log('Searching for known dream symbols in content');
  const foundSymbols = [];
  const uniqueTokens = [...new Set(tokens)]; // Get unique tokens
  
  uniqueTokens.forEach(token => {
    if (dreamSymbols[token]) {
      foundSymbols.push({
        symbol: token,
        meaning: dreamSymbols[token]
      });
    }
  });
  
  return foundSymbols;
}

module.exports = {
  analyzeDream
}; 