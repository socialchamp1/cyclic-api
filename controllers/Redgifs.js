const appRoot = require('app-root-path')
const reqlib = require('app-root-path').require

// Modules
const _ = require('lodash')
const fs = require('fs-extra')
const axios = require('axios')
const async = require('async')
const router = require('express').Router()

// Globals
const dirTags = appRoot + '/public/json/tags.json'

// Helpers
const delay = reqlib('/helpers/delay')

router.post('/upload', async(req, res) => {
    let datas = { error: false }

    try{
        const { post, access_token } = req.body
        
        if(!post) {
            datas.error = true
            datas.errorMsg = 'post can not empty!'
            return res.json(datas)
        }

        if(!access_token) {
            datas.error = true
            datas.errorMsg = 'access_token can not empty!'
            return res.json(datas)
        }

        await initAxios(access_token)
        await main(post)

        datas.post = post
    }
    catch(e) {
        datas.error = true
        datas.errorMsg = e.message
    }
    finally{
        res.json(datas)
    }
})

router.post('/token', async(req, res) => {
    let datas = { error: false }

    try{
        const { access_token, refresh_token } = req.body

        if(!access_token) {
            datas.error = true
            datas.errorMsg = 'access_token can not empty!'
            return res.json(datas)
        }

        if(!refresh_token) {
            datas.error = true
            datas.errorMsg = 'refresh_token can not empty!'
            return res.json(datas)
        }

        const token = await generateToken(access_token, refresh_token)
        datas.token = token
    }
    catch(e) {
        datas.error = true
        datas.errorMsg = e.message
    }
    finally{
        res.json(datas)
    }
})

// Set default authorization header
const initAxios = async(access_token) => {
    try{
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + access_token
    }
    catch(e) { console.console.log(e.stack) }
}

// Check if access token is expired
const checkTokenExpired = async(access_token) => {
    try{
        await axios('https://api.redgifs.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${access_token}` 
            }
        })

        return false
    }
    catch(e) { 
        // console.log('error', e.response.status) 
        // console.log(e.response.data)
        return true
    }
}

// Generate new access token
const generateToken = async(access_token, refresh_token) => {
    try{
        // Check if access token is already expired
        const isExpired = await checkTokenExpired(access_token)

        if(isExpired) {
            // Expired. Generate new token
            console.log(`- token already expired`)
            console.log(`- generating new access token`)

            const { data } = await axios({
                method: 'post',
                url: 'https://api.redgifs.com/v2/oauth/refresh',
                data: {
                    refresh_token: refresh_token
                }
            })
            
            return { valid: false, newToken: data }
        }
        else {
            console.log(`- token still valid`)
            return { valid: true }
        }
    }
    catch(e) { 
        if(e && e.isAxiosError) {
            console.log(e.response.data) 
        }
        else {
            console.log(e) 
        }
    }
}

// Issue an upload ticket
const getTicket = async(post) => {
    if(!post) return

    try{
        const { data } = await axios({
            method: 'post',
            url: 'https://api.redgifs.com/v2/upload',
            data: {
                url: post.redditVideoUrl
            }
        })

        console.log(`- ticket: ${data.id}`)
        post.ticket = data.id

        return post
    }
    catch(e) { console.log(e.stack) }
}

// Wait 1 minutes before uploading to redgifs
// We are waiting for ticket is ready, 1 minute is enough
const waitTicket = async(post) => {
    if(!post) return

    try{
        console.log(`- waiting for 15s before uploading, please wait ...`)
        await delay(15 * 1000)
        
        return post
    }
    catch(e) { console.log(e.stack) }
}

// Upload video to my redgifs
const upload = async(post) => {
    if(!post) return

    try{
        const { ticket } = post
        console.log(`- starting upload`)

        // Get tag list
        const tags = await fs.readJson(dirTags)

        // Tags must include this
        const mandatoryTags = ['Asian', 'JAV', 'Japanese', 'Sex', 'NSFW', 'Nude']

        // Randomly pick 15 tags
        const randomTags = _.chain(tags)
            .map('name')
            .filter(v => !_.includes(mandatoryTags, v))
            .shuffle()
            .slice(0, (10 - mandatoryTags.length))
            .value()
        
        // Concat tags
        const finalTags = [...mandatoryTags, ...randomTags]

        const { data } = await axios({
            method: 'post',
            url: 'https://api.redgifs.com/v2/gifs/submit',
            data: {
                ticket: ticket,
                private: false,
                keepAudio: true,
                cut: { start: 0, duration: 60 },
                tags: finalTags
            }
        })

        const redgifsUrl = 'https://redgifs.com/watch/' + data.id
        console.log(`- upload success: ${redgifsUrl}`)

        post.redgifsUrl = redgifsUrl
        return post
    }
    catch(e) { console.log(e.stack) }
}

const main = async(post) => {
    try{
        await async.waterfall([
            async() => post,
            getTicket,
            waitTicket,
            upload
        ])
    }
    catch(e) { throw Error(e) }
}

module.exports = router