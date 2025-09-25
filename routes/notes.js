//routes/notes.js
const express = require('express');
const auth = require('../middleware/auth'); // Correct path
const Note = require('../models/Note');
const router = express.Router();

// Apply auth middleware to all note routes
router.use(auth);

// Get all notes for authenticated user
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.userId }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create note
router.post('/', async (req, res) => {
  try {
    const note = new Note({ 
      ...req.body, 
      userId: req.user.userId 
    });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update note
router.put('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { 
        ...req.body, 
        updatedAt: Date.now() 
      },
      { new: true, runValidators: true }
    );
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;