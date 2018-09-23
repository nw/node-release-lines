'use strict'

const fs = require('fs')
const url = require('url')
const path = require('path')
const https = require('https')
const semver = require('semver')
const { ReleaseLines } = require('../')

let releaseDataUrl = 'https://nodejs.org/download/release/index.json'
let vulnsUrl = addHeaders('https://api.github.com/repos/nodejs/security-wg/git/trees/master?recursive=1')
let vulnItemUrl = 'https://raw.githubusercontent.com/nodejs/security-wg/master'

let loader = async () => {
  // get schedule data
  let schedule = await fetch(ReleaseLines.scheduleUrl)
  // save schedule.json
  fs.writeFileSync(path.resolve(__dirname, '../data/schedule.json'), JSON.stringify(schedule, null, 2))

  // filter for only modern release lines that have started
  // TODO this is for fetching CHANGELOGS
  // let modern = ReleaseLines.load(schedule)
  //   .getModern()
  //   .filter(v => !v.notStarted)
  //   .map(v => v.version)

  // release details, group by release lines
  let releases = (await fetch(releaseDataUrl)).reduce((p, c) => {
    let version = c.version.match(/(v\d+)\./)[1]
    if (version === 'v0') return p // filter out old release lines
    if (!p[version]) p[version] = []
    p[version].push(c)
    return p
  }, {})

  // SECURITY DATA
  // get a list of the vuln files for core
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

  // save vulns.core.json
  fs.writeFileSync(path.resolve(__dirname, '../data/vulns.core.json'), JSON.stringify(vulns, null, 2))

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

  // save releases.meta.json
  fs.writeFileSync(path.resolve(__dirname, '../data/releases.meta.json'), JSON.stringify(releases, null, 2))
}

loader()

function fetch (url) {
  let payload = ''
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      res
        .on('error', err => reject(err))
        .on('data', d => { payload += d.toString() })
        .on('end', () => {
          try {
            resolve(JSON.parse(payload))
          } catch (e) {
            reject(e)
          }
        })
    })
  })
}

function addHeaders (urlStr) {
  let urlObj = new url.URL(urlStr)
  return {
    protocol: urlObj.protocol,
    hostname: urlObj.hostname,
    port: 443,
    method: 'GET',
    path: `${urlObj.pathname}${urlObj.search}`,
    headers: { 'User-Agent': 'NodeReleaseAPI' }
  }
}
