const express = require('express');
const router = express.Router({ mergeParams: true });
const Issue = require('../models/issuesTemp');
const Comment = require('../models/comments');
const { isLoggedIn, isCommentAuthor } = require('../middleware')
const ExpressError = require('../utils/ExpressError')
const wrapAsync = require('../utils/WrapAsync');
const commentController = require('../controllers/comments');

router.post('/', isLoggedIn, wrapAsync(commentController.addComment))

router.delete('/:commentId', isLoggedIn, isCommentAuthor, wrapAsync(commentController.deleteComment))

module.exports = router;