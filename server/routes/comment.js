const express = require('express');
const { saveComment, getComments } = require('../controllers/comment');
const auth = require('../middleware/auth'); // Ensure users are authenticated
const router = express.Router();

// POST: Add a new comment
router.post('/:reportId', auth, saveComment);

// GET: Fetch all comments for a report
router.get('/:reportId', auth, getComments);

module.exports = router;
