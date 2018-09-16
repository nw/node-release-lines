'use strict'

const NodeReleaseMeta = require('./NodeReleaseMeta')
const DAY = 1000 * 60 * 60 * 24

class NodeRelease {
  constructor (obj, date) {
    Object.keys(obj).forEach(k => {
      this[k] = (['start', 'lts', 'maintenance', 'end'].includes(k))
        ? new Date(obj[k]) // use `getTime()`?
        : obj[k]
    })

    this.update(date)
  }

  update (date) {
    this._date = (!date) ? Date.now() : date
    this._current = Math.floor((this._date - this.start) / DAY)
  }

  getPublicationDetails () {
    return NodeReleaseMeta.load(this.version)
  }

  getStats (precision) {
    let total = (this.end - this.start) / DAY
    let lts = (this.isLTS) ? ((this.maintenance || this.end) - this.lts) / DAY : 0
    let maintenance = (!this.maintenance) ? 0 : (this.end - this.maintenance) / DAY
    let current = total - lts - maintenance
    let daysIn = this._current

    let daysCompleted = {
      total: (this.isEOL) ? total : (this.notStarted) ? 0 : daysIn,
      current: (daysIn > current) ? current : (this.notStarted) ? 0 : daysIn,
      lts: (this.inLTS) ? daysIn - current : (this.isLTS && (this.isEOL || this.isMaintenance)) ? lts : 0,
      maintenance: (this.isMaintenance) ? daysIn - current - lts : (this.isEOL) ? maintenance : 0
    }

    let daysRemaining = {
      total: total - daysCompleted.total,
      current: current - daysCompleted.current,
      lts: lts - daysCompleted.lts,
      maintenance: maintenance - daysCompleted.maintenance
    }

    let percentComplete = {
      total: toPercent(total, daysCompleted.total, precision),
      current: toPercent(current, daysCompleted.current, precision),
      lts: toPercent(lts, daysCompleted.lts, precision),
      maintenance: toPercent(maintenance, daysCompleted.maintenance, precision)
    }

    let daysUntil = {
      start: (this.notStarted) ? Math.floor((this.start - this._date) / DAY) : 0,
      lts: (this.isLTS && this.lts > this._date) ? Math.floor((this.lts - this._date) / DAY) : 0,
      maintenance: ((this.isMaintenance || this.isEOL) && this.maintenance) ? 0 : Math.floor((this.maintenance - this._date) / DAY),
      eol: (this.isEOL) ? 0 : Math.floor((this.end - this._date) / DAY)
    }

    return {
      days: {
        total: total,
        current: current,
        lts: lts,
        maintenance: maintenance,
        completed: daysCompleted,
        remaining: daysRemaining,
        until: daysUntil
      },
      percent: percentComplete
    }
  }

  get isEOL () {
    if (!this.isSupported && this.end < this._date) return true
    return false
  }

  get notStarted () {
    if (!this.isSupported && this.start > this._date) return true
    return false
  }

  get isSupported () {
    if (this.start <= this._date && this.end >= this._date) return true
    return false
  }

  get isLTS () {
    return !!this.lts
  }

  get inLTS () {
    if (!this.isEOL && !this.isMaintenance && this.isLTS && this.lts <= this._date) return true
    return false
  }

  get isMaintenance () {
    if (!this.maintenance || this.isEOL) return false
    if (this.maintenance <= this._date) return true
    return false
  }

  get isActive () {
    return this.inLTS
  }

  get isFuture () {
    return this.notStarted
  }

  get isModern () {
    return !this.version.includes('.')
  }

  get isCurrent () {
    if (!this.isSupported) return false
    if (this.isMaintenance) return false
    if (this.inLTS) return false
    return true
  }
}

function toPercent (a, b, precision) {
  if (a === 0) return 0
  return parseFloat((100 / a * b).toFixed(precision))
}

module.exports = NodeRelease
