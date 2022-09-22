const appRoot = require('app-root-path')
const reqlib = require('app-root-path').require
require('dotenv').config({ path: appRoot + '/.env' })

// Modules
const _ = require('lodash')
const fs = require('fs-extra')
const axios = require('axios')
const async = require('async')
const download = require('download')
const { TwitterApi } = require('twitter-api-v2')

// Helpers
const log = reqlib('/helpers/log')
const proxy = reqlib('/helpers/proxy')('curl')
const prettyDate = reqlib('/helpers/prettyDate')

// Vars
let db
let subreddits
let twitterCredentials

// Ambil video yang mau di post ke twitter
const getVideo = async() => {
    log(`getVideo`)

    try{
        const { data } = await axios({
            method: 'post',
            url: 'http://investasi.api/shortporns',
            data: { subreddits }
        })

        const { id, title } = data
        log(`- ${id}: ${title}`)

        return data
    }
    catch(e) { console.log(e) }
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

        log(`- ${vidUrl}`)

        // Empty tmp folder
        const folder = appRoot + '/tmp/twitter/'
        await fs.emptyDir(folder)

        // Download video to local tmp folder
        const ext = vidUrl ? vidUrl.split('.').pop() : 'mp4'
        const filename = redgifsId + '.' + ext
        const filepath = folder + filename
        const options = { filename }

        await download(vidUrl, folder, options)

        // Upload video to twitter
        // const mediaId = await client.v1.uploadMedia(filepath)
        // post.mediaId = mediaId

        return post
    }
    catch(e) { log(e.stack) }
}

// Upload video to twitter
const getMediaIds = async(post) => {
    if(!post) return
    log(`- uploading video to twitter`)

    try{
        const { redgifsVideoUrl } = post
        
        const { data } = await axios({
            method: 'post',
            url: 'https://japan-on-top.herokuapp.com/twitter/video',
            data: { 
                ...twitterCredentials,
                vidUrl: redgifsVideoUrl,
            }
        })

        const { error, errorMsg, mediaId } = data
       
        if(error) {
            log(`- error: ${errorMsg}`)
            return
        }
        else {
            log(`- mediaId: ${mediaId}`)

            post.mediaId = mediaId
            return post
        }
    }
    catch(e) { 
        console.log(e)
        updateDatabase(post).then(r => { return null })
    }
}

// Make a twitter post
const tweet = async(post) => {
    if(!post || !post.mediaId) return

    const client = new TwitterApi(twitterCredentials)

    try{
        const { mediaId } = post

        // Get tag list
        const dirTags = appRoot + '/public/json/tags.json'
        const tags = await fs.readJson(dirTags)

        // Randomly pick 15 tags
        const message = _.chain(tags)
            .map('twitter')
            .shuffle()
            .slice(0, 15)
            .map(v => '#' + v)
            .join(' ')
            .value()

        // Tweet
        await client.v1.tweet(message, { media_ids: mediaId })
        log(`- tweet successfully sent`)

        return post
    }
    catch(e) { console.log(e) }
}

// Update database
const updateDatabase = async(post) => {
    if(!post) return

    try{
        const { id } = post
        await db('posts').where('id', id).update({ isTwitter: true })

        log(`- database updated`)
        return post
    }
    catch(e) { console.log(e) }
}

const main = async(config) => {
    log('SHORTPORNS', 1)
    log(prettyDate())

    try{
        db = config.db
        twitterCredentials = config.twitter
        subreddits = config.subreddits.map(v => v.toLowerCase())

        await async.waterfall([
            getVideo,
            downloadVideo
            // getMediaIds,
            // tweet,
            // updateDatabase
        ])
    }
    catch(e) { console.log(e) }
}

module.exports = main