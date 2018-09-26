#!/usr/bin/env node

var path = require('path')
var version = process.version
var isCI = false

parseArgs()
handleEOLVersions()

var api = require('../')
var release = api.Release.load(version)

handleInvalid(release)
output()

function parseArgs () {
  var ciIdx = process.argv.indexOf('--ci')

  if (ciIdx !== -1) {
    process.argv.splice(ciIdx, 1)
    isCI = true
  }

  var userVersion = process.argv.pop()
  if (!userVersion.match(path.basename(__filename))) {
    version = userVersion
  }
}

function handleEOLVersions () {
  var releaseLine = parseInt(version.split('.')[0].replace('v', ''), 10)
  if (isNaN(releaseLine) || releaseLine < 6) {
    console.error('Version is EOL (End of Life) - please install a supported version')
    process.exit(1)
  }
}

function output () {
  if (release.isSafe) {
    if (!isCI) console.log('✅  Node.js ' + version + ' is safe!')
    process.exit(0)
  } else {
    if (!isCI) {
      var releaseLine = version.split('.')[0]
      var safeReleases = api.Releases.load(releaseLine).getSafe()
      var safe = safeReleases[safeReleases.length - 1]

      handleInvalid(safe)

      console.log('⚠️  Node.js ' + version + ' is not safe! ' +
        'You should upgrade now.\n\n👉  Minimum safe Node.js version in the ' +
        releaseLine + ' release line: ' + safe.version)
    }
    process.exit(1)
  }
}

function handleInvalid (release) {
  if (!release) {
    console.error('Invalid Version')
    process.exit(1)
  }
}
