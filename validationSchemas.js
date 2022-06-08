const Joi = require('joi')

module.exports.issueSchema = Joi.object({
    issue: Joi.object({
        title: Joi.string().min(3).max(50).required(),
        description: Joi.string().required(),
        priority: Joi.string().valid(...['High', 'Medium', 'Low']).required(),
        status: Joi.string().valid(...['Unassigned', 'Assigned', 'Resolved']).required(),
        images: Joi.string().required(),   //url sorta?!
        identified_by: Joi.string().required(),
        identified_date: Joi.date().required(),
        assigned_to: Joi.string(), //chnage to ref later
    }).required()
});