const express = require('express')
const router = express.Router()
const wrapAsync = require('../utils/WrapAsync');
const Joi = require('joi');
const { isLoggedIn, hasAccess } = require('../middleware');
const issueController = require('../controllers/issues');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


// const validateIssue = (req, res, next) => {
//     const issueSchema = Joi.object({
//         issue: Joi.object({
//             title: Joi.string().min(3).max(50).required(),
//             description: Joi.string().required(),
//             priority: Joi.string().valid(...['High', 'Medium', 'Low']).required(),
//             status: Joi.string().valid(...['Unassigned', 'Assigned', 'Resolved']).required(),
//             images: Joi.string().required(),   //url sorta?!
//             identified_by: Joi.string(),
//             identified_date: Joi.date(),
//             assigned_to: Joi.string(), //chnage to ref later
//         }).required()

//     })

//     const issue = new Issue(req.body);
//     const { error } = issueSchema.validate(issue);
//     if (error) {
//         const msg = error.details.map(ele => ele.message).join(',')
//         throw new ExpressError(msg, 400)
//     } else {
//         next()
//     }

// }


router.get('/', wrapAsync(issueController.issuesIndex))


router.get('/new', isLoggedIn, issueController.renderNewForm)
router.post('/', isLoggedIn, upload.array('imgs'), wrapAsync(issueController.createIssue))


router.get('/:id', wrapAsync(issueController.displayIssue))


//TODO define edit access and all
router.get('/:id/edit', isLoggedIn, hasAccess, wrapAsync(issueController.renderEditForm))
router.put('/:id', isLoggedIn, hasAccess, upload.array('imgs'), wrapAsync(issueController.editIssue))


router.delete('/:id', isLoggedIn, hasAccess, wrapAsync(issueController.deleteIssue))


module.exports = router;