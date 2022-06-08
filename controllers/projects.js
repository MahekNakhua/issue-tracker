const Project = require('../models/project');
const Issue = require('../models/issuesTemp')
const User = require('../models/user');
const { cloudinary } = require("../cloudinary");
const mongoose = require('mongoose');
let createdByUser;

module.exports.projectsIndex = async (req, res) => {
    const projects = await Project.find({});
    res.render('projects/index', { projects })
    // res.send(projects);
}


module.exports.renderNewForm = (req, res) => {
    res.render('projects/newForm');
}


module.exports.createProject = async (req, res) => {
    const project = new Project(req.body.project)
    createdByUser = req.user;
    project.created_by = createdByUser._id;
    const username = req.body.tempUsername;
    const assignedUser = await User.findOne({ username: username });
    if (assignedUser.role !== 'Project Manager') {
        req.flash('error', "Project Creation Failed : Cannot assign to User who is not a Project Manager")
        return res.redirect(`/projects`)
    }
    project.assigned_to = assignedUser._id;
    await project.save();
    req.flash('success', "Successfully added an project")
    res.redirect(`/projects/${project._id}`)
}


module.exports.displayProject = async (req, res, next) => {
    const project = await Project.findById(req.params.id).populate('assigned_to').populate('created_by').populate('related_issues');
    if (!project) {
        req.flash('error', 'Project not found!');
        return res.redirect('/projects');
    }
    res.render('projects/display', { project });
}


module.exports.renderEditForm = async (req, res) => {
    const project = await Project.findById(req.params.id).populate('assigned_to').populate('identified_by').populate('related_issues');
    if (!project) {
        req.flash('error', 'Project not found!');
        return res.redirect('/projects');
    }
    res.render('projects/editForm', { project });
}


module.exports.editProject = async (req, res) => {
    const { id } = req.params;
    const username = req.body.tempUsername;
    let currentProject;
    const assignedUser = await User.findOne({ username: username });
    const tempProj = await Project.findById(id).populate('assigned_to');
    if (req.user.role === 'Admin') {
        if (!assignedUser) {
            req.flash('error', "Update Failed : Invalid User")
            return res.redirect(`/projects/${id}`)
        } else if (assignedUser.role !== 'Project Manager') {
            req.flash('error', "Update Failed : Cannot assign Project to User who is not a Project Manager")
            return res.redirect(`/projects/${id}`)
        }
        currentProject = { ...req.body.project };
        currentProject.assigned_to = assignedUser._id;
    } else if (req.user.username === tempProj.assigned_to.username) {
        currentProject = { ...req.body.project };
    } else {
        req.flash('error', "Update Rejected : This project has not been assigned to you!")
        return res.redirect(`/projects/${id}`)
    }
    //admin can update and change assigned user
    //only assigned user can update but cannot change assignment

    const project = await Project.findByIdAndUpdate(id, { ...currentProject }, { runValidators: true, new: true }).populate('assigned_to').populate('created_by');

    res.redirect(`/projects/${project._id}`)
}
//link to issues


module.exports.deleteProject = async (req, res) => {
    const { id } = req.params;
    const project = await Project.findById(id);
    for (issue of project.related_issues) {
        const currentIssue = await Issue.findById(issue._id);
        if (currentIssue.images) {
            for (let img of currentIssue.images) {
                await cloudinary.uploader.destroy(img.filename);
            }
        }
        await Issue.findByIdAndDelete(issue._id);
    }
    await Project.findByIdAndDelete(id);
    req.flash('success', "Successfully deleted the project")
    res.redirect('/projects');
}
