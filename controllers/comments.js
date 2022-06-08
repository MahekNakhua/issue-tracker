const Issue = require('../models/issuesTemp');
const Comment = require('../models/comments');

module.exports.addComment = async (req, res) => {
    const issue = await Issue.findById(req.params.id);
    const comment = new Comment(req.body.comment);
    comment.author = req.user._id;
    issue.comments.push(comment);
    await comment.save();
    await issue.save();
    // req.flash('success', 'Added a new comment!');
    res.redirect(`/issues/${issue._id}`);
}

module.exports.deleteComment = async (req, res) => {
    const { id, commentId } = req.params;
    await Issue.findByIdAndUpdate(id, { $pull: { comments: commentId } });
    await Comment.findByIdAndDelete(commentId);
    // req.flash('success', 'Successfully deleted comment')
    res.redirect(`/issues/${id}`);
}