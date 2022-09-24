// Modules
const _ = require('lodash')
const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const axios = require('axios')
const router = require('express').Router()
const { TwitterApi } = require('twitter-api-v2')

// Home page
router.get('/', (req, res) => res.send(''))

// Download redgifs video to local folder
router.post('/redgifs/download', async(req, res) => {
    let datas = { error: false }

    try{
        const { redgifsId } = req.body

        if(!redgifsId) {
            datas.error = true
            datas.errorMsg = 'redgifsId can not empty!'
            return res.json(datas)
        }
    
        // Get redgifs video data
        const url = 'https://api.redgifs.com/v2/gifs/' + redgifsId
        const { data: redgifsData } = await axios(url)
    
        const vidUrl = redgifsData.gif.urls.hd
        datas.redgifs = redgifsData
    
        // Download video to local tmp folder
        const ext = 'mp4'
        const folder = path.join(os.tmpdir())
        const filename = redgifsId + '.' + ext
        const filepath = folder + '/' + filename
    
        await dlRedgif({ filepath, vidUrl })
        datas.filepath = filepath
    }
    catch(e) {
        datas.error = true
        datas.errorMsg = e.message
    }
    finally{
        res.json(datas)
    }
})

// Upload video to twitter
router.post('/twitter/upload', async(req, res) => {
    let datas = { error: false }

    try{
        const { appKey, appSecret, accessToken, accessSecret, filepath } = req.body

        if(!appKey || !appSecret || !accessToken || !accessSecret) {
            datas.error = true
            datas.errorMsg = 'missing twitter parameters!'
            return res.json(datas)
        }
    
        const client = new TwitterApi({ appKey, appSecret, accessToken, accessSecret })
        const mediaId = await client.v1.uploadMedia(filepath)
        datas.mediaId = mediaId
    }
    catch(e) {
        datas.error = true
        datas.errorMsg = e.message
    }
    finally{
        res.json(datas)
    }
})

const dlRedgif = async(options) => {
    const { filepath, vidUrl } = options

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