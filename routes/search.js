//routes/search.js
const express = require('express');
const auth = require('../middleware/auth'); 
const Note = require('../models/Note');
const { getEmbedding, semanticSearch } = require('../utils/aiSearch');
const router = express.Router();

// Protect search routes with auth middleware
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const { query, mode = 'keyword' } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    let notes;
    
    if (mode === 'keyword') {
      // Keyword search using MongoDB text index
      notes = await Note.find(
        { 
          userId: req.user.userId,
          $text: { $search: query } 
        },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } });
    } else {
      // AI-powered semantic search
      notes = await semanticSearch(query, req.user.userId);
    }
    
    res.json(notes);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed. Please try again.' });
  }
});

module.exports = router;