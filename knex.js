const appRoot = require('app-root-path')
const reqlib = require('app-root-path').require
require('dotenv').config({ path: appRoot + '/.env' })

// Middleware
const log = reqlib('/helpers/log')

// Global
const { DB_USER, DB_PASS } = process.env

const main = (dbname, dbport) => {
    let config = {
        debug: false,
        client: 'mysql2',
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'migrations',
            directory: __dirname + '/database/migrations',
        },
        seeds: {
            directory: __dirname + '/database/seeds'
        },
    }

    const connection = {
        port: 3306,
        host: '127.0.0.1',
        database: dbname,
        user: DB_USER,
        password: DB_PASS,
    }

    config.connection = connection
    log(`Connected to database ${dbname} on port ${dbport}`, 4)

    return require('knex')(config)
}

module.exports = main