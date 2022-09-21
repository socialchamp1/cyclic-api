const appRoot = require('app-root-path')
const reqlib = require('app-root-path').require
require('dotenv').config({ path: appRoot + '/.env' })

const main = async() => {
    try{
        console.log('Good morning Mike')
    }
    catch(e) { console.log(e) }
}

main()