const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Comment = require('./comments')

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const options = { toJSON: { virtuals: true } };

const issueSchema = new Schema({
    title: String,
    description: String,
    identified_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }, //anyuser
    identified_date: Date,
    assigned_to: {
        type: Schema.Types.ObjectId,
        ref: 'User', //dev by PM
    },
    status: {
        type: String,
        enum: ['Unassigned', 'Assigned', 'Resolved'],
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low']
    },
    images: [ImageSchema],
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
    related_project: {
        type: Schema.Types.ObjectId,
        ref: 'Project'
    }
}, options);

issueSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Comment.deleteMany({
            _id: {
                $in: doc.comments
            }
        })
    }
})

// TODO default values and required keywords

module.exports = mongoose.model('Issue', issueSchema);
