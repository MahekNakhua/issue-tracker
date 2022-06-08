const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


// const userSchema = new Schema({
//     username: String,
//     email: {
//         type: String,
//     },
//     issues: [{
//         type: Schema.Types.ObjectId,
//         ref: 'IssueTemp'
//     }]
// });

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ['Admin', 'Project Manager', 'Developer', 'Submitter']
    }
});
userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', userSchema);
