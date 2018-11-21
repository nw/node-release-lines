'use strict'

const url = require('url')

function addHeaders (urlStr) {
  let urlObj = new url.URL(urlStr)
  return {
    protocol: urlObj.protocol,
    hostname: urlObj.hostname,
    port: 443,
    method: 'GET',
    path: `${urlObj.pathname}${urlObj.search}`,
    headers: { 'User-Agent': 'NodeReleaseAPI' }
  }
}

module.exports = addHeaders
