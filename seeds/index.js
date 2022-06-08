const mongoose = require('mongoose');
const { titles, descriptors, statuses, priorities, seededImages } = require('./seedHelpers');
const Issue = require('../models/issuesTemp')
const Project = require('../models/project');
const project = require('../models/project');

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/issueTrackerTemp';


mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


const imageCollector = () => {
    const n = Math.floor(Math.random() * 5);
    const arr = [];
    for (var i = 0; i <= n; i++) {
        arr.push(seededImages[Math.floor(Math.random() * seededImages.length)])
    }
    return arr;
}


const seedDB = async () => {
    await Issue.deleteMany({});

    for (let i = 0; i < 20; i++) {
        const random1 = Math.floor(Math.random() * titles.length);
        const random2 = Math.floor(Math.random() * descriptors.length);
        // const random3 = Math.floor(Math.random() * statuses.length);
        const random4 = Math.floor(Math.random() * priorities.length)
        const newIssue = new Issue({
            title: titles[random1],
            description: descriptors[random2],
            // assigned_to: mongoose.Types.ObjectId('629f20c73f4cae4cecaf54bd'),
            identified_by: mongoose.Types.ObjectId('62a059ac0f692c7338c969dd'),
            status: 'Unassigned',
            // status: 'Assigned',
            priority: priorities[random4],
            images: imageCollector(),
            related_project: mongoose.Types.ObjectId('629f21113f4cae4cecaf54bf'),
        })
        await newIssue.save();
    }

    // const proj = await Project.findById(mongoose.Types.ObjectId('629f21113f4cae4cecaf54bf'));
    const proj = await Project.findById(mongoose.Types.ObjectId('62a0593a0f692c7338c969dc'));

    const allIssues = await Issue.find({}).populate('related_project');
    for (issue of allIssues) {
        proj.related_issues.push(issue._id)
    }
    await proj.save();

    console.log("Seeded The Database");
}

seedDB().then(() => {
    mongoose.connection.close();
})