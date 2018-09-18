'use strict'

const Release = require('./Release')
const metadata = require('../data/releases.meta.json')

class Releases extends Array {
  constructor (obj) {
    (Array.isArray(obj)) ? super(...obj) : super(obj)
    return this
  }

  getSafe () {
    return new Releases(this.filter(r => r.isSafe))
  }

  static load (version) {
    return new Releases((metadata[version] || []).map(r => new Release(r)))
  }
}

module.exports = Releases
