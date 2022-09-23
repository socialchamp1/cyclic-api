// Modules
const router = require('express').Router()

// Helpers
const awaitHandler = reqlib('/helpers/awaitHandler')

// Home page
router.get('/', awaitHandler(async(req, res) => {
    res.render('home')
}))

module.exports = router