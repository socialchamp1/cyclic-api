const chalk = require('chalk')
const { createLogger, format, transports } = require('winston')
const { printf, combine, errors } = format

module.exports = (path) => {
    return (text, color = 2) => {
        if(color == 1) text = "\n" + text

        const fileFormat = printf(({ message }) => message)

        const consoleFormat = printf(({ message }) => {
            let temp = ''

            if(color == 1) temp = chalk.blue.underline(message)
            else if(color == 2) temp = chalk.gray(message)
            else if(color == 3) temp = chalk.red(message)
            else if(color == 4) temp = chalk.magenta(text)

            return temp
        })

        const logger = createLogger({
            transports: [
                new transports.Console({
                    format: consoleFormat
                }),
                new transports.File({ 
                    filename: path, 
                    json: false,
                    format: combine(fileFormat, errors({ stack: true }))
                }),
            ],
        })

        logger.log({ level: 'info', message: text })
    }
}