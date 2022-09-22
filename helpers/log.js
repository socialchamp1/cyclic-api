const chalk = require('chalk')

module.exports = (text, color = 2) => {
    let temp = ''

    if(color == 1) temp = chalk.blue("\n" + text)
    else if(color == 2) temp = chalk.gray(text)
    else if(color == 3) temp = chalk.red(text)
    else if(color == 4) temp = chalk.magenta(text)

    console.log(temp)
}