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

    this._vulnIds = Array.from(publication.vulns)
  }

  get vulns () {
    if (!this._vulns) this._vulns = this._vulnIds.map(v => { return new Vulnerability(v) })
    return this._vulns
  }

  download (file, type) {
    let dl = `https://nodejs.org/dist/${this.version}/`
    if (!file) return dl
    return dl
  }

  get docs () {
    return `https://nodejs.org/dist/${this.version}/docs/`
  }

  get isVulnerable () {
    return !!this._vulnIds.length
  }

  get isSafe () {
    return !this._vulnIds.length
  }
}

module.exports = Release
