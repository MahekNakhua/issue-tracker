const express = require('express')
const router = express.Router()
const wrapAsync = require('../utils/WrapAsync');
const { isLoggedIn, hasAccess, isAdmin, isPM, hasProjectAccess } = require('../middleware');
const projController = require('../controllers/projects');


router.get('/', wrapAsync(projController.projectsIndex))

router.get('/new', isLoggedIn, isAdmin, projController.renderNewForm)
router.post('/', isLoggedIn, isAdmin, wrapAsync(projController.createProject))

router.get('/:id', wrapAsync(projController.displayProject))

router.get('/:id/edit', isLoggedIn, hasProjectAccess, wrapAsync(projController.renderEditForm))
router.put('/:id', isLoggedIn, hasProjectAccess, wrapAsync(projController.editProject))
//right now any PM can access, it needs to be project specific

router.delete('/:id', isLoggedIn, isAdmin, hasAccess, wrapAsync(projController.deleteProject))


module.exports = router;