#!/usr/bin/env node

let safety

if(require('../').Release.load(process.version).isSafe === true) {
  safety = "✅  Node.js " + process.version + " is safe!" 
  console.log(safety)
}

if(require('../').Release.load(process.version).isSafe === false) {
  safety = "⚠️  Node.js " + process.version + " is not safe! Upgrade now." 
  console.log(safety)
}