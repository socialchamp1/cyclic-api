// Modules
const _ = require('lodash')
const router = require('express').Router()
const { TwitterApi } = require('twitter-api-v2')

// Home page
router.get('/', (req, res) => res.send(''))

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

module.exports = router