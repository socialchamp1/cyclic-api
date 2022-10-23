// Modules
const os = require('os')
const path = require('path')
const router = require('express').Router()
const { TwitterApi } = require('twitter-api-v2')

// Helpers
const dlRedgif = reqlib('/helpers/dlRedgif')

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

// Download reddit video to local folder
router.post('/reddit/download', async(req, res) => {
    let datas = { error: false }

    try{
        const { redgifsId, redditVideoUrl } = req.body

        if(!redgifsId) {
            datas.error = true
            datas.errorMsg = 'redgifsId can not empty!'
            return res.json(datas)
        }

        if(!redditVideoUrl) {
            datas.error = true
            datas.errorMsg = 'redditVideoUrl can not empty!'
            return res.json(datas)
        }
    
        // Download video to local tmp folder
        const ext = 'mp4'
        const folder = path.join(os.tmpdir())
        const filename = redgifsId + '.' + ext
        const filepath = folder + '/' + filename
    
        await dlRedgif({ filepath, redditVideoUrl })
        datas.filepath = filepath
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