const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const projectSchema = new Schema({
//     title: String,
//     description: String,
//     start_date: Date,
//     target_end_date: Date,
//     actual_end_date: Date,
//     created_on: Date,
//     created_by: {
//         type: Schema.Types.ObjectId,
//         ref: 'Admin'
//     },
//     assigned_to: {
//         type: Schema.Types.ObjectId,
//         ref: 'Project Manager'
//     }, //can be created by admin and looked after by PM

//     modified_on: Date,
//     modified_by: {
//         type: Schema.Types.ObjectId,
//         ref: 'User'
//     },

// });

const projectSchema = new Schema({
    title: String,
    description: String,
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User' //admin 
    },
    assigned_to: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }, //assigned to PM by admin
    related_issues: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Issue'
        }
    ]
});

module.exports = mongoose.model('Project', projectSchema);

// CRUD FOR NEW PROJECT BY ADMIN
