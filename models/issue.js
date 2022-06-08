const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const issueSchema = new Schema({
    title: String,
    description: String,
    identified_by: {
        type: Schema.Types.ObjectId,
        ref: 'Submitter'
    },
    identified_date: Date,
    related_project: {
        type: Schema.Types.ObjectId,
        ref: 'Project'
    },
    assigned_to: {
        type: Schema.Types.ObjectId,
        ref: 'Developer'
    },
    status: {
        type: String,
        enum: ['Unassigned', 'Assigned', 'Resolved'],
        // default: 
    },
    priority: {
        type: Schema.Types.ObjectId,
        enum: ['High', 'Medium', 'Low']
    },
    target_resolution_date: Date,
    actual_resolution_date: Date,
    // progress : some sort of comments maybe?!

    created_on: Date,
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'Submitter' //PM creates the issue?
    },
    modified_on: Date,
    modified_by: {
        type: Schema.Types.ObjectId,
        ref: 'Developer'
    },
});


// TODO default values and required keywords

module.exports = mongoose.model('Issue', issueSchema);

// CRUD FOR NEW ISSUE BY SUBMITTER
