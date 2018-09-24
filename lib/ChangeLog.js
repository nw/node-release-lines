'use strict'

const Commit = require('./Commit')
const changelogCache = {}

class ChangeLog {
  constructor (data) {
    this.version = data.version
    this.line = data.line
    this.date = data.date
    this.releasedBy = data.releasedBy
    this.text = data.text
    this.raw = data.raw

    this.commits = data.commits.map(c => new Commit(c))
  }

  static load (version) {
    let line = version.split('.')[0]
    let changeData = changelogCache[line]

    if (typeof changeData === 'undefined') {
      try {
        changeData = changelogCache[line] = require(`../data/changelogs/${line}.json`)
      } catch (err) {
        changeData = changelogCache[line] = false
      }
    }
    if (!changeData || !changeData[version]) return null

    return new ChangeLog(changeData[version])
  }
}

module.exports = ChangeLog
