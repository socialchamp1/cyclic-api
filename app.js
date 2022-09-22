const appRoot = require('app-root-path')
const reqlib = require('app-root-path').require
require('dotenv').config({ path: appRoot + '/.env' })

// Bot
const twitter = reqlib('/apps/twitter')

// Vars
const db = reqlib('/knex')('shortporns')

// Twitter @JapanOnTop
const japan = {
    db,
    subreddits: [
        'JAVUncensored',
        'NSFW_Japan', 
        'javdreams', 
        'ilovejav', 
        'JapaneseKissing', 
        'JAVboratory', 
        'PetiteJAV'
    ],
    twitter: {
        appKey: 'EHD9c6ZebGxQISVfcOac6Bbvw',
        appSecret: 'coIGhDnMDFeCVSVXAaI5WnJctR4SK7Brzq5BXBoVlGuvVC0VIN',
        accessToken: '1510811050559815681-jUOCSUWrI4PrS4MEYlKKCPIzlVZsYT',
        accessSecret: 'ar7Y8XY0DRhCSMPdPPTBxJUmIvFqBee2broXze2v9BymU',
    }
}

const main = async() => {
    try{
        await twitter(japan)
    }
    catch(e) { console.log(e) }
}

main()