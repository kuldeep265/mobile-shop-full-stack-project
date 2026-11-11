const express = require('express');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/chat/rooms
// @desc    Get chat rooms (for admin)
// @access  Private/Admin
router.get('/rooms', protect, admin, async (req, res) => {
  try {
    // In a real app, you'd store chat rooms in database
    // For now, return a simple response since we removed the circular dependency
    const rooms = []; // This would be fetched from database in production
    
    res.json({ success: true, rooms, message: 'Chat rooms endpoint (socket.io handled separately)' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Chat functionality is handled via Socket.io in server.js
// This route is just for admin to see active rooms

module.exports = router;

