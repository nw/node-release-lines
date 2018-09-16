'use strict'

const metadata = require('../data/releases.meta.json')
const vulns = freeze(require('../data/vulns.core.json'))

class NodeReleaseMeta {
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

  isSafe () {
    if (!this.vulns.length) return true
    return false
  }

  static load (version) {
    return (metadata[version] || []).map(r => {
      return new NodeReleaseMeta(r)
    }).sort((a, b) => {
      return b.date - a.date
    })
  }
}

module.exports = NodeReleaseMeta

function freeze (v) {
  let dict = Object.keys(v).reduce((p, c) => {
    v[c].source = `https://github.com/nodejs/security-wg/tree/master/vuln/core/${c}`
    p[c] = Object.freeze(v[c])
    return p
  }, {})
  return Object.freeze(dict)
}
