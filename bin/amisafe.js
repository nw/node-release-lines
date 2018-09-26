#!/usr/bin/env node

var safety

var isSafe = require('../').Release.load(process.version).isSafe

if(isSafe === true) {
  safety = "✅  Node.js " + process.version + " is safe!" 
  console.log(safety)
}

var localReleaseLine = process.version.split('.')[0]
var safeReleases = require('../').Releases.load(localReleaseLine).getSafe()
var safeReleaseData = safeReleases[safeReleases.length - 1]
var minimumSafeVersion = safeReleaseData.version

if(isSafe === false) {
  safety = "⚠️  Node.js " + process.version + " is not safe! You should upgrade now.\n\n👉  Minimum safe Node.js version in the " + localReleaseLine + " release line: " + minimumSafeVersion
  console.log(safety)
}