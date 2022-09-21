const appRoot = require('app-root-path')
const reqlib = require('app-root-path').require
require('dotenv').config({ path: appRoot + '/.env' })

// Modules
const _ = require('lodash')
const fs = require('fs-extra')
const axios = require('axios')
const async = require('async')

// Middleware
const log = reqlib('/helpers/log')(dirLog)
const prettyDate = reqlib('/helpers/prettyDate')


const main = async() => {
    try{
        console.log('Good morning Mike')
    }
    catch(e) { console.log(e) }
}

main()