const natural = require('natural');
const nlp = require('compromise');

// Extensions for better dream-related analysis
require('compromise/plugins/speed'); // For faster processing
require('compromise/plugins/topics'); // For topic extraction

// Natural.js components
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;
const stemmer = natural.PorterStemmer;
const Analyzer = natural.SentimentAnalyzer;
const sentimentAnalyzer = new Analyzer("English", stemmer, "afinn");

/**
 * Advanced NLP analysis of dream content
 * @param {string} text - The dream content to analyze
 * @returns {Object} Comprehensive analysis of the dream
 */
function analyzeText(text) {
  if (!text || text.trim() === '') {
    return {
      entities: [],
      topics: [],
      phrases: [],
      sentences: [],
      sentiment: {
        score: 0,
        comparative: 0,
        vote: 'neutral'
      },
      keywords: []
    };
  }

  // Process with compromise
  const doc = nlp(text);
  
  // Extract entities
  const entities = extractEntities(doc);
  
  // Extract topics
  const topics = extractTopics(doc);
  
  // Extract key phrases
  const phrases = extractPhrases(doc);
  
  // Get sentence analysis
  const sentences = analyzeSentences(doc);
  
  // Get sentiment (using Natural.js for more accurate sentiment)
  const sentiment = analyzeSentiment(text);
  
  // Get keywords (using TF-IDF for better keyword extraction)
  const keywords = extractKeywordsTfIdf(text);
  
  return {
    entities,
    topics,
    phrases,
    sentences,
    sentiment,
    keywords
  };
}

/**
 * Extract named entities from text using Compromise
 * @param {Object} doc - Compromise document
 * @returns {Array} Extracted entities
 */
function extractEntities(doc) {
  const entities = [];
  
  // Extract people
  const people = doc.people().json({ normal: true });
  if (people.length > 0) {
    entities.push(
      ...people.map(p => ({
        type: 'person',
        text: p.normal || p.text,
        confidence: 0.8
      }))
    );
  }
  
  // Extract places
  const places = doc.places().json({ normal: true });
  if (places.length > 0) {
    entities.push(
      ...places.map(p => ({
        type: 'place',
        text: p.normal || p.text,
        confidence: 0.7
      }))
    );
  }
  
  // Extract organizations
  const organizations = doc.organizations().json({ normal: true });
  if (organizations.length > 0) {
    entities.push(
      ...organizations.map(o => ({
        type: 'organization',
        text: o.normal || o.text,
        confidence: 0.6
      }))
    );
  }
  
  // Extract dates - important for time references in dreams
  const dates = doc.dates().json({ normal: true });
  if (dates.length > 0) {
    entities.push(
      ...dates.map(d => ({
        type: 'date',
        text: d.normal || d.text,
        confidence: 0.8
      }))
    );
  }
  
  return entities;
}

/**
 * Extract main topics from text using Compromise
 * @param {Object} doc - Compromise document
 * @returns {Array} Main topics
 */
function extractTopics(doc) {
  // Get topics (nouns and their modifiers)
  const topics = doc.topics().json({ normal: true });
  
  return topics.map(t => ({
    topic: t.normal || t.text,
    count: 1
  }));
}

/**
 * Extract key phrases from text using Compromise
 * @param {Object} doc - Compromise document
 * @returns {Array} Key phrases
 */
function extractPhrases(doc) {
  // Extract noun phrases
  const nounPhrases = doc.match('#Adjective? #Noun+').json({ normal: true });
  
  // Extract verb phrases
  const verbPhrases = doc.match('#Adverb? #Verb #Noun+').json({ normal: true });
  
  // Combine and return unique phrases
  const allPhrases = [
    ...nounPhrases.map(p => ({ type: 'noun_phrase', text: p.normal || p.text })),
    ...verbPhrases.map(p => ({ type: 'verb_phrase', text: p.normal || p.text }))
  ];
  
  // Return only unique phrases (by text)
  const uniquePhrases = Array.from(
    new Map(allPhrases.map(item => [item.text, item])).values()
  );
  
  return uniquePhrases;
}

/**
 * Analyze sentences for structure and mood
 * @param {Object} doc - Compromise document
 * @returns {Array} Sentence analysis
 */
function analyzeSentences(doc) {
  const sentences = doc.sentences().json({ normal: true, terms: true });
  
  return sentences.map(s => {
    // Detect the mood (question, statement, exclamation)
    let mood = 'statement';
    if (s.text.endsWith('?')) {
      mood = 'question';
    } else if (s.text.endsWith('!')) {
      mood = 'exclamation';
    }
    
    // Detect if passive voice
    const hasPassive = nlp(s.text).match('(was|were|been|be) #Verb').found();
    
    // Get the first verb (action)
    const verbs = nlp(s.text).verbs().json({ normal: true });
    const mainAction = verbs.length > 0 ? (verbs[0].normal || verbs[0].text) : null;
    
    return {
      text: s.normal || s.text,
      mood,
      isPassive: hasPassive,
      mainAction,
      length: s.terms ? s.terms.length : s.text.split(' ').length
    };
  });
}

/**
 * Performs sentiment analysis on text using Natural.js
 * @param {string} text - The text to analyze
 * @returns {Object} Sentiment analysis results
 */
function analyzeSentiment(text) {
  // Use natural's sentiment analyzer
  const tokenized = tokenizer.tokenize(text);
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
  
  return {
    score,
    comparative,
    vote
  };
}

/**
 * Extracts important keywords using TF-IDF algorithm
 * @param {string} text - The text content to analyze
 * @returns {Array} List of keywords
 */
function extractKeywordsTfIdf(text) {
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
  
  // Return just the terms
  return terms.map(item => item.term);
}

/**
 * Analyze recurring patterns in multiple dreams
 * @param {Array} dreams - Array of dream contents
 * @returns {Object} Recurring patterns analysis
 */
function analyzeRecurringPatterns(dreams) {
  if (!dreams || dreams.length === 0) {
    return {
      recurringThemes: [],
      recurringSymbols: [],
      recurringEntities: []
    };
  }
  
  // Analyze each dream
  const analyses = dreams.map(dream => analyzeText(dream));
  
  // Collect all keywords, entities, and phrases
  const allKeywords = analyses.flatMap(a => a.keywords);
  const allEntities = analyses.flatMap(a => a.entities.map(e => e.text));
  const allPhrases = analyses.flatMap(a => a.phrases.map(p => p.text));
  
  // Count occurrences
  const keywordCounts = countOccurrences(allKeywords);
  const entityCounts = countOccurrences(allEntities);
  const phraseCounts = countOccurrences(allPhrases);
  
  // Find recurring items (appearing in at least 2 dreams)
  const recurringThemes = Object.entries(keywordCounts)
    .filter(([_, count]) => count >= 2)
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count);
  
  const recurringEntities = Object.entries(entityCounts)
    .filter(([_, count]) => count >= 2)
    .map(([entity, count]) => ({ entity, count }))
    .sort((a, b) => b.count - a.count);
  
  const recurringPhrases = Object.entries(phraseCounts)
    .filter(([_, count]) => count >= 2)
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count);
  
  return {
    recurringThemes,
    recurringEntities,
    recurringPhrases
  };
}

/**
 * Count occurrences of items in an array
 * @param {Array} array - Array of items
 * @returns {Object} Counts of each item
 */
function countOccurrences(array) {
  return array.reduce((counts, item) => {
    counts[item] = (counts[item] || 0) + 1;
    return counts;
  }, {});
}

/**
 * Find dream symbols in text with context
 * @param {string} text - The dream text
 * @param {Object} symbolDictionary - Dictionary of dream symbols
 * @returns {Array} List of symbols found with context
 */
function findDreamSymbols(text, symbolDictionary) {
  if (!text || !symbolDictionary) {
    return [];
  }
  
  const foundSymbols = [];
  const lowercaseText = text.toLowerCase();
  
  // Process with compromise for better symbol detection
  const doc = nlp(text);
  
  // Check for each symbol in the dictionary
  Object.entries(symbolDictionary).forEach(([symbol, meaning]) => {
    // Look for exact matches and variations
    if (lowercaseText.includes(symbol)) {
      // Get the context around the symbol
      const index = lowercaseText.indexOf(symbol);
      const startIndex = Math.max(0, index - 50);
      const endIndex = Math.min(text.length, index + symbol.length + 50);
      
      let context = text.substring(startIndex, endIndex);
      
      // Add ellipsis
      if (startIndex > 0) context = '...' + context;
      if (endIndex < text.length) context += '...';
      
      // Try to get adjectives describing the symbol using compromise
      const adjectivesData = doc.match(`#Adjective+ ${symbol}`).out('array');
      const adjectives = adjectivesData.length > 0 
        ? adjectivesData[0].split(' ').slice(0, -1) 
        : [];
      
      // Try to get verbs associated with the symbol
      const verbsData = doc.match(`${symbol} #Verb+`).out('array');
      const verbs = verbsData.length > 0 
        ? verbsData[0].split(' ').slice(1) 
        : [];
      
      foundSymbols.push({
        symbol,
        meaning,
        context,
        adjectives,
        verbs,
        frequency: countOccurrences(lowercaseText.split(symbol)).length - 1
      });
    }
  });
  
  return foundSymbols;
}

/**
 * Suggest dream categories based on comprehensive analysis
 * @param {Object} analysis - The complete text analysis
 * @param {Array} categories - Available categories to choose from
 * @returns {Array} Suggested categories with confidence scores
 */
function suggestDreamCategories(analysis, categories = [
  'lucid', 'nightmare', 'recurring', 'prophetic', 'healing', 'adventure', 'fantasy', 'uncategorized'
]) {
  if (!analysis) {
    return [{ category: 'uncategorized', confidence: 50 }];
  }
  
  const suggestedCategories = [];
  
  // Check sentiment for nightmares
  if (analysis.sentiment.vote === 'negative' && analysis.sentiment.comparative < -0.15) {
    suggestedCategories.push({
      category: 'nightmare',
      confidence: Math.min(90, Math.abs(analysis.sentiment.comparative) * 300)
    });
  }
  
  // Check for adventure dreams
  const adventureWords = ['adventure', 'journey', 'travel', 'exploring', 'quest', 'discover'];
  const hasAdventureTheme = analysis.keywords.some(keyword => 
    adventureWords.includes(keyword)
  ) || analysis.phrases.some(phrase => 
    adventureWords.some(word => phrase.text.includes(word))
  );
  
  if (hasAdventureTheme) {
    suggestedCategories.push({
      category: 'adventure',
      confidence: 75
    });
  }
  
  // Check for fantasy dreams
  const fantasyWords = ['magic', 'dragon', 'fairy', 'wizard', 'mythical', 'fantasy', 'impossible'];
  const hasFantasyTheme = analysis.keywords.some(keyword => 
    fantasyWords.includes(keyword)
  ) || analysis.phrases.some(phrase => 
    fantasyWords.some(word => phrase.text.includes(word))
  );
  
  if (hasFantasyTheme) {
    suggestedCategories.push({
      category: 'fantasy',
      confidence: 80
    });
  }
  
  // Check for lucid dreams
  const lucidWords = ['aware', 'control', 'lucid', 'conscious', 'realize', 'dreaming'];
  const hasLucidTheme = analysis.keywords.some(keyword => 
    lucidWords.includes(keyword)
  ) || analysis.phrases.some(phrase => 
    phrase.text.includes('I knew') || 
    phrase.text.includes('I realized') || 
    phrase.text.includes('I was dreaming')
  );
  
  if (hasLucidTheme) {
    suggestedCategories.push({
      category: 'lucid',
      confidence: 85
    });
  }
  
  // Default category based on sentiment if no matches
  if (suggestedCategories.length === 0) {
    if (analysis.sentiment.vote === 'positive') {
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
  
  // Sort by confidence and filter to valid categories
  return suggestedCategories
    .filter(cat => categories.includes(cat.category))
    .sort((a, b) => b.confidence - a.confidence);
}

module.exports = {
  analyzeText,
  findDreamSymbols,
  analyzeRecurringPatterns,
  suggestDreamCategories
}; 