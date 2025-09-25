//utils/aiSearch.js
const axios = require('axios');
const Note = require('../models/Note');

// Get embedding from OpenAI
async function getEmbedding(text) {
  try {
    const response = await axios.post('https://api.openai.com/v1/embeddings', {
      input: text,
      model: 'text-embedding-ada-002'
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.data[0].embedding;
  } catch (error) {
    console.error('Error getting embedding:', error.response?.data || error.message);
    throw new Error('Failed to get embedding from AI service');
  }
}

// Calculate cosine similarity
function cosineSimilarity(a, b) {
  if (!a || !b || a.length === 0 || b.length === 0) {
    return 0;
  }
  
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  
  return dotProduct / (magnitudeA * magnitudeB);
}

// Semantic search implementation
async function semanticSearch(query, userId) {
  try {
    const queryEmbedding = await getEmbedding(query);
    const notes = await Note.find({ userId });
    
    // Calculate similarity for each note that has embeddings
    const notesWithSimilarity = notes.map(note => {
      if (!note.embedding || note.embedding.length === 0) {
        return { ...note.toObject(), similarity: 0 };
      }
      
      const similarity = cosineSimilarity(queryEmbedding, note.embedding);
      return { ...note.toObject(), similarity };
    });
    
    // Sort by similarity score (descending)
    return notesWithSimilarity.sort((a, b) => b.similarity - a.similarity);
  } catch (error) {
    console.error('Semantic search error:', error);
    throw error;
  }
}

// Function to generate and save embedding for a note (call this when creating/updating notes)
async function generateNoteEmbedding(note) {
  try {
    const textToEmbed = `${note.title} ${note.content}`;
    const embedding = await getEmbedding(textToEmbed);
    return embedding;
  } catch (error) {
    console.error('Error generating embedding for note:', error);
    return null;
  }
}

module.exports = { 
  getEmbedding, 
  semanticSearch, 
  generateNoteEmbedding,
  cosineSimilarity 
};