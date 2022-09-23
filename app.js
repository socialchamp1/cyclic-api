global.reqlib = require('app-root-path').require
global.appRoot = require('app-root-path')
require('dotenv').config({ path: appRoot + '/.env' })

const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

// Express
app.set('view engine', 'pug')
app.set('json spaces', 2)
app.use(express.urlencoded({ limit: '5mb', extended: true }))
app.use(express.json({ limit: '5mb' }))
app.use(express.static('public'))

// Routes
app.use('/', reqlib('/controllers/Page'))
app.use('/shortporn', reqlib('/controllers/ShortPorn'))

// 404
app.all("*", (req, res, next) => res.status(404).render("404", { meta: { title: 'Page Not Found' } }))

// Error
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.render("error", { meta: { title: 'Bad Request' } })
})

app.listen(PORT, () => { console.log(`Example app listening at http://localhost:${PORT}`) })