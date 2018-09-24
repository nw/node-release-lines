'use strict'

const fs = require('fs')
const path = require('path')
const https = require('https')
const split = require('split2')

const changeLogUrl = 'https://raw.githubusercontent.com/nodejs/node/master/doc/changelogs/CHANGELOG_'

const versions = ['V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10']

versions.forEach(v => {
  loader(`${changeLogUrl}${v}.md`, function (err, result) {
    if (err) console.log('ERROR: ', err)

    let filename = path.resolve(__dirname, `../data/changelogs/${v.toLowerCase()}.json`)
    fs.writeFileSync(filename, JSON.stringify(sanitize(result), null, 2))
  })
})

// removes data that could be added / validated later
function sanitize (result) {
  Object.keys(result).forEach(version => {
    let cl = result[version]

    result[version] = {
      version: cl.version,
      line: cl.line,
      lts: cl.lts,
      date: cl.date,
      releasedBy: cl.releasedBy,
      text: cl.text,
      raw: cl.raw,
      commits: cl.commits.items,
      deprecations: cl.deprecations.items
    }
  })

  return result
}

function loader (changelogUrl, callback) {
  let data = {}
  let current = null
  let context = null
  let headers = ['changes', 'commits', 'deprecations', 'issues']
  let regexs = headers.map(h => new RegExp(h, 'i'))

  https.get(changelogUrl, res => {
    res
      .pipe(split())
      .on('error', callback)
      .on('data', line => {
        // addLine(line)

        if (isHeader(line)) return
        if (isBulletItem(line)) return
        if (ignoreAnchors(line)) return

        addLine(line)
      })
      .on('end', () => {
        cleanup()
        callback(null, data)
      })
  })

  function ignoreAnchors (line) {
    if (line.match(/^<a id=".+?"><\/a>/)) return true
    return false
  }

  function addLine (line) {
    let version = data[current]
    if (!version) return
    if (!context) version.text.push(line)
    else version[context].text.push(line)
    version.raw.push(line)
  }

  function updateState (str) {
    context = str
    return true
  }

  function isBulletItem (line) {
    let match = line.match(/^\s*?(\*|-|\+)\s/)

    if (!match) return false

    normalizeBullet(line, match[0].length)
    return true
  }

  function isHeader (line) {
    let match = line.match(/^#+/)

    if (!match) return false

    let size = match[0].length
    // line = clean(line, size)

    switch (size) {
      case 1: break
      case 2:
        parseReleaseHeader(line, size)
        break
      default:
        normalizeHeader(line, size)
    }
    return true
  }

  function normalizeBullet (line, size) {
    if (!context || !data[current] || !data[current][context]) return // BAD STATE
    data[current].raw.push(line)
    line = clean(line, size)
    data[current][context].items.push((context === 'commits') ? parseCommit(line) : line)
  }

  function normalizeHeader (line, len) {
    if (data[current]) data[current].raw.push(line)
    if (len === 4 && line.match(/semver/i)) return // DEAL WITH THIS LATER

    if (!headers.some((h, i) => {
      if (line.match(regexs[i])) return updateState(h)
      return false
    })) normalizeBullet('* ' + clean(line, len), 2) // hacky Doesn't solve V8 6.0 header
  }

  function cleanup () {
    let version = data[current]
    if (!version) return

    version.raw = linesToString(version.raw)
    version.text = linesToString(version.text).trim()

    headers.forEach(h => {
      version[h].text = linesToString(version[h].text).trim()
    })
  }

  function parseReleaseHeader (line, size) {
    let meta = line.split(',').map(v => v.trim())
    let title = (meta[1] || '').match(/Version ([.0-9]+)( '(.+?)')? \((.+)\)$/)

    if (!title) return normalizeHeader(line, size + 1)

    if (current) cleanup()

    context = null
    current = `v${title[1]}`

    data[current] = {
      version: current,
      line: title[4],
      lts: title[3],
      date: meta[0],
      releasedBy: meta[2],
      text: [],
      raw: [line]
    }

    headers.forEach(h => {
      data[current][h] = { items: [], text: [] }
    })
  }
}

function parseCommit (line, semver) {
  let mdurl = /(\[?\[`?(.+?)`?\]\(.+?\)\]?)/g
  let sha = mdurl.exec(line)
  let pr = (sha) ? mdurl.exec(line) : null
  let splitPoint = line.indexOf(': ')
  semver = semver || 'PATCH'

  let meta = line.substring(sha ? sha[0].length : 0, (splitPoint === -1) ? undefined : splitPoint).trim()
  let desc = line.substring((splitPoint === -1) ? 0 : splitPoint + 2, pr ? pr.index : undefined).trim()
  // line = line.substring(sha ? sha[0].length : 0, pr ? pr.index : undefined)

  let semverCheck = meta.match(/\*\*\(SEMVER-([A-Z]+)\)\*\*/)
  if (semverCheck) {
    semver = semverCheck[1]
    meta = meta.substring(semverCheck[0].length + semverCheck.index)
  }

  let revertCheck = meta.match(/\*\*\*Revert\*\*\*/)
  if (revertCheck) {
    meta = meta.substring(revertCheck[0].length + revertCheck.index)
  }

  let topics = meta.match(/\*\*(.+?)\*\*/)
  if (topics) {
    topics = topics[1].split(',').map(t => t.trim())
  }

  if (!pr) {
    pr = desc.match(/(\[(#[0-9]+?)\])$/)
    if (pr) desc = desc.substring(0, pr.index).trim()
  }

  let author = desc.match(/\(([^()]+?)\)$/)
  if (author) {
    desc = desc.substring(0, author.index).trim()
    author = author[1].trim()
  }

  return {
    sha: (sha) ? sha[2] : null,
    pr: (pr) ? pr[2].replace(/#/g, '') : null,
    author: author,
    topics: topics || [],
    reverts: !!revertCheck,
    desc: desc
    // semver: semver FIXME
  }
}

function linesToString (arr) {
  if (!Array.isArray(arr) || !arr.length) return ''
  return arr.join('\n')
}

function clean (str, len) {
  return str.substring(len).trim()
  // return str.replace(/^#+/, '').trim()
}
