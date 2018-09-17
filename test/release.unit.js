/* global describe it */
const { ReleaseLine } = require('../')
const assert = require('assert')
const data = require('../data/schedule.json')
const controlDate = new Date('2018-09-01')

// Helper function
function getVersion (name, date) {
  return new ReleaseLine(Object.assign({ version: name }, data[name]), date || controlDate)
}

describe('NodeRelease', function () {
  it('load properly', function () {
    let release = getVersion('v6')

    assert.strictEqual(release.version, 'v6', 'version')
    assert.strictEqual(release.codename, 'Boron', 'version')
    assert.strictEqual(release.isEOL, false, 'EOL')
    assert.strictEqual(release.notStarted, false, 'not started')
    assert.strictEqual(release.isSupported, true, 'supported')
    assert.strictEqual(release.isLTS, true, 'LTS')
    assert.strictEqual(release.inLTS, false, 'in LTS')
    assert.strictEqual(release.isMaintenance, true, 'maintenance')
    assert.strictEqual(release.isActive, false, 'active')
    assert.strictEqual(release.isFuture, false, 'future')
    assert.strictEqual(release.isModern, true, 'modern')
    assert.strictEqual(release.isCurrent, false, 'current')
  })

  it('work with date changes', function () {
    let release = getVersion('v6')
    // change to active LTS date
    release.update(new Date('2018-01-01'))

    assert.strictEqual(release.inLTS, true, 'in LTS')
    assert.strictEqual(release.isMaintenance, false, 'maintenance')
    assert.strictEqual(release.isActive, true, 'active')
    // change to EOL date
    release.update(new Date('2019-06-01'))

    assert.strictEqual(release.isEOL, true, 'EOL')
    assert.strictEqual(release.notStarted, false, 'not started')
    assert.strictEqual(release.isSupported, false, 'supported')
    assert.strictEqual(release.inLTS, false, 'in LTS')
    assert.strictEqual(release.isMaintenance, false, 'maintenance')
    assert.strictEqual(release.isActive, false, 'active')
  })

  it('provide accurate stats', function () {
    let release = getVersion('v11')
    let stats = release.getStats()

    assert.strictEqual(stats.days.total, 250, 'total supported period')
    assert.strictEqual(stats.days.completed.current, 0, 'completed current')
    assert.strictEqual(stats.days.maintenance, 90, 'maintenance days')
    assert.strictEqual(stats.days.until.start, 52, 'until it starts')
    assert.strictEqual(stats.percent.total, 0, 'percent complete')

    release.update(new Date('2018-10-31'))
    stats = release.getStats()

    assert.strictEqual(stats.days.completed.current, 8, 'completed current')
    assert.strictEqual(stats.days.until.start, 0, 'until it starts')
    assert.strictEqual(stats.percent.total, 3, 'percent complete')
  })

  it('handle stats for releases with no maintenance', function () {
    let release = getVersion('v0.10', new Date('2013-01-01'))
    let stats = release.getStats()

    assert.strictEqual(stats.days.maintenance, 0, 'maintenance days')
    assert.strictEqual(stats.days.until.start, 69, 'till start')
    assert.strictEqual(stats.days.until.eol, 1399, 'until eol')

    release.update(new Date('2013-09-01'))
    stats = release.getStats()

    assert.strictEqual(stats.days.maintenance, 0, 'maintenance days')
    assert.strictEqual(stats.days.until.start, 0, 'till start')
    assert.strictEqual(stats.days.until.eol, 1156, 'until eol')

    assert.strictEqual(stats.days.completed.current, 174, 'completed current')
    assert.strictEqual(stats.percent.total, 13, 'percent complete')

    release.update(controlDate)
    stats = release.getStats()

    assert.strictEqual(release.isEOL, true, 'eol')
    assert.strictEqual(stats.days.completed.maintenance, 0, 'maintenance completed')
    assert.strictEqual(stats.percent.total, 100, 'percent complete')
    assert.strictEqual(stats.percent.maintenance, 0, 'maintenance percent complete')
  })

  it('handle stats for non lts release lines', function () {
    let release = getVersion('v9', new Date('2018-06-17'))
    let stats = release.getStats()

    assert.strictEqual(release.isLTS, false, 'LTS')
    assert.strictEqual(stats.days.lts, 0, 'total lts days')
    assert.strictEqual(stats.days.remaining.lts, 0, 'remaining lts days')
    assert.strictEqual(stats.days.until.eol, 13, 'days till EOL')
    assert.strictEqual(release.isEOL, false, 'isEOL')
    assert.strictEqual(stats.percent.total, 95, 'percent complete')
    assert.strictEqual(stats.percent.lts, 0, 'lts percent complete')
  })

  it('adjust stats precision', function () {
    let release = getVersion('v10')
    let stats = release.getStats()

    assert.strictEqual(release.isLTS, true, 'isLTS line')
    assert.strictEqual(release.inLTS, false, 'in LTS')
    assert.strictEqual(stats.days.lts, 548, 'total lts days')
    assert.strictEqual(stats.percent.total, 12, 'percent complete')
    assert.strictEqual(stats.percent.current, 81, 'current percent complete')

    stats = release.getStats(2)
    assert.strictEqual(stats.percent.total, 12.12, 'percent complete')
    assert.strictEqual(stats.percent.current, 81.25, 'current percent complete')
  })

  it('should set unsupported values to null')
  it('should error on bad Date input')
})

describe('NodeReleaseMeta', function () {
  it('should return published release details', function () {
    let release = getVersion('v8')
    let meta = release.getPublicationDetails()
    let latest = meta[0]
    let oldest = meta[meta.length - 1]

    assert.strictEqual(release.version, 'v8', 'version release line')
    assert.strictEqual(meta.length, 26, 'number of published releases')
    // latest should be safe
    assert.strictEqual(latest.isSafe(), true, 'vuln check')
    //
    assert.strictEqual(oldest.version, 'v8.0.0', 'pub version')
    assert.strictEqual(oldest.npm, '5.0.0', 'pub npm version')
    assert.strictEqual(oldest.v8, '5.8.283.41', 'pub v8 version')
    assert.strictEqual(oldest.uv, '1.11.0', 'pub uv version')
    assert.strictEqual(oldest.zlib, '1.2.11', 'pub zlib version')
    assert.strictEqual(oldest.openssl, '1.0.2k', 'pub openssl version')
    //
    assert.strictEqual(oldest.isSafe(), false, 'vuln check')
    assert.strictEqual(oldest.vulns.length, 9, 'number of vulns')

    assert.strictEqual(meta.filter(m => m.isSafe()).length, 2, 'safe versions')
  })

  it('should provide details of vulns', function () {
    let release = getVersion('v8')
    let meta = release.getPublicationDetails()
    let oldest = meta[meta.length - 1]
    let vuln = oldest.vulns[oldest.vulns.length - 1]

    assert.strictEqual(vuln.cve.length, 1, 'CVEs')
    assert.strictEqual(vuln.cve[0], 'CVE-2018-7167', 'cve')
    assert.strictEqual(vuln.vulnerable, '^6.0.0 || ^8.0.0 || ^9.0.0', 'vulnerable versions')
    assert.strictEqual(vuln.patched, '^6.14.3 || ^8.11.3 || ^9.11.2', 'patched')
    assert.strictEqual(!!vuln.ref, true, 'ref')
    assert.strictEqual(vuln.overview.length > 50, true, 'over')
    assert.strictEqual(!!vuln.source.match('github.com/nodejs/security-wg'), true, 'source url')
  })
})
