// Modules
const _ = require('lodash')
const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const axios = require('axios')
const router = require('express').Router()
const { TwitterApi } = require('twitter-api-v2')

// Helpers
const awaitHandler = reqlib('/helpers/awaitHandler')
const getRandomInt = reqlib('/helpers/getRandomInt')

// Home page
router.get('/', awaitHandler(async(req, res) => {
    res.render('home')
}))

// Upload video to twitter
router.post('/twitter/video', async(req, res) => {
    let datas = { error: false }

    try{
        const { appKey, appSecret, accessToken, accessSecret, redgifsId } = req.body

        if(!redgifsId) {
            datas.error = true
            datas.errorMsg = 'redgifsId can not empty!'
            return res.json(datas)
        }
    
        if(!appKey || !appSecret || !accessToken || !accessSecret) {
            datas.error = true
            datas.errorMsg = 'missing twitter parameters!'
            return res.json(datas)
        }
    
        // Get redgifs video data
        const url = 'https://api.redgifs.com/v2/gifs/' + redgifsId
        const { data: redgifsData } = await axios(url)
    
        const vidUrl = redgifsData.gif.urls.hd
        datas.redgifs = redgifsData
    
        const client = new TwitterApi({ appKey, appSecret, accessToken, accessSecret })
        const folder = path.join(os.tmpdir())
    
        // Download video to local tmp folder
        const ext = 'mp4'
        const filename = redgifsId + '.' + ext
        const filepath = folder + '/' + filename
        const options = { filename, filepath }
    
        await dlRedgif(vidUrl, folder, options)

        data.filepath = filepath
    
        // Upload video to twitter
        // const mediaId = await client.v1.uploadMedia(filepath)
        // datas.mediaId = mediaId
    }
    catch(e) {
        datas.error = true
        datas.errorMsg = e.message
    }
    finally{
        res.json(datas)
    }
})

const dlRedgif = async(vidUrl, folder, options) => {
    const { filepath } = options

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

module.exports = router