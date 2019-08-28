const componentName = 'wiFrequency'
const moduleName = 'wi-frequency'

const calculator = require('./calculator')
require('./style.less')

controller.$inject = ['wiApi', '$scope']
function controller(wiApi, $scope) {
  const self = this
  
  self.numBins = self.numBins || 6
  self.searchText = ''
  self.binMetrics = []
  self.headers = ['Count', 'Lower Bound', 'Upper Bound'] //default
  self.errMsg = ''

  self.$onInit = function() {
    if(self.curveId) initState()
  }

  self.$onChanges = function(changes) {
   
    if(changes.dataset) self.dataset = changes.dataset.currentValue
    if(changes.well) self.well = changes.well.currentValue
    if(changes.numBins) self.numBins = changes.numBins.currentValue
    if(changes.curveName ) self.curveName = changes.curveName.currentValue
    if(changes.curveId) self.curveId = changes.curveId.currentValue
    if(changes.searchText) self.searchText = changes.searchText.currentValue


    if(changes.searchByLowerBound) self.searchByLowerBound = changes.searchByLowerBound.currentValue
    if(changes.searchByUpperBound) self.searchByUpperBound = changes.searchByUpperBound.currentValue
    self.errMsg = ''
    
    if(self.curveId) initState()
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

  self.isSearchResult = function(metricsInBin) {
 	let result = false
	
	if (self.searchByLowerBound)
	  result = result || metricsInBin[1] == self.searchText
	
	if (self.searchByUpperBound)
	  result = result || metricsInBin[2] == self.searchText

	return result;
  }

  function initState() {
    getCurveData(self.curveId, (error, resp) => {
      if (error) {
        self.errMsg = 'Cannot load curve data'
        return
      }

      const curveData = resp
      const curveSplitedWithMetrics = getMetrics(curveData, self.numBins)

      self.headers = generateTableHeaders(curveSplitedWithMetrics)
      self.binMetrics = generateMetricsForEachBin(curveSplitedWithMetrics)
      $scope.safeApply()
    })
  }

  function getCurveData(idCurve, cb) {
    wiApi
      .getCachedCurveDataPromise(idCurve)
      .then(val => cb(null, val))
      .catch(error => cb(error))
  }

  function generateMetricsForEachBin(curveWithMetrics) {
    const metricsMatrix = curveWithMetrics.map(c => c.metrics)
    const metricsInEachBins = _.zip(...metricsMatrix)

    return metricsInEachBins
  }

  function getMetrics(curveData, numBins) {
    const metrics = []

    //add metrics calculated in headers "Count"
    const metricsByCount = {
      by: 'Count',
      metrics: calculator.getNumPointInEachChunk(curveData, numBins),
    }
    metrics.push(metricsByCount)

    //add metrics calculated in headers "LowerBound"
    const metricsByLowerBound = {
      by: 'Lower Bound',
      metrics: calculator.getLowerBoundInEachChunk(curveData, numBins),
    }
    metrics.push(metricsByLowerBound)

    //add metrics calculated in headers "LowerBound"
    const metricsByUpperBound = {
      by: 'Upper Bound',
      metrics: calculator.getUpperBoundInEachChunk(curveData, numBins),
    }
    metrics.push(metricsByUpperBound)

    return metrics
  }

  function generateTableHeaders(curveWithMetrics) {
    const headers = curveWithMetrics.map(c => c.by)
    return headers
  }
}

const app = angular.module(moduleName, [ 'wiApi'])
app.component(componentName, {
  controller,
  template: require('./template.html'),
  controllerAs: 'self',
  bindings: {
    dataset: '<',
    well: '<',
    numBins: '<',
    curveName: '<',
    curveId: '<',
    searchText: '<',
    searchByLowerBound: '<',
    searchByUpperBound: '<'
  },
})

exports.name = moduleName
