/* global describe it */
const { NodeRelease } = require('../')
const assert = require('assert')
const data = require('./fixtures/release.json')
const controlDate = new Date('2018-09-01')

// Helper function
function getVersion (name, date) {
  return new NodeRelease(Object.assign({ version: name }, data[name]), date || controlDate)
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
