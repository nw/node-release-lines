'use strict'

const Vulnerability = require('./Vulnerability')

class Release {
  constructor (publication) {
    this.version = publication.version
    this.date = new Date(publication.date)
    this.modules = parseInt(publication.modules)

    ;['npm', 'v8', 'uv', 'zlib', 'openssl'].forEach(k => {
      this[k] = publication[k]
    })

    this.vulns = publication.vulns.map(v => {
      return new Vulnerability(v)
    })
  }

  download (file, type) {
    let dl = `https://nodejs.org/dist/${this.version}/`
    if (!file) return dl
    return dl
  }

  get docs () {
    return `https://nodejs.org/dist/${this.version}/docs/`
  }

  get isSafe () {
    if (!this.vulns.length) return true
    return false
  }
}

module.exports = Release
