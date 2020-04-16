function splitIntoBins(curveData, step, minX, maxX) {
  // const sortedCurves = [...curveData].sort(
  //   (a, b) => parseFloat(a.x) - parseFloat(b.x)
  // )
  // const maxX = _.last(sortedCurves).x
  // const minX = _.first(sortedCurves).x

  // if(!curveData || !curveData.length) return []
  // if(!step) return []

  // const maxX = _.maxBy(curveData, curve =>
  //   _.isNumber(curve.x) ? curve.x : -Infinity
  // ).x

  // const minX = _.minBy(curveData, curve =>
  //   _.isNumber(curve.x) ? curve.x : Infinity
  // ).x

  const xAxis = d3.scaleLinear().domain([minX, maxX])
  const histogram = d3
    .histogram()
    .value(c => c.x)
    .domain(xAxis.domain())
    .thresholds(d3.range(minX, maxX, step))
//    .thresholds(xAxis.ticks(numBins))

  const bins = histogram(curveData)
  return bins
//  const sanitizedBins = bins.map(bin => sanitize(bin)).filter(bin => bin && bin.length)
//  return sanitizedBins
}

export const getNumPointInEachChunk = function(curveData, step, minX, maxX) {
  const bins = splitIntoBins(curveData, step, minX, maxX)
  const countMemOfEachBins = bins.map(bin => bin.length)

  return countMemOfEachBins
}

export const getUpperBoundInEachChunk = function(curveData, step, minX, maxX) {
  const bins = splitIntoBins(curveData, step, minX, maxX)
  const upperBounds = bins.map(bin => bin.x1)

  return upperBounds
}

export const getLowerBoundInEachChunk = function(curveData, step, minX, maxX) {
  const bins = splitIntoBins(curveData, step, minX, maxX)
  const lowerBounds = bins.map(bin => bin.x0)

  return lowerBounds
}
