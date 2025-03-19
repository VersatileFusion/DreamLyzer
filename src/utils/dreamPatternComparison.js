/**
 * Utility functions for comparing dreams and finding patterns between them
 * Used for generating more personalized insights
 */

/**
 * Calculate similarity score between two dreams based on their analysis
 * @param {Object} dream1 - First dream with analysis
 * @param {Object} dream2 - Second dream with analysis
 * @returns {Object} Similarity scores for different aspects
 */
function calculateDreamSimilarity(dream1, dream2) {
  // Initialize similarity object
  const similarity = {
    overall: 0,
    emotional: 0,
    symbolic: 0,
    thematic: 0,
    sentiment: 0
  };
  
  // Emotional similarity (based on primary emotion)
  if (dream1.emotions?.primary && dream2.emotions?.primary) {
    similarity.emotional = dream1.emotions.primary === dream2.emotions.primary ? 1 : 0;
  }
  
  // Symbolic similarity (calculate overlap in symbols)
  const symbols1 = dream1.symbols?.map(s => s.symbol) || [];
  const symbols2 = dream2.symbols?.map(s => s.symbol) || [];
  
  if (symbols1.length > 0 && symbols2.length > 0) {
    const commonSymbols = symbols1.filter(symbol => symbols2.includes(symbol));
    similarity.symbolic = commonSymbols.length / Math.max(symbols1.length, symbols2.length);
  }
  
  // Thematic similarity (calculate overlap in keywords)
  const keywords1 = dream1.keywords || [];
  const keywords2 = dream2.keywords || [];
  
  if (keywords1.length > 0 && keywords2.length > 0) {
    const commonKeywords = keywords1.filter(keyword => keywords2.includes(keyword));
    similarity.thematic = commonKeywords.length / Math.max(keywords1.length, keywords2.length);
  }
  
  // Sentiment similarity
  if (dream1.sentiment?.score !== undefined && dream2.sentiment?.score !== undefined) {
    const sentimentDiff = Math.abs(dream1.sentiment.score - dream2.sentiment.score);
    similarity.sentiment = 1 - (sentimentDiff / 2); // Range 0-2 -> 1-0
  }
  
  // Calculate overall similarity as weighted average
  similarity.overall = (
    (similarity.emotional * 0.3) + 
    (similarity.symbolic * 0.3) + 
    (similarity.thematic * 0.3) + 
    (similarity.sentiment * 0.1)
  );
  
  return similarity;
}

/**
 * Find related dreams based on similarity
 * @param {Object} targetDream - The dream to find relations for
 * @param {Array} dreamHistory - Array of past dreams
 * @param {Number} similarityThreshold - Minimum similarity score to consider related (0-1)
 * @returns {Array} Related dreams sorted by similarity
 */
function findRelatedDreams(targetDream, dreamHistory, similarityThreshold = 0.4) {
  // Calculate similarity for each dream in history
  const similarities = dreamHistory.map(dream => {
    const similarity = calculateDreamSimilarity(targetDream, dream);
    return {
      dreamId: dream._id,
      title: dream.title,
      date: dream.date,
      similarity
    };
  });
  
  // Filter by threshold and sort by overall similarity (descending)
  return similarities
    .filter(item => item.similarity.overall >= similarityThreshold)
    .sort((a, b) => b.similarity.overall - a.similarity.overall);
}

/**
 * Extract evolving patterns from dream sequence
 * @param {Object} currentDream - Current dream
 * @param {Array} dreamHistory - Historical dreams in chronological order
 * @returns {Object} Evolving patterns analysis
 */
function findEvolvingPatterns(currentDream, dreamHistory) {
  // Skip if not enough dreams for meaningful analysis
  if (dreamHistory.length < 3) {
    return {
      hasEvolvingPatterns: false,
      insights: ["Not enough dream history to identify evolving patterns."]
    };
  }
  
  // Group dreams by month for temporal analysis
  const dreamsByMonth = {};
  
  // Add current dream to this analysis
  const allDreams = [...dreamHistory, currentDream];
  
  allDreams.forEach(dream => {
    const date = new Date(dream.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth()+1}`;
    
    if (!dreamsByMonth[monthKey]) {
      dreamsByMonth[monthKey] = [];
    }
    
    dreamsByMonth[monthKey].push(dream);
  });
  
  // Sort month keys chronologically
  const sortedMonths = Object.keys(dreamsByMonth).sort();
  
  // Analyze emotions over time
  const emotionTrends = analyzeTrends(sortedMonths, dreamsByMonth, 'emotions.primary');
  
  // Analyze sentiment over time
  const sentimentTrends = analyzeTrends(sortedMonths, dreamsByMonth, 'sentiment.score');
  
  // Generate insights based on trends
  const insights = [];
  
  if (emotionTrends.hasEvolution) {
    insights.push(`Your dreams show an emotional shift from predominantly ${emotionTrends.startValue} to ${emotionTrends.endValue} over time.`);
  }
  
  if (sentimentTrends.hasEvolution) {
    const direction = sentimentTrends.direction === 'increasing' ? 'more positive' : 'more negative';
    insights.push(`The emotional tone of your dreams has become ${direction} over the recorded period.`);
  }
  
  return {
    hasEvolvingPatterns: insights.length > 0,
    insights: insights.length > 0 ? insights : ["No clear evolving patterns detected in your dream history."],
    emotionTrends,
    sentimentTrends
  };
}

/**
 * Analyze trends in dream content over time
 * @param {Array} sortedMonths - Array of month keys in chronological order
 * @param {Object} dreamsByMonth - Dreams grouped by month
 * @param {String} propertyPath - Property to analyze (dot notation)
 * @returns {Object} Trend analysis
 */
function analyzeTrends(sortedMonths, dreamsByMonth, propertyPath) {
  // Get property from dream using dot notation
  const getProperty = (dream, path) => {
    return path.split('.').reduce((obj, key) => obj && obj[key] !== undefined ? obj[key] : null, dream);
  };
  
  // Calculate monthly averages for numeric properties
  // or most frequent value for categorical properties
  const monthlyValues = sortedMonths.map(month => {
    const dreams = dreamsByMonth[month];
    const values = dreams.map(dream => getProperty(dream, propertyPath)).filter(val => val !== null);
    
    if (values.length === 0) return null;
    
    // Handle numeric values (like sentiment scores)
    if (typeof values[0] === 'number') {
      const sum = values.reduce((acc, val) => acc + val, 0);
      return sum / values.length;
    }
    // Handle categorical values (like emotions)
    else {
      const valueCounts = {};
      values.forEach(val => {
        valueCounts[val] = (valueCounts[val] || 0) + 1;
      });
      
      let mostFrequent = null;
      let highestCount = 0;
      
      Object.entries(valueCounts).forEach(([val, count]) => {
        if (count > highestCount) {
          mostFrequent = val;
          highestCount = count;
        }
      });
      
      return mostFrequent;
    }
  }).filter(val => val !== null);
  
  // Need at least 3 points for a meaningful trend
  if (monthlyValues.length < 3) {
    return {
      hasEvolution: false,
      trend: 'insufficient data'
    };
  }
  
  // For numeric values, detect increasing or decreasing trends
  if (typeof monthlyValues[0] === 'number') {
    // Simple linear trend detection
    let increasing = 0;
    let decreasing = 0;
    
    for (let i = 1; i < monthlyValues.length; i++) {
      if (monthlyValues[i] > monthlyValues[i-1]) increasing++;
      else if (monthlyValues[i] < monthlyValues[i-1]) decreasing++;
    }
    
    const direction = increasing > decreasing ? 'increasing' : 
                       decreasing > increasing ? 'decreasing' : 'stable';
    
    return {
      hasEvolution: direction !== 'stable',
      trend: direction,
      direction,
      startValue: monthlyValues[0],
      endValue: monthlyValues[monthlyValues.length - 1],
      values: monthlyValues
    };
  }
  // For categorical values, detect changes in the most frequent value
  else {
    const startValue = monthlyValues[0];
    const endValue = monthlyValues[monthlyValues.length - 1];
    const hasChanged = startValue !== endValue;
    
    return {
      hasEvolution: hasChanged,
      trend: hasChanged ? 'changing' : 'stable',
      startValue,
      endValue,
      values: monthlyValues
    };
  }
}

module.exports = {
  calculateDreamSimilarity,
  findRelatedDreams,
  findEvolvingPatterns
}; 