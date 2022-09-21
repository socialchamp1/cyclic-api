const moment = require('moment')

module.exports = (date = null, format = 1, currentFormat='') => {
    // date = null = today
    let temp = date ? moment(date, currentFormat) : moment()

    if(format === 1) return temp.format('MMM Do YYYY, h:mm A')
    if(format === 2) return temp.format('MMM Do YYYY')
    if(format === 3) return temp.format('YYYY-MM-DD HH:mm:ss')  // mysql
    if(format === 5) return temp.format('MMM D, YYYY')
}