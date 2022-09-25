global.reqlib = require('app-root-path').require
global.appRoot = require('app-root-path')
require('dotenv').config({ path: appRoot + '/.env' })

const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

// Express
app.set('json spaces', 2)
app.use(express.urlencoded({ limit: '5mb', extended: true }))
app.use(express.json({ limit: '5mb' }))
app.use(express.static('public'))

// Routes
app.use('/', reqlib('/controllers/Page'))
app.use('/redgifs', reqlib('/controllers/Redgifs'))

app.listen(PORT, () => { console.log(`Example app listening at http://localhost:${PORT}`) })