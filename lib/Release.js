'use strict'

const Vulnerability = require('./Vulnerability')
const ChangeLog = require('./ChangeLog')
const metadata = require('../data/releases.meta.json')

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

  get changelog () {
    if (typeof this._changelog !== 'undefined') return this._changelog
    this._changelog = ChangeLog.load(this.version)
    return this._changelog
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

  download (file, type) {
    let dl = `https://nodejs.org/dist/${this.version}/`
    if (!file) return dl
    return dl
  }

  static load (version) {
    let line = version.split('.')[0]
    if (line.indexOf('v') !== 0) {
      line = `v${line}`
      version = `v${version}`
    }

    let data = (metadata[line] || []).filter(v => v.version === version)[0]

    if (!data) return null
    return new Release(data)
  }
}

module.exports = Release
