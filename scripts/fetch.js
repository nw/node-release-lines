'use strict'

const https = require('https')

function fetch (url) {
  let payload = ''
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      res
        .on('error', err => reject(err))
        .on('data', d => { payload += d.toString() })
        .on('end', () => {
          try {
            resolve(JSON.parse(payload))
          } catch (e) {
            reject(e)
          }
        })
    })
  })
}

module.exports = fetch
