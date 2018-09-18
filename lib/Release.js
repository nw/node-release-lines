'use strict'

const metadata = require('../data/releases.meta.json')
const vulns = freeze(require('../data/vulns.core.json'))

class Release {
  constructor (publication) {
    this.version = publication.version
    this.date = new Date(publication.date)
    this.modules = parseInt(publication.modules)

    ;['npm', 'v8', 'uv', 'zlib', 'openssl'].forEach(k => {
      this[k] = publication[k]
    })

    this.vulns = publication.vulns.map(v => {
      return vulns[v]
    })
  }

  get isSafe () {
    if (!this.vulns.length) return true
    return false
  }
}

module.exports = Release

function freeze (v) {
  let dict = Object.keys(v).reduce((p, c) => {
    v[c].source = `https://github.com/nodejs/security-wg/tree/master/vuln/core/${c}.json`
    p[c] = Object.freeze(v[c])
    return p
  }, {})
  return Object.freeze(dict)
}
