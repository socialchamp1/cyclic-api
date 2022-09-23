// Modules
const _ = require('lodash')
const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const download = require('download')
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
router.post('/twitter/video', awaitHandler(async(req, res) => {
    const { appKey, appSecret, accessToken, accessSecret, redgifsId } = req.body
    const datas = { error: false }

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
    const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'twitter'))

    // Download video to local tmp folder
    const ext = vidUrl ? vidUrl.split('.').pop() : 'mp4'
    const filename = getRandomInt(10, 10000) + '.' + ext
    const filepath = folder + '/' + filename
    const options = { filename }

    await download(vidUrl, folder, options)

    // Upload video to twitter
    const mediaId = await client.v1.uploadMedia(filepath)
    datas.mediaId = mediaId

    res.json(datas)
}))

module.exports = router