const heroku = 'https://japan-on-top.herokuapp.com'

module.exports = (type) => {
    const proxy = {
        html: 'https://proxy.vallesty.com/proxy-html.php',
        curl: 'https://proxy.vallesty.com/proxy-curl.php',
        headers: 'https://proxy.vallesty.com/get-headers.php?url=',
        img: 'https://proxy.vallesty.com/proxy-img2.php?url='
    }

    return proxy[type]
}