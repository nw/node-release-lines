#!/usr/bin/env node

var cli = require('commander')

var version = process.version

// Handle EOL before we get into program logic
handleEOLVersions()

var api = require('../')
var release = api.Release.load(version)

handleInvalid(release)

cli
  .version('1.0.0', '-v, --version')
  .usage('[options]')
  .description('CLI tool to check if Node.js is safe. Defaults to checking system version.')
  .option('-c, --ci', 'Returns a non-zero exit code if the version of Node.js is not safe, and a zero exit code if it is safe.')
  .option('-r, --release [release]', 'Checks to see if a specific release of Node.js is safe')
  .parse(process.argv)

if (release.isSafe) {
  if (!cli.ci) {
    console.log('')
    console.log('✅  Node.js ' + version + ' is safe!')
    console.log('')
  }
  process.exit(0)
} else {
  if (cli.release) {
    version = 'v' + cli.release
  }
  if (!cli.ci) {
    var releaseLine = version.split('.')[0]
    var safeReleases = api.Releases.load(releaseLine).getSafe()
    var safe = safeReleases[safeReleases.length - 1]

    handleInvalid(safe)

    console.log('')
    console.log('⚠️  Node.js ' + version + ' is not safe! You should upgrade now.')
    console.log('')
    console.log('👉  Minimum safe Node.js version in the ' + releaseLine + ' release line: ' + safe.version)
    console.log('')
  }
  process.exit(1)
}

function handleInvalid (release) {
  if (!release) {
    console.error('Invalid Version')
    process.exit(1)
  }
}

function handleEOLVersions () {
  var releaseLine = parseInt(version.split('.')[0].replace('v', ''), 10)
  if (isNaN(releaseLine) || releaseLine < 6) {
    console.error('Node.js release line is EOL (End of Life) - please install a supported release line.')
    process.exit(1)
  }
}
