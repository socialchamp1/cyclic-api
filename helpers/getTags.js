const _ = require('lodash')
const fs = require('fs-extra')
const appRoot = require('app-root-path')

module.exports = async() => {
    try{
        const dirTags = appRoot + '/public/json/tags.json'
        const tags = await fs.readJson(dirTags)

        // Randomly pick 15 tags
        const tagString = _.chain(tags)
        .map('twitter')
        .shuffle()
        .slice(0, 15)
        .map(v => '#' + v.replace(/-/g, ''))
        .join(' ')
        .value()

        return tagString
    }
    catch(e) { console.log(e) }
}