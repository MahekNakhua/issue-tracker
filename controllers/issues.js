const Issue = require('../models/issuesTemp');
const User = require('../models/user');
const Project = require('../models/project');
const { cloudinary } = require("../cloudinary");
let identifiedByUser;

module.exports.issuesIndex = async (req, res) => {
    const { statusFilter, priorityFilter } = req.query;
    if (statusFilter && priorityFilter) {
        const issues = await Issue.find({ priority: priorityFilter, status: statusFilter });
        res.render('issues/index', { issues, filter: `Issues with ${priorityFilter} Priority and ${statusFilter} Status`.toUpperCase() })
    }
    else if (priorityFilter) {
        const issues = await Issue.find({ priority: priorityFilter });
        res.render('issues/index', { issues, filter: `Issues with ${priorityFilter} Priority`.toUpperCase() })
    } else if (statusFilter) {
        const issues = await Issue.find({ status: statusFilter });
        res.render('issues/index', { issues, filter: `Issues with Status - ${statusFilter}`.toUpperCase() })
    }
    else {
        const issues = await Issue.find({});
        res.render('issues/index', { issues, filter: 'All Issues'.toUpperCase() })
    }
}

module.exports.renderNewForm = (req, res) => {
    res.render('issues/newForm');
}

module.exports.createIssue = async (req, res) => {
    const issue = new Issue(req.body.issue)
    issue.status = 'Unassigned'; //default
    issue.identified_by = req.user._id;
    issue.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    const projTitle = req.body.relatedProj;
    const project = await Project.findOne({ title: projTitle });
    if (!project) {
        req.flash('error', "Invalid Project Title")
        return res.redirect('/issues/new')
    }
    project.related_issues.push(issue._id);
    issue.related_project = project._id;
    // console.log(project, issue)
    await issue.save();
    await project.save();
    req.flash('success', "Successfully added an issue")
    res.redirect(`/issues/${issue._id}`)
}

module.exports.displayIssue = async (req, res, next) => {
    const issue = await Issue.findById(req.params.id).populate('assigned_to').populate('identified_by').populate({ path: 'comments', populate: { path: 'author' } });
    if (!issue) {
        req.flash('error', 'Issue not found!');
        return res.redirect('/issues');
    }
    res.render('issues/display', { issue });
}

module.exports.renderEditForm = async (req, res) => {
    const issue = await Issue.findById(req.params.id).populate('assigned_to').populate('identified_by');
    if (!issue) {
        req.flash('error', 'Issue not found!');
        return res.redirect('/issues');
    }
    res.render('issues/editForm', { issue });
}

//set user access
module.exports.editIssue = async (req, res) => {
    const { id } = req.params;
    const username = req.body.tempUsername;
    const assignedUser = await User.findOne({ username: username });
    let currentIssue = { ...req.body.issue };

    if (assignedUser && currentIssue.status !== 'Unassigned' && assignedUser.role === 'Developer') {
        currentIssue.assigned_to = assignedUser._id;
    } else if (assignedUser && currentIssue.status !== 'Unassigned') {
        req.flash('error', "Update Failed : Can assign an Issue only to a Developer")
        return res.redirect(`/issues/${id}`)
    }

    if (currentIssue.status === 'Unassigned' && username === '') {
        currentIssue.assigned_to = null;
    }
    else if (currentIssue.status === 'Unassigned') {
        req.flash('error', "Update Failed : Cannot assign an Issue to User for Status --> Unassigned")
        return res.redirect(`/issues/${id}`)
    } else if ((currentIssue.status === 'Resolved' || currentIssue.status === 'Assigned') && username === '') {
        req.flash('error', "Update Failed : Assigned To field cannot be empty for Status --> Assigned, Resolved")
        return res.redirect(`/issues/${id}`)
    }

    if (currentIssue.status !== 'Unassigned' && !assignedUser) {
        req.flash('error', "Update Failed : Invalid User")
        return res.redirect(`/issues/${id}`)
    }
    const issue = await Issue.findByIdAndUpdate(id, { ...currentIssue }, { runValidators: true, new: true }).populate('assigned_to').populate('identified_by');
    const issueImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
    issue.images.push(...issueImages);
    await issue.save()

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await issue.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        // console.log(issue);
    }

    // req.flash('success', "Successfully updated the issue")
    res.redirect(`/issues/${issue._id}`)

}

module.exports.deleteIssue = async (req, res) => {
    const { id } = req.params;
    const issue = await Issue.findById(id).populate('related_project');
    const projId = issue.related_project
    if (issue.images) {
        for (let img of issue.images) {
            await cloudinary.uploader.destroy(img.filename);
        }
    }
    await Project.findByIdAndUpdate(projId, { $pull: { related_issues: id } });
    await Issue.findByIdAndDelete(id);
    req.flash('success', "Successfully deleted the issue")
    res.redirect('/issues');
}
