global.reqlib = require('app-root-path').require
global.appRoot = require('app-root-path')
require('dotenv').config({ path: appRoot + '/.env' })

// Modules
const _ = require('lodash')
const fs = require('fs-extra')
const axios = require('axios')
const async = require('async')
const { TwitterApi } = require('twitter-api-v2')
const os = require('os')
const path = require('path')
const router = require('express').Router()

// Helpers
const db = reqlib('/knex')('redgifs')
const log = reqlib('/helpers/log')
const proxy = reqlib('/helpers/proxy')('curl')
const prettyDate = reqlib('/helpers/prettyDate')
const awaitHandler = reqlib('/helpers/awaitHandler')

const main = async () => {
    try{
        const post = await db('posts').where('isTwitter', false).orderBy('id', 'desc').first()
        const { redgifsId } = post
        
        const { data } = await axios({
            method: 'post',
            url: 'https://jot.cyclic.app/hahaha',
            data: { 
                appKey: 'EHD9c6ZebGxQISVfcOac6Bbvw',
                appSecret: 'coIGhDnMDFeCVSVXAaI5WnJctR4SK7Brzq5BXBoVlGuvVC0VIN',
                accessToken: '1510811050559815681-jUOCSUWrI4PrS4MEYlKKCPIzlVZsYT',
                accessSecret: 'ar7Y8XY0DRhCSMPdPPTBxJUmIvFqBee2broXze2v9BymU',
                redgifsId,
            }
        })

        console.log(data)
    }
    catch(e) { console.log(e) }
    finally{ db.destroy() }
}

main()