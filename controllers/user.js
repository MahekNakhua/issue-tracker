const User = require('../models/user');
const Issue = require('../models/issuesTemp');

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password, role } = req.body;
        const user = new User({ email, username, role });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Signed up successfully!');
            res.redirect('/issues');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    const redirectUrl = req.session.returnTo || '/home';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout();
    res.redirect('/home');
}

module.exports.personalProfile = async (req, res) => {
    //TODO optimize the query
    const issues = await Issue.find({}).populate('identified_by').populate({ path: 'comments', populate: { path: 'author' } });
    let issueCount = 0;
    let commentCount = 0;
    for (i of issues) {
        if (i.identified_by.username === req.user.username) {
            issueCount++
        }
        if (i.comments && i.comments.length > 0) {
            for (let k = 0; k < i.comments.length; k++) {
                if (i.comments[k].author.username === req.user.username) {
                    commentCount++;
                }
            }
        }
    }

    res.render('users/profile', { issueCount, commentCount });
}

module.exports.contactUs = (req,res)=>{
    res.render('users/contactUs')
}