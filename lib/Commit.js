'use strict'

class Commit {
  constructor (data) {
    ['sha', 'pr', 'author', 'reverts', 'desc'].forEach(key => {
      this[key] = data[key]
    })
    this.topics = Array.from(data.topics)
  }

  get shaUrl () {
    return `https://github.com/nodejs/node/commit/${this.sha}`
  }

  get prUrl () {
    return `https://github.com/nodejs/node/pull/${this.pr}`
  }
}

module.exports = Commit
