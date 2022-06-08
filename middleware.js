const Issue = require('./models/issuesTemp');
const Comment = require('./models/comments');

module.exports.isLoggedIn = (req, res, next) => {
    // console.log("REQ.USER = ", req.user);
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be logged in!');
        return res.redirect('/login');
    }
    next();
}

module.exports.notAlreadyLoggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    req.flash('success', 'You are already logged in!');
    const redirectUrl = req.session.returnToUrl || '/issues';
    delete req.session.returnToUrl;
    res.redirect(redirectUrl);
}

//Admin, Project Manager, Developer Allowed
module.exports.hasAccess = async (req, res, next) => {
    const { id } = req.params;
    const issue = await Issue.findById(id);
    if (req.user.role === 'Submitter') {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/issues/${id}`);
    }
    next();
}

//Only Admin Allowed
module.exports.isAdmin = async (req, res, next) => {
    const { id } = req.params;
    if (req.user.role !== 'Admin') {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/projects`);
    }
    next();
}

//Only Project Manager Allowed
module.exports.isPM = async (req, res, next) => {
    const { id } = req.params;
    if (req.user.role !== 'Project Manager') {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/projects`);
    }
    next();
}

//Admin, Project Manager Allowed
module.exports.hasProjectAccess = async (req, res, next) => {
    const { id } = req.params;
    if (req.user.role !== 'Project Manager' && req.user.role !== 'Admin') {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/projects`);
    }
    next();
}


module.exports.isCommentAuthor = async (req, res, next) => {
    const { id, commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (!comment.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/issues/${id}`);
    }
    next();
}