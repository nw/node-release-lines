const { ReleaseLines } = require('../')

const releases = ReleaseLines.load('2018-09-15') // state of release lines at a point in time

if (releases.getLTS().length === 4 && // LTS release lines
    releases.getEOL().length === 6 && // release lines that have reached EOL (end of life)
    releases.getEOL().getModern().length === 4 && // "modern" EOL release lines
    releases.getEOL().getLTS().length === 1) { // LTS release lines that are EOL
  // examine supported release lines

  releases.getSupported().forEach(line => {
    let stats = line.getStats()
    console.log({
      version: line.version,
      daysToEOL: stats.days.until.eol,
      progress: `${stats.percent.total}%`,
      state: {
        lts: line.isLTS,
        isCurrent: line.isCurrent,
        isActive: line.isActive,
        isMaintenance: line.isMaintenance
      },
      releases: {
        total: line.releases.length,
        safe: line.releases.getSafe().length,
        latest: line.releases[0].version
      }
    })
  })
}
