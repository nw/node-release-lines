#!/usr/bin/env node

var cli = require('commander')

cli
  .version('1.0.0', '-v, --version')
  .usage('[options]')
  .description('CLI tool to understand Node.js release lines lifespans.')
  .option('-c, --current', 'Returns all "Current" versions of Node.js.')
  .option('-l, --lts', 'Returns all presently supported "LTS" versions of Node.js – regardless of whether or not they are presently active "LTS".')
  .option('-a, --active', 'Returns all active "LTS" Node.js release lines.')
  .option('-m, --maintenance', 'Returns all presently supported "Maintenance" versions of Node.js.')
  .option('-s, --supported', 'Returns all presently supported Node.js version')
  .parse(process.argv)

var api = require('../')
var releases = api.ReleaseLines.load()
let v = process.version.split('.')

var releasesType = [releases.get(v[0])]

if (cli.current) {
  releasesType = releases.getCurrent()
} else if (cli.lts) {
  releasesType = releases.getLTS()
} else if (cli.active) {
  releasesType = releases.getActive()
} else if (cli.maintenance) {
  releasesType = releases.getMaintenance()
} else if (cli.supported) {
  releasesType = releases.getSupported()
} else if (cli.modern) {
  releasesType = releases.getModern()
}
releasesType.forEach(release => {
  var icon
  if (release.isCurrent) {
    icon = '✅'
  } else if (release.isActive) {
    icon = '🆗'
  } else if (release.isMaintenance) {
    icon = '⚠️'
  } else if (release.isEOL) {
    icon = '☠️'
  }

  var stats = release.getStats()

  console.log(icon + '  Node.js ' + release.version + ' Timeline')
  console.log('      - Node.js ' + release.version + ' will be EOL in ' + stats.days.until.eol + ' days.')
  console.log('      - Node.js ' + release.version + ' is ' + stats.percent.total + '% through its total lifespan.')
  console.log('')
  console.log('   ℹ️  Release Line Information')
  if (release.isCurrent) {
    console.log('      - Node.js ' + release.version + ' is under active development!')
  } else if (release.isActive) {
    console.log('      - Node.js ' + release.version + ' is in the LTS phase of its lifecycle.')
  } else if (release.isMaintenance) {
    console.log('      - Node.js ' + release.version + ' is currently in Maintenance mode, and will only recieve security patches and bug fixes.')
  } else if (release.isEOL) {
    console.log('      - Node.js ' + release.version + ' is in the End of Life (EOL) stage of its lifecycle, meaning it will recieve no further updates, fixes, or patches.')
  }
  console.log('')
  console.log('   📊  Release Line Metadata')
  console.log('      - There are a total of ' + release.releases.length + ' releases in the Node.js ' + release.version + ' release line.')
  console.log('      - There are currently ' + release.releases.getSafe().length + ' releases in the Node.js ' + release.version + ' that have zero known vulnerabilities.')
  console.log('      - The latest release in the ' + release.version + ' release line is ' + release.releases[0].version)
  console.log('')
})
