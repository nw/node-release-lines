'use strict'

const fs = require('fs')
const path = require('path')
let onlineData = require('./onlineData.js')

let write = async () => {
  let data = await onlineData()
  console.log('')
  console.log('  Writing to data:')
  console.log('')
  console.log('  ⏳ Writing data/schedule.json')
  fs.writeFileSync(path.resolve(__dirname, '../data/schedule.json'), data.schedule)
  console.log('    ☑️  Wrote data/schedule.json')
  console.log('')
  console.log('  ⏳ Writing data/vulns.core.json')
  fs.writeFileSync(path.resolve(__dirname, '../data/vulns.core.json'), data.vulns)
  console.log('    ☑️  Wrote data/vulns.core.json')
  console.log('')
  console.log('  ⏳ Writing data/releases.meta.json')
  fs.writeFileSync(path.resolve(__dirname, '../data/releases.meta.json'), data.releases)
  console.log('    ☑️  Wrote data/releases.meta.json')
  console.log('')
}

write()
