
# Node Release Lines

Introspection API for Node.js release metadata. Provides information about release lines, their relative status along with details of each release.

See [how release lines work][] for more context.

>Currently optimized for offline mode. Release schedule has apis to support both online & offline mode.

## Installation

``` bash
npm install node-release-lines
```

## Outline
- [Command Line][]
- [Terminology][]
- [ReleaseLine][] _class_
- [ReleaseLines][] extends `Array` _class_
- [Release][] _class_
- [Releases][] extends `Array` _class_
- [Vulnerability][] _class_
- [ChangeLog][] _class_
- [Commit][] _class_
 
## Usage

``` js
const { ReleaseLines } = require('node-release-lines')

const releases = ReleaseLines.load('2018-09-15') // state of release lines at a point in time

if (releases.getLTS().length === 4 && // LTS release lines
    releases.getEOL().length === 6 && // release lines that have reached EOL (end of life)
    releases.getEOL().getModern().length === 4 && // "modern" EOL release lines
    releases.getEOL().getLTS().length === 1) { // LTS release lines that are EOL
  // examine supported release lines

  releases.getSupported().forEach(line => {
    let stats = line.getStats()
    console.log({
      version: line.version,
      daysToEOL: stats.days.until.eol,
      progress: `${stats.percent.total}%`,
      state: {
        lts: line.isLTS,
        isCurrent: line.isCurrent,
        isActive: line.isActive,
        isMaintenance: line.isMaintenance
      },
      releases: {
        total: line.releases.length,
        safe: line.releases.getSafe().length,
        latest: line.releases[0].version
      }
    })
  })
}
```

### Output

``` js
{ version: 'v6',
  daysToEOL: 198,
  progress: '81%',
  state:
   { lts: true,
     isCurrent: false,
     isActive: false,
     isMaintenance: true },
  releases: { total: 39, safe: 1, latest: 'v6.14.3' } }
{ version: 'v8',
  daysToEOL: 472,
  progress: '50%',
  state:
   { lts: true,
     isCurrent: false,
     isActive: true,
     isMaintenance: false },
  releases: { total: 26, safe: 2, latest: 'v8.11.4' } }
{ version: 'v10',
  daysToEOL: 929,
  progress: '13%',
  state:
   { lts: true,
     isCurrent: true,
     isActive: false,
     isMaintenance: false },
  releases: { total: 12, safe: 6, latest: 'v10.9.0' } }
```

## Command Line
<a name="cli"></a>
The node-release-lines CLI options can be used globally or via `npx`.

Globally, where `<command>` is the command you'd like to use:
```
npm install node-release-lines -g
<command> [options]
```

Via `npx`, where `<command>` is the command you'd like to use:
```
npx node-release-lines <command> [options]
```

### Command: `isnodesafe [options]`

`isnodesafe` is a CLI utility to check if Node.js is safe. The CLI defaults to checking system version, but can also check user-specified versions.

#### `isnodesafe` Options

* `-v, --version`: output the version number
* `-c, --ci`: Returns a non-zero exit code if the version of Node.js is not safe, and a zero exit code if it is safe.
* `-r, --release [release]`  Checks to see if a specific release of Node.js is safe
* `-h, --help` output usage information

#### `isnodesafe` Examples
```
$ isnodesafe
$ isnodesafe --ci
$ isnodesafe --release 10.2.0
$ isnodesafe -rc 6.9.5
```

### Command: `amisafe`
This command is deprecated in favor of [`isnodesafe`](#command-isnodesafe-options). It will work as an alias of `isnodesafe` until `node-release-lines@2.0.0`, at which point it will be removed.

### Command: `nodetimeline [options]`

`nodetimeline` is a CLI tool to understand Node.js release lines lifespans.

#### `nodetimeline` Options

* `-v, --version`: output the version number
* `-c, --current`: Returns all "Current" versions of Node.js.
* `-l, --lts`: Returns all presently supported "LTS" versions of Node.js – regardless of whether or not they are presently active "LTS".
* `-a, --active`: Returns all active "LTS" Node.js release lines.
* `-m, --maintenance`: Returns all presently supported "Maintenance" versions of Node.js.
* `-s, --supported`: Returns all presently supported Node.js version
* `-h, --help`: output usage information

#### `nodetimeline` Examples
```
$ nodetimeline
$ nodetimeline -c
$ nodetimeline --lts
```

### Command: `nodechangelog [options]`

`nodechangelog` is CLI tool to surface the Node.js changelog for either the locally running version of Node.js or a specific version.

#### `nodechangelog` Options

* `-v, --version`: output the version number
* `-r, --release <release>`:  will show the chnagelog for the sepcified release. Requires a valid semver version, including a "v".
* `-c, --commits`: will include commits shipped in a release in addition to the normal output.
* `-C, --commits-verbose`: will include commits shipped in a release in addition to the normal output.
* `-h, --help`: output usage information

#### `nodechangelog` Examples
```
$ nodechangelog
$ nodechangelog -c
$ nodechangelog -commits-verbose
$ nodechangelog -r v6.4.0
$ nodechangelog -Cr v10.0.0
```

# API

<a name="terminology"></a>
## Terminology

- **EOL**: (end of life) - any `ReleaseLine` no longer supported and recieves no more updates.
- **Supported**: any `ReleaseLine` that has been started and has not reached EOL.
- **LTS**: any `ReleaseLine` that has an active LTS period in the lifecycle. 
- **Active**: any `ReleaseLine` that is in LTS, excluding maintenance window.
- **Maintenance**: any `ReleaseLine` that is in maintenance mode and has not reached EOL.
- **Current**: any `ReleaseLine` that has been started, in active development, not in maintenance or LTS.
- **Future**: any defined `ReleaseLine` that has yet to start.
- **Modern**: any `ReleaseLine` that is `v1` or greater. This does not include io.js releases (any version from `v4` onwards).

<a name="ReleaseLine"></a>
## `ReleaseLine` _class_

**Instance properties**:
- **version**: `String`
- **start**: `Date`
- **end**: `Date`
- **lts**: `Date` or `undefined`
- **maintenance**: `Date` or `undefined`
- **codename**: `String` or `undefined`

**Instance getters**:

_[see terminology]_

- **releases**: `Releases` _see [Releases][] section_ (lazy loaded)
- **isEOL**: `Boolean`
- **isSupported**: `Boolean`
- **isLTS**: `Boolean`
- **isActive**: `Boolean`
- **inLTS**: `Boolean` alias for `isActive`
- **isMaintenance**: `Boolean`
- **isCurrent**: `Boolean`
- **isFuture**: `Boolean`
- **isModern**: `Boolean`
- **notStarted**: `Boolean`

### `setDate(date)`

Changes the `date` for calculating stats in `getStats`

**Params**:
- **date**: Date instance (optional, defaults=`Date.now`)

**Returns**: `this`

### `getStats(precision)`

**Params**:
- **precision**: `Number` 

Stats about the relative timeline of the release based on the current `setDate`.

**Notes**:
- `0` will be used for unknown values. For example `maintenance`, `lts` are not valid for some release.
- If a value is negative `0` is returned instead. This is useful for a `ReleaseLine` that hasn't started.
- returned stats object is not bound to `setDate`

**Returns**:
``` js
{ days: { 
    total: 1073, // total days release is supported
    current: 160, // days in `current` mode
    lts: 548, // days in `active` LTS
    maintenance: 365, // days in maintenance
    completed: { 
        total: 144, 
        current: 144, 
        lts: 0, 
        maintenance: 0 },
    remaining: { 
        total: 929, 
        current: 16, 
        lts: 548, 
        maintenance: 365 },
    until: { 
        start: 0, // already started
        lts: 16, 
        maintenance: 564, 
        eol: 929 } 
    },
  percent: { 
      total: 13, // complete
      current: 90, 
      lts: 0, 
      maintenance: 0 } 
}
```

<a name="ReleaseLines"></a>
## `ReleaseLines` extends `Array` _class_

An array of `ReleaseLine` instances. Provides helper methods for updating, filtering and querying release lines.

### `ReleaseLines.load(schedule, date)` _static_

Hydrates a schedule. If a schedule is not defined then the internal cached copy is automatically used.

**Params**:
- **schedule**: an object of release lines (optional)
    - **key**: version of the release
    - **value**: `Object`
        - **start**: `String` or `Date` (required)
        - **endt**: `String` or `Date` (required)
        - **lts**: `String` or `Date`
        - **maintenance**: `String` or `Date`
        - **codename**: `String` 
- **date**: Date instance (optional, defaults=`Date.now`)

**Returns**: `ReleaseLines` instance

### `ReleaseLines.fetch(date)` _static_

**Params**:
- **date**: Date instance (optional, defaults=`Date.now`)

**Returns**: `Promise` - resolves to `ReleaseLines` instance

### `ReleaseLines.scheduleUrl` (string) _static_

The url to the offical [release schedule][]. 

### `get(version, resetDate)`

**Params**:
- **version**: a release line name (example: `v10`)
- **resetDate**: `Date`, `String` or `Boolean` - changes the date. (optional)

**Returns**: `ReleaseLine` or `undefined`

### `setDate(date)`

**Params**:
- **date**: Date instance (optional, defaults=`Date.now`)

**Returns**: `this`

### `getSupported(resetDate)`

Filters `ReleaseLine` items by **isSupported**

**Params**:
- **resetDate**: `Date`, `String` or `Boolean` - changes the date. (optional)

**Returns**: `ReleaseLines` instance with only supported release lines.

### `getCurrent(resetDate)`

Filters `ReleaseLine` items by **isCurrent**

**Params**:
- **resetDate**: `Date`, `String` or `Boolean` - changes the date. (optional)

**Returns**: `ReleaseLines` instance with only current release lines.

### `getMaintenance(resetDate)`

Filters `ReleaseLine` items by **isMaintenance**

**Params**:
- **resetDate**: `Date`, `String` or `Boolean` - changes the date. (optional)

**Returns**: `ReleaseLines` instance with only release lines in maintenance mode.

### `getFuture(resetDate)`

Filters `ReleaseLine` items by **isFuture**

**Params**:
- **resetDate**: `Date`, `String` or `Boolean` - changes the date. (optional)

**Returns**: `ReleaseLines` instance with only release lines that have yet to start.

### `getActive(resetDate)`

Filters `ReleaseLine` items by **isActive**

**Params**:
- **resetDate**: `Date`, `String` or `Boolean` - changes the date. (optional)

**Returns**: `ReleaseLines` instance with only release lines that are in LTS, excluding maintenance window.

### `getEOL(resetDate)`

Filters `ReleaseLine` items by **isEOL**

**Params**:
- **resetDate**: `Date`, `String` or `Boolean` - changes the date. (optional)

**Returns**: `ReleaseLines` instance with only release lines that have hit EOL

### `getModern(resetDate)`

Filters `ReleaseLine` items by **isModern**

**Params**:
- **resetDate**: `Date`, `String` or `Boolean` - changes the date. (optional)

**Returns**: `ReleaseLines` instance with only modern release lines.

### `getLTS(resetDate)`

Filters `ReleaseLine` items by **isLTS**

**Params**:
- **resetDate**: `Date`, `String` or `Boolean` - changes the date. (optional)

**Returns**: `ReleaseLines` instance with only release lines that have an LTS active mode in their lifecycle. Note: It does not neccessarily mean it is an active LTS (see `getActive()`).

<a name="Release"></a>
## `Release` _class_

**Instance properties**:
- **version**: `String` - version number of release
- **date**: `Date` - date of release
- **modules**: `Number` - number of modules
- **npm**: `String` - version
- **v8**: `String` - version
- **uv**: `String` - version
- **zlib**: `String` - version
- **openssl**: `String` - version

**Instance getters**:
- **vulns**: `Array` of [Vulnerability][] (lazy loading)
- **isSafe**: `Boolean` - `true` if `Release` has no known vulnerabilities.
- **isVulnerable**: `Boolean` - `true` if `Release` has one or more vulnerabilities.
- **doc**: `String` url of docs for the specific release

### `Release.load(version)` _static_

**options**:
- **version**: `String`

**Returns**: `Release` or `null` if version does not exist

### `download(arch, type)`

If `arch` is omitted returns directory to all download resources for release version.

>Currently `arch` and `type` are not implemented

**options**:
- **arch**: `String` 
- **type**: `String` (gz, xz, pkg, msi, zip)

**Returns**: `String` url of download resource

<a name="Releases"></a>
## `Releases` extends `Array` _class_

An array of `Release` instances. Provides helper methods for updating, filtering and querying release lines.

### `Releases.load(version)` _static_

**Params**:
- **version**: `String` (example `v6`)

**Returns**: `Releases` instance

### `getSafe()`

Filters `Release` items by **isSafe**

**Returns**: `Releases` instance with only releases that have no known vulnerabilities.

<a name="Vulnerability"></a>
## `Vulnerability` _class_

**Instance properties**:
- **id**: `String`

**Instance getters**:

- **cve**
- **ref**
- **vulnerable**
- **patched**
- **description**
- **overview**
- **author**
- **cvss**
- **cvss_score**
- **source**: `String` - url to specific vulnerability in [nodejs/security-wg][] repo.
- **isValid**: `Boolean`

<a name="ChangeLog"></a>
## `ChangeLog` _class_

Currently `deprecations` and `notable changes` are not fully supported.

**Instance properties**:
- **version**: `String`
- **line**: `String` current release line (example: `Current`)
- **date**: `Date` release date
- **releasedBy**: `String` individual who performed the release
- **text**: `String` meta text above other sub headers
- **raw**: `String` raw markdown text of the whole release
- **commits**: `Array` of `Commit`

### `load(version)` _static_

**options**:
- **version**: `String`

**Returns**: `ChangeLog` instance or `null`

<a name="Commit"></a>
## `Commit` _class_

**Instance properties**:
- **sha**: `String` commit sha 
- **pr**: `String` pr number associated with commit
- **author**: `String` author of commit
- **reverts**: `Boolean` if commit reverts prior commit(s) or behavior
- **desc**: `String` commit description
- **topics**: `Array` areas the commit touches (example: ['build', 'win'])

**Instance getters**:
- **shaUrl**: `String` url to the commit in github
- **prUrl**: `String` url to the pr on github

## Acknowledgements

Thank you [Node.js Release Team][] and all the contributors to the [Node.js project][], without you none of this is possible. Special thanks goes out to [Tierney Cyren][]. His relentless desire to improve accessibility, visibility and communication inspired this project.

## Contributing

To submit a bug report, please create an [issue on GitHub][].

If you'd like to contribute code to this project, please read the
[CONTRIBUTING.md][] document.

## License & Copyright

**node-release-lines** is Copyright (c) 2018 Nathan White and licensed under the
MIT license. All rights not explicitly granted in the MIT license are reserved.
See the included [LICENSE.md][] file for more details.

[Node.js project]: https://nodejs.org/
[Node.js Release Team]: https://github.com/nodejs/Release#lts-team-members
[Tierney Cyren]: https://bnb.im/
[how release lines work]: http://nodesource.com/blog/understanding-how-node-js-release-lines-work/
[release schedule]: https://raw.githubusercontent.com/nodejs/Release/master/schedule.json
[nodejs/security-wg]: https://github.com/nodejs/security-wg
[issue on GitHub]: https://github.com/nw/node-release-lines/issues
[Command Line]: #cli
[see terminology]: #terminology
[Terminology]: #terminology
[ReleaseLine]: #ReleaseLine
[ReleaseLines]: #ReleaseLines
[Release]: #Release
[Releases]: #Releases
[Vulnerability]: #Vulnerability
[ChangeLog]: #ChangeLog
[Commit]: #Commit
[CONTRIBUTING.md]: CONTRIBUTING.md
[LICENSE.md]: LICENSE.md