export const containsMouseVariables = (queryText) => {
  return queryText.includes('mouseX') || queryText.includes('mouseY')
}

export const isFlatPrimitiveArray = (arr) => {
  return Array.isArray(arr) && arr.every(x => typeof x !== 'object' || x === null)
}

export const calculateArrayStats = (data) => {
  let allValues = []
  
  const flattenArray = (arr) => {
    if (!Array.isArray(arr)) {
      if (typeof arr === 'number' && !isNaN(arr)) {
        allValues.push(arr)
      }
      return
    }
    arr.forEach(item => flattenArray(item))
  }
  
  flattenArray(data)
  
  if (allValues.length === 0) return null
  
  const min = Math.min(...allValues)
  const max = Math.max(...allValues)
  const sum = allValues.reduce((a, b) => a + b, 0)
  const avg = sum / allValues.length
  
  const variance = allValues.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / allValues.length
  const stdDev = Math.sqrt(variance)
  
  return {
    min: min.toPrecision(6),
    max: max.toPrecision(6),
    avg: avg.toPrecision(6),
    stdDev: stdDev.toPrecision(6),
    count: allValues.length
  }
}
