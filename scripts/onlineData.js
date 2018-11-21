'use strict'

const path = require('path')
const semver = require('semver')
const { ReleaseLines } = require('..')
const addHeaders = require('./addHeaders.js')
const fetch = require('./fetch.js')

let releaseDataUrl = 'https://nodejs.org/download/release/index.json'
let vulnsUrl = addHeaders('https://api.github.com/repos/nodejs/security-wg/git/trees/master?recursive=1')
let vulnItemUrl = 'https://raw.githubusercontent.com/nodejs/security-wg/master'

let online = async () => {
  // get schedule data
  let schedule = await fetch(ReleaseLines.scheduleUrl)

  let releases = (await fetch(releaseDataUrl)).reduce((p, c) => {
    let version = c.version.match(/(v\d+)\./)[1]
    if (version === 'v0') return p // filter out old release lines
    if (!p[version]) p[version] = []
    p[version].push(c)
    return p
  }, {})

  let securityTree = await fetch(vulnsUrl)

  if (securityTree.trucated) throw new Error('Truncated Security Vulnerability Data')

  let promises = securityTree
    .tree
    .filter(obj => {
      if (obj.type === 'blob' && obj.path.indexOf('vuln/core') === 0) return true // filtering
      return false
    })
    .map(async function (v) {
      let data = await fetch(addHeaders(`${vulnItemUrl}/${v.path}`)) // get each vuln
      data.id = path.basename(v.path, '.json') // add an id
      return data
    })

  let vulns = (await Promise.all(promises)) // resolve promises
    .sort((a, b) => {
      return parseInt(a.id) - parseInt(b.id) // help preserve order
    })
    .reduce((p, c) => { // use id to build dict
      p[c.id] = c
      return p
    }, {})

  // merge vulns into release details
  Object.keys(releases).forEach(releaseLine => {
    releases[releaseLine].forEach(r => {
      r.vulns = []
      Object.keys(vulns).forEach(id => {
        if (semver.satisfies(r.version, vulns[id].vulnerable) && !semver.satisfies(r.version, vulns[id].patched)) {
          r.vulns.push(id)
        }
      })
    })
  })

  let data = {
    schedule: JSON.stringify(schedule, null, 2),
    vulns: JSON.stringify(vulns, null, 2),
    releases: JSON.stringify(releases, null, 2)
  }
  return data
}

module.exports = online
