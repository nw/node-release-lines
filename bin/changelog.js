#!/usr/bin/env node

var cli = require('commander')
var chalk = require('chalk')

cli
  .version('1.0.0', '-v, --version')
  .usage('[options]')
  .description('CLI tool to surface the Node.js changelog for either the locally running version of Node.js or a specific version.')
  .option('-r, --release <release>', 'Will show the chnagelog for the sepcified release. Requires a valid semver version, including a "v".')
  .option('-c, --commits', 'Will include commits shipped in a release in addition to the normal output.')
  .option('-C, --commits-verbose', 'Will include commits shipped in a release in addition to the normal output.')
  .parse(process.argv)

var version = (cli.release) ? cli.release : process.version

// Handle EOL before we get into program logic
handleEOLVersions()

var api = require('../')
var changelog = api.ChangeLog.load(version)

// Handle invalid versions passed to the CLI
handleInvalid(changelog)

// # CLI specific code begins

// Custom total data
var total = Object.keys(changelog.commits).length

// Building out custom, deduped commit topics data
var commitTopics = []

var buildCommitTopicsArray = changelog.commits.forEach(function(commit) {
  commitTopics.push(commit.topics.toString())
})

var dedupedCommitTopics = commitTopics.filter(function(topic, index, array) {
  return array.indexOf(topic) === index
})

var commitTopicsText = dedupedCommitTopics.join(chalk.green(', '))

// Always-on CLI output starts
console.log('')
console.log(chalk.yellow('Changelog for Node.js ' + changelog.version + ' (' + changelog.line + '):'))
console.log('')
console.log(chalk.bold('  Released on:            ') + changelog.date)
console.log(chalk.bold('  Released by:            ') + changelog.releasedBy)
console.log(chalk.bold('  Total Commits:          ') + total)
console.log(chalk.bold('  Subsystems and Topics:  ') + commitTopicsText)
if(changelog.text !== '') {
  console.log(chalk.bold('  Changelog text:'))
  console.log('  ' + changelog.text)
}

if(cli.commits) { // Only displays if -c or --commits is passed
  console.log(chalk.bold('  Changelog commits:'))
  
  if (total === 0) { // Check to see if there are zero commits – if so, specifically log that
    console.log('    - There were' + chalk.green(' no commits ') + 'in this release')
    return
  }

  var commits = changelog.commits.forEach(function(commit) {
    console.log('    - Commit to ' + chalk.green(commit.topics) + ' by ' + chalk.green(commit.author) + ' in PR ' + chalk.green(commit.pr) + ': ' + commit.desc)
  })
}

if(cli.commitsVerbose) { // Only displays if -C or --commits-verbose is passed
  console.log(chalk.bold('  Changelog commits' + chalk.yellow(' (verbose)') + ':'))
  
  if (total === 0) { // Check to see if there are zero commits – if so, specifically log that
    console.log('    - There were' + chalk.green(' no commits ') + 'in this release')
    return
  }

  var commits = changelog.commits.forEach(function(commit) { // Log ALL THE DATA
    console.log(chalk.green('    Commit:'))
    console.log(chalk.bold('      Description: ') + commit.desc)
    console.log(chalk.bold('      Topics: ') + commit.topics)
    console.log(chalk.bold('      Author: ') + commit.author)
    console.log(chalk.bold('      SHA: ') + commit.sha)
    console.log(chalk.bold('      SHA URL: ')  + 'https://github.com/nodejs/node/commit/' + commit.sha)
    console.log(chalk.bold('      Pull Request: ') + 'https://github.com/nodejs/node/pull/' + commit.pr)
  })
}

function handleInvalid (changelog) { // Handles invalid versions passed to the CLI
  if (!changelog) {
    console.error('Invalid Version')
    process.exit(1)
  }
}

function handleEOLVersions () { // Handles unsupported versions of Node.js used to run the CLI
  var releaseLine = parseInt(version.split('.')[0].replace('v', ''), 10)
  if (isNaN(releaseLine) || releaseLine < 6) {
    console.error('Node.js release line is EOL (End of Life) - please install a supported release line.')
    process.exit(1)
  }
}
