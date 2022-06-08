if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/WrapAsync');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const flash = require('connect-flash');
const issueRoutes = require('./routes/issues');
const userRoutes = require('./routes/user');
const commentRoutes = require('./routes/comments');
const projectRoutes = require('./routes/projects');

const User = require('./models/user');
const Issue = require('./models/issuesTemp');
const Project = require('./models/project');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/issueTrackerTemp';
const secret = process.env.SESSIONSECRET || 'insertasecret!';
const port = process.env.PORT || 3000;

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});





app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
// app.use(express.static(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    if (!['/login', '/'].includes(req.originalUrl)) {
        req.session.returnToUrl = req.originalUrl;
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})





app.use('/', userRoutes);
app.use('/issues', issueRoutes)
app.use('/issues/:id/comments', commentRoutes)
app.use('/projects', projectRoutes)


app.get('/home', async (req, res) => {
    let projectCount = 0;
    let issueCount = 0;
    let commentCount = 0;
    let userA = 0;
    let userPM = 0;
    let userD = 0;
    let userS = 0;
    let priorityHigh = 0;
    let priorityMedium = 0;
    let priorityLow = 0;
    let statusUnassigned = 0;
    let statusAssigned = 0;
    let statusResolved = 0;

    const projects = await Project.find({});
    projectCount = projects.length

    const issues = await Issue.find({}).populate('identified_by').populate({ path: 'comments', populate: { path: 'author' } });
    issueCount = issues.length
    for (i of issues) {
        commentCount += i.comments.length
        if (i.status === 'Unassigned') statusUnassigned++;
        else if (i.status === 'Assigned') statusAssigned++;
        else statusResolved++;

        if (i.priority === 'High') priorityHigh++
        else if (i.priority === 'Medium') priorityMedium++
        else priorityLow++
    }

    const users = await User.find({});
    userCount = users.length
    for (u of users) {
        if (u.role === 'Admin') userA++
        else if (u.role === 'Project Manager') userPM++
        else if (u.role === 'Developer') userD++
        else userS++
    }

    const stats = {
        projectCount,
        issueCount,
        userCount,
        commentCount,
        userA,
        userPM,
        userD,
        userS,
        priorityHigh,
        priorityMedium,
        priorityLow,
        statusUnassigned,
        statusAssigned,
        statusResolved,
    }
    res.render('home', { stats, issues, projects });
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found :(', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oops, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})





app.listen(port, () => {
    console.log('app is listening on port ${port}!'.toUpperCase())
})



