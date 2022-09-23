// Modules
const _ = require('lodash')
const fs = require('fs-extra')
const axios = require('axios')
const async = require('async')
const { TwitterApi } = require('twitter-api-v2')
const router = require('express').Router()

// Helpers
const log = reqlib('/helpers/log')
const proxy = reqlib('/helpers/proxy')('curl')
const prettyDate = reqlib('/helpers/prettyDate')
const awaitHandler = reqlib('/helpers/awaitHandler')

// Vars
let subreddits
let twitterCredentials
const db = reqlib('/knex')('redgifs')

// Config
axios.defaults.headers.common['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'

/* 
    Per tanggal 23 September 2022, untuk download dari, udah ga bisa lgsg lagi. Di setiap URL nya udah ditambahin signature sama redgifs nya.
    Signature = user agent + IP

    Arti nya, link video yg di generate oleh API, cuman bisa dibuka di IP dan Browser yang sama.
*/
const dlRedgif = async(vidUrl, folder, options) => {
    const { filename } = options
    const filepath = folder + filename

    return new Promise((resolve, reject) =>
        axios({
            method: 'GET',
            url: vidUrl,
            responseType: 'stream',
        })
        .then(response => {
            const w = response.data.pipe(fs.createWriteStream(filepath))
            w.on('finish', () => resolve())
        })
        .catch(e => reject(e))
    )
}

// Ambil video yang mau di post ke twitter
const getVideo = async() => {
    log(`getVideo`, 1)
    
    return null

    try{
        const { data } = await axios({
            method: 'post',
            url: 'https://api.investasi-indo.com/shortporns',
            data: { subreddits }
        })

        const { id, title } = data
        log(`- ${id}: ${title}`)

        return data
    }
    catch(e) { throw Error(e) }
}

// Download redgifs video to local folder
const downloadVideo = async(post) => {
    log(`downloadVideo`, 1)

    try{
        const { redgifsId } = post

        // Get redgifs video data
        const url = 'https://api.redgifs.com/v2/gifs/' + redgifsId
        const { data: redgifsData } = await axios(url)

        const vidUrl = redgifsData.gif.urls.hd
        const picUrl = redgifsData.gif.urls.poster
        post.redgifs = redgifsData

        log(`- ${vidUrl}`)

        // Empty tmp folder
        const folder = appRoot + '/tmp'
        await fs.emptyDir(folder)

        // Download video to local tmp folder
        const ext = 'mp4'
        const filename = redgifsId + '.' + ext
        const filepath = folder + filename
        const options = { filename }

        await dlRedgif(vidUrl, folder, options)

        post.filepath = filepath
        return post
    }
    catch(e) { throw Error(e) }
}

router.get('/', async(req, res) => {
    let error = false
    let errorMsg = ''
    let datas = { error, errorMsg }

    const files = await fs.readdir('./')
    console.log(appRoot)
    return res.json(appRoot)

    // @japanontops
    const config = {
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

    twitterCredentials = config.twitter
    subreddits = config.subreddits.map(v => v.toLowerCase())

    try{
        const result = await async.waterfall([
            getVideo,
            // downloadVideo
            // getMediaIds,
            // tweet,
            // updateDatabase
        ])

        datas.result = result
    }
    catch(e) {
        datas.error = true
        datas.errorMsg = e.message

        console.log(e)
    }
    finally{
        res.json(datas)
    }
})

module.exports = router