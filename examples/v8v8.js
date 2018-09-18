'use strict'

const { ReleaseLines } = require('../')
const data = require('../data/schedule.json')

let v8 = ReleaseLines.load(data, new Date('2018-09-15')).get('v8')
let releases = v8.releases
let safe = releases.getSafe()
let unique = releases.reduce((p, c) => add(p, c.v8), {})

console.log(`v8: 
    published releases ${releases.length}
    safe releases ${safe.length}`)
console.log('v8 versions:\n', unique)

function add (obj, key) {
  if (!obj[key]) obj[key] = 0
  obj[key]++
  return obj
}
