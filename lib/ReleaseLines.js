'use strict'

const https = require('https')
const ReleaseLine = require('./ReleaseLine.js')
const schedule = require('../data/schedule.json')

class ReleaseLines extends Array {
  constructor (obj) {
    (Array.isArray(obj)) ? super(...obj) : super(obj)
    return this
  }

  setDate (date) {
    this.forEach(r => r.setDate(date))
    return this
  }

  get (version) {
    return this.filter(v => v.version === version)[0]
  }

  static load (data, date) {
    if (!data || typeof data === 'string' || data instanceof Date) {
      date = data
      data = schedule
    }
    return new ReleaseLines(
      Object.keys(data)
        .map(k => new ReleaseLine(
          Object.assign({ version: k }, data[k]), date)))
  }

  static fetch (date) {
    let payload = ''
    return new Promise((resolve, reject) => {
      https.get(ReleaseLines.scheduleUrl, res => {
        res
          .on('error', err => reject(err))
          .on('data', d => { payload += d.toString() })
          .on('end', () => {
            try {
              resolve(ReleaseLines.load(JSON.parse(payload), date))
            } catch (e) {
              reject(e)
            }
          })
      })
    })
  }
}

['Supported', 'Current', 'Maintenance', 'Future', 'Active', 'EOL', 'Modern', 'LTS'].forEach(type => {
  ReleaseLines.prototype[`get${type}`] = function () {
    return new ReleaseLines(this.filter(r => r[`is${type}`]))
  }
})

ReleaseLines.scheduleUrl = 'https://raw.githubusercontent.com/nodejs/Release/master/schedule.json'

module.exports = ReleaseLines
