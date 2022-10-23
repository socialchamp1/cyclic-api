const fs = require('fs-extra')
const axios = require('axios')

module.exports = async(options) => {
    const { filepath, vidUrl } = options

    console.log({vidUrl})

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