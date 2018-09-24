/* global describe it */
const { ReleaseLines } = require('..')
const assert = require('assert')
const data = require('../data/schedule.json')
const controlDate = new Date('2018-09-01')

describe('ReleaseLines', function () {
  it('load data via static `load`', function () {
    let releases = ReleaseLines.load(data)
    assert(releases.length, 10, 'length of releases is incorrect')
  })

  it('respect date', function () {
    let releases = ReleaseLines.load(data, controlDate)
    assert.strictEqual(releases.getSupported().length, 3, 'supported releases')
    assert.strictEqual(releases.getCurrent().length, 1, 'current releases')
    assert.strictEqual(releases.getMaintenance().length, 1, 'maintenance releases')
    assert.strictEqual(releases.getFuture().length, 1, 'future releases')
    assert.strictEqual(releases.getActive().length, 1, 'active releases')
    assert.strictEqual(releases.getEOL().length, 6, 'EOL releases')
    assert.strictEqual(releases.getModern().length, 8, 'modern releases')
    assert.strictEqual(releases.getLTS().length, 4, 'LTS releases')
  })

  it('should have 2 current releases', function () {
    let releases = ReleaseLines.load(data, new Date('2017-10-15'))
    assert.strictEqual(releases.getCurrent().length, 2, 'current releases')
  })

  it('should have 2 active lts releases', function () {
    let releases = ReleaseLines.load(data, new Date('2018-02-28'))
    assert.strictEqual(releases.getActive().length, 2, 'active releases')
  })

  it('should have 4 supported releases', function () {
    let releases = ReleaseLines.load(data, new Date('2018-06-17'))
    assert.strictEqual(releases.getSupported().length, 4, 'supported releases')
  })

  it('should support subquery filters on releases', function () {
    let releases = ReleaseLines.load(data, new Date('2018-10-31'))

    assert.strictEqual(releases.getActive().length, 2, 'active releases')
    assert.strictEqual(releases.getSupported().length, 4, 'supported releases')
    assert.strictEqual(releases.getSupported().getLTS().length, 3, 'supported LTS releases')
    // redundant
    // console.log(releases.getSupported().getLTS().getActive()) need to test resetDate
    assert.strictEqual(releases.getSupported().getLTS().getActive().length, 2, 'LTS releases')

    assert.strictEqual(releases.getEOL().length, 6, 'EOL releases')
    assert.strictEqual(releases.getModern().getEOL().length, 4, 'Modern EOL releases')
  })

  it('should return create new `Release` instances on filters', function () {
    let releases = ReleaseLines.load(data, new Date('2017-01-01'))
    let old = releases.filter(r => r.version === 'v4')[0]
    let current = releases.get('v4').setDate()

    let oldStats = old.getStats()
    let newStats = current.getStats()

    assert.strictEqual(oldStats.days.completed.total, 481, 'days completed')
    assert.strictEqual(oldStats.days.completed.total < newStats.days.completed.total, true, 'completed days')
  })
})
