'use strict'

const { ReleaseLines } = require('../')
const schedule = require('../data/schedule.json')

let v10 = ReleaseLines.load(schedule, '2018-09-15').get('v10')
let stats = v10.getStats()
let safe = v10.releases.getSafe()

let latest = safe[0] // latest "safe" (no vulns) release
v10.setDate(latest.date) // calculate stats at time of release
let s = v10.getStats()

let data = [
  `The ${v10.version} release line will become an active LTS in ${stats.days.until.lts} days. `,
  `In the ${stats.days.completed.total} days ${v10.version} has been actively developed `,
  `${v10.releases.length} releases have been published. ${safe.length} of those releases `,
  `currently have no vulnerabilities. ${v10.version} is ${stats.percent.total}% towards `,
  `EOL (End of Life), which happens in ${(stats.days.until.eol / 365.25).toFixed(1)} years.`,
  '\n\n',
  `The latest version ${latest.version} was released ${latest.date.toDateString()}, `,
  `${s.percent.total}% into the release lifecycle. ${latest.version} core component release versions `,
  `are npm: (${latest.npm}), v8: (${latest.v8}), uv: (${latest.uv}) and (${latest.modules}) modules.`
].join('')

console.log(data)
