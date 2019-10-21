const componentName = 'wiFrequency'
const moduleName = 'wi-frequency'

const calculator = require('./calculator')
require('./style.less')

controller.$inject = ['wiApi', '$scope', '$timeout']
function controller(wiApi, $scope, $timeout) {
  const self = this

  self.step = self.step || 10
  self.numBins = 6
  self.searchText = ''
  self.binMetrics = []
  self.headers = ['#', 'Count', 'Lower Bound', 'Upper Bound']
  self.tableWidthArray = []
  self.errMsg = ''
  self.discriminator = self.discriminator || {}
  self.rowWithMaxCount = {}

  self.$onInit = function() {
    if (self.curveId) initState()
    if (!self.realTimeUpdate && self.getUpdateFn && typeof self.getUpdateFn === 'function')   {
      self.getUpdateFn(initState)
    }
  }

  self.$onChanges = function(changes) {
    if (changes.step) self.step = changes.step.currentValue
    if (changes.curveId) self.curveId = changes.curveId.currentValue
    if (changes.searchText) self.searchText = changes.searchText.currentValue
    if (changes.discriminator)
      self.discriminator = changes.discriminator.currentValue

    self.errMsg = ''
    
    // realtime update
    if (self.curveId && self.realTimeUpdate) return initState()
    //if not use realtime update
    //assing update function for parent component to use
    if (!self.realTimeUpdate && self.getUpdateFn && typeof self.getUpdateFn === 'function')   {
      self.getUpdateFn(initState)
    }
    //init state the frist time
    if (changes.curveId && changes.curveId.previousValue === undefined) return initState()
  }

  $scope.safeApply = function(fn) {
    const phase = this.$root.$$phase
    if (phase == '$apply' || phase == '$digest') {
      if (fn && typeof fn === 'function') {
        fn()
      }
    } else {
      this.$apply(fn)
    }
  }

  self.isActiveNode = function(metricsInBin, idx) {
    if (!self.binMetrics || !self.binMetrics.length) return false
    if (isSearchResult(metricsInBin)) return true
    if (idx > 0 && idx < self.binMetrics.length - 1) return false

    const minLower = self.binMetrics[0][1]
    const maxUpper = self.binMetrics[self.binMetrics.length - 1][2]
    const searchVal = parseInt(self.searchText)

    if (idx === 0) return searchVal <= minLower
    if (idx === self.binMetrics.length - 1) return searchVal >= maxUpper
    return false
  }

  function isSearchResult(metricsInBin) {
    const upper = metricsInBin[2]
    const lower = metricsInBin[1]
    const searchVal = parseInt(self.searchText)

    return searchVal < upper && searchVal >= lower
  }

  self.resizeTable = function(
    leftColIdx,
    leftColWidth,
    rightColIdx,
    rightColWidth
  ) {
    $timeout(() => {
      self.tableWidthArray[leftColIdx] = leftColWidth
      self.tableWidthArray[rightColIdx] = rightColWidth
    })
  }

  self.resizeTableInit = function(tableWidthArray) {
    $timeout(() => {
      self.tableWidthArray = tableWidthArray
    })
  }

  function initState() {
    getCurveData(self.curveId, async (error, resp) => {
      if (error) {
        self.errMsg = 'Cannot load curve data'
        return
      }

      const curveInfo = await wiApi.getCurveInfoPromise(self.curveId)
      const datasetInfo = await wiApi.getDatasetInfoPromise(curveInfo.idDataset)
      const discriminator = self.discriminator || {}
      const activeDiscrimintor = discriminator.active ? discriminator: {}
      const validPosition = await wiApi.evalDiscriminatorPromise(
        datasetInfo,
        activeDiscrimintor
      )
      // const curveData = resp.filter(data => {
      //   const maxX = parseFloat(self.maxX)
      //   const minX = parseFloat(self.minX)
      //   const upper = maxX !== NaN ? maxX : Infinity
      //   const lower = minX !== NaN ? minX : -Infinity

      //   return data.x >= lower && data.x <= upper

      // })
      const curveData = resp
      self.numBins = calculateNumBin(
        self.step,
        self.minX,
        self.maxX
      )

      const validCurveData = _.zip(validPosition, curveData)
        .map(([isValid, data]) =>
          isValid === undefined ? [true, data] : [isValid, data]
        )
        .filter(([isValid, data]) => isValid && data) // valid data by discriminator
        .filter(([isValid, data]) => {  // valid data by max and min, data.x
            const maxX = parseFloat(self.maxX)
            const minX = parseFloat(self.minX)
            const upper = maxX !== NaN ? maxX : Infinity
            const lower = minX !== NaN ? minX : -Infinity

            return data.x !== null && data.x >= lower && data.x <= upper
        })
        .map(([isValid, data]) => data)
      const validCurveDataInZone = validCurveData.filter(data => {
        if(!self.zone) return true

        return (
          data.y >= self.zone.properties.startDepth &&
          data.y <= self.zone.properties.endDepth
        )
      })
      const curveSplitedWithMetrics = getMetrics(validCurveDataInZone, self.step, self.minX, self.maxX)

      //    self.headers = generateTableHeaders(curveSplitedWithMetrics)
      self.binMetrics = generateMetricsForEachBin(curveSplitedWithMetrics)
      self.rowWithMaxCount = findRowHaveMaxCount(self.binMetrics)
      $scope.safeApply()
    })
  }

  function getCurveData(idCurve, cb) {
    wiApi
      .getCachedCurveDataPromise(idCurve)
      .catch(error => cb(error))
      .then(val => cb(null, val))
  }

  function generateMetricsForEachBin(curveWithMetrics) {
    const defaultEmptyBins = [[0, NaN, NaN]]
    // const metricsMatrix = curveWithMetrics.map(c => c.metrics)
    const metricsInEachBins = _.zip(...curveWithMetrics)

    if (metricsInEachBins && metricsInEachBins.length) return metricsInEachBins
    return defaultEmptyBins
  }

  function getMetrics(curveData, step, minX, maxX) {
    const counts = calculator.getNumPointInEachChunk(curveData, step, minX, maxX)
    const lowerBounds = calculator.getLowerBoundInEachChunk(curveData, step, minX, maxX)
    const upperBounds = calculator.getUpperBoundInEachChunk(curveData, step, minX, maxX)
    const metrics = [
      counts,
      lowerBounds.map(num => roundNum(num)), 
      upperBounds.map(num => roundNum(num))
    ]
    // const roundedMetrics = metrics.map((row, idxRow) => {

    //   //do not round row 0
    //   if(idxRow === 0) return row

    //   return row.map((metric) => {
    //     const numDigits = 4
    //     const roundedMetric = wiApi.bestNumberFormat(metric, numDigits)
    //     return roundedMetric
    //   })
    // })
    
    return metrics
  }

  function calculateNumBin(step, minDepth, maxDepth) {
    if(step <= 0) step = 1
    
    const numBins = Math.ceil((maxDepth - minDepth) / step)
    if(self.onNumBinsChange) self.onNumBinsChange(numBins)

    return numBins
  }

  function findRowHaveMaxCount(rows) {
    const rowHaveMaxCount = _.maxBy(rows, ([count, lower, upper]) => count)
    const rowHaveMaxCountObj = {
      count: rowHaveMaxCount[0],
      lower: rowHaveMaxCount[1],
      upper: rowHaveMaxCount[2]
    }
    self.onRowHaveMaxCountChange && self.onRowHaveMaxCountChange(rowHaveMaxCountObj)
    return rowHaveMaxCountObj
  }

  function roundNum(num, digitAfterComma=4) {
    const roundedNum = wiApi.bestNumberFormat(num, digitAfterComma)
    return parseFloat(roundedNum)
  }
}

const app = angular.module(moduleName, ['wiApi', 'wiTableResizeable'])
app.component(componentName, {
  controller,
  template: require('./template.html'),
  controllerAs: 'self',
  bindings: {
    //    dataset: '<',
    //    well: '<',
    // numBins: '<',
    //    curveName: '<',
    step: '<',
    curveId: '<',
    searchText: '<',
    discriminator: '<',
    zone: '<',
    minX: '<',
    maxX: '<',

    onNumBinsChange: '<', //optional
    onRowHaveMaxCountChange: '<',//optional

    realTimeUpdate: '<', //boolean
    getUpdateFn: '<',// when realTimeUpdate=false, this funciton to get the update function inside this component
    // onCalculateSuccess: '<', // when realTimeUpdate=false, use this function to listen to calculation update event
  },
})

exports.name = moduleName
