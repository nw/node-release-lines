'use strict'

const https = require('https')
const NodeRelease = require('./NodeRelease.js')

class NodeReleaseGroup extends Array {
  constructor (obj) {
    (Array.isArray(obj)) ? super(...obj) : super(obj)
    return this
  }

  update (date) {
    this.forEach(r => r.update(date))
    return this
  }

  get (version) {
    return this.filter(v => v.version === version)[0]
  }

  static load (data, date) {
    return new NodeReleaseGroup(
      Object.keys(data)
        .map(k => new NodeRelease(
          Object.assign({ version: k }, data[k]), date)))
  }

  static fetch (date) {
    let payload = ''
    return new Promise((resolve, reject) => {
      https.get(NodeReleaseGroup.scheduleUrl, res => {
        res
          .on('error', err => reject(err))
          .on('data', d => { payload += d.toString() })
          .on('end', () => {
            try {
              resolve(NodeReleaseGroup.load(JSON.parse(payload), date))
            } catch (e) {
              reject(e)
            }
          })
      })
    })
  }
}

['Supported', 'Current', 'Maintenance', 'Future', 'Active', 'EOL', 'Modern', 'LTS'].forEach(type => {
  NodeReleaseGroup.prototype[`get${type}`] = function () {
    return new NodeReleaseGroup(this.filter(r => r[`is${type}`]))
  }
})

NodeReleaseGroup.scheduleUrl = 'https://raw.githubusercontent.com/nodejs/Release/master/schedule.json'

module.exports = NodeReleaseGroup
