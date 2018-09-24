/* global describe it */
const { Release, ChangeLog } = require('../')
const assert = require('assert')
const controlDate = new Date('2018-09-01')

describe('ChangeLog', function () {
  it('should have a changelog', function () {
    let release = Release.load('v10.11.0')
    let changelog = release.changelog

    assert.strictEqual(changelog instanceof ChangeLog, true, 'instance of ChangeLog')
    assert.strictEqual(changelog.version, 'v10.11.0', 'ChangeLog version')
    assert.strictEqual(changelog.line, 'Current', 'ChangeLog release line')
    assert.strictEqual(changelog.date, '2018-09-20', 'ChangeLog date')
    assert.strictEqual(changelog.releasedBy, '@targos', 'ChangeLog releasedBy')
    assert.strictEqual(changelog.text, '', 'ChangeLog header text')
    assert.strictEqual(changelog.raw.length > 10000, true, 'ChangeLog raw text')

    assert.strictEqual(changelog.commits.length, 106, 'number of commits')

    changelog.commits.forEach(commit => {
      assert.strictEqual(!!commit.shaUrl.match(/^https/), true, 'url sha')
      assert.strictEqual(!!commit.prUrl.match(/^https/), true, 'url pr')
      assert.strictEqual(commit.sha.length, 10, 'commit sha length')
      assert.strictEqual(commit.pr.length >= 4, true, 'commit pr length')
    })
  })
})
