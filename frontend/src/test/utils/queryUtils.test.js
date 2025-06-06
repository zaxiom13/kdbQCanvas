import { describe, it, expect } from 'vitest'
import { 
  containsMouseVariables, 
  isFlatPrimitiveArray, 
  calculateArrayStats 
} from '../../utils/queryUtils'

describe('queryUtils', () => {
  describe('containsMouseVariables', () => {
    it('should return true when query contains mouseX', () => {
      expect(containsMouseVariables('some query with mouseX')).toBe(true)
      expect(containsMouseVariables('mouseX+5')).toBe(true)
    })

    it('should return true when query contains mouseY', () => {
      expect(containsMouseVariables('some query with mouseY')).toBe(true)
      expect(containsMouseVariables('mouseY*10')).toBe(true)
    })

    it('should return true when query contains both mouseX and mouseY', () => {
      expect(containsMouseVariables('mouseX+mouseY')).toBe(true)
      expect(containsMouseVariables('sin(mouseX)*cos(mouseY)')).toBe(true)
    })

    it('should return false when query contains neither mouseX nor mouseY', () => {
      expect(containsMouseVariables('simple query')).toBe(false)
      expect(containsMouseVariables('til 8')).toBe(false)
      expect(containsMouseVariables('8 8#64?1.0')).toBe(false)
    })

    it('should handle empty string', () => {
      expect(containsMouseVariables('')).toBe(false)
    })

    it('should handle case sensitivity', () => {
      expect(containsMouseVariables('MouseX')).toBe(false)
      expect(containsMouseVariables('mousex')).toBe(false)
      expect(containsMouseVariables('MOUSEX')).toBe(false)
    })
  })

  describe('isFlatPrimitiveArray', () => {
    it('should return true for flat array of numbers', () => {
      expect(isFlatPrimitiveArray([1, 2, 3, 4])).toBe(true)
      expect(isFlatPrimitiveArray([0.1, 0.2, 0.3])).toBe(true)
    })

    it('should return true for flat array of strings', () => {
      expect(isFlatPrimitiveArray(['a', 'b', 'c'])).toBe(true)
    })

    it('should return true for flat array of mixed primitives', () => {
      expect(isFlatPrimitiveArray([1, 'a', true, null])).toBe(true)
    })

    it('should return true for empty array', () => {
      expect(isFlatPrimitiveArray([])).toBe(true)
    })

    it('should return false for nested arrays', () => {
      expect(isFlatPrimitiveArray([[1, 2], [3, 4]])).toBe(false)
      expect(isFlatPrimitiveArray([1, [2, 3]])).toBe(false)
    })

    it('should return false for arrays containing objects', () => {
      expect(isFlatPrimitiveArray([{a: 1}, {b: 2}])).toBe(false)
      expect(isFlatPrimitiveArray([1, {a: 1}])).toBe(false)
    })

    it('should return false for non-arrays', () => {
      expect(isFlatPrimitiveArray('not an array')).toBe(false)
      expect(isFlatPrimitiveArray(123)).toBe(false)
      expect(isFlatPrimitiveArray(null)).toBe(false)
      expect(isFlatPrimitiveArray(undefined)).toBe(false)
      expect(isFlatPrimitiveArray({})).toBe(false)
    })
  })

  describe('calculateArrayStats', () => {
    it('should calculate stats for flat number array', () => {
      const data = [1, 2, 3, 4, 5]
      const stats = calculateArrayStats(data)
      
      expect(stats).toBeDefined()
      expect(stats.count).toBe(5)
      expect(parseFloat(stats.min)).toBe(1)
      expect(parseFloat(stats.max)).toBe(5)
      expect(parseFloat(stats.avg)).toBeCloseTo(3, 1)
      expect(parseFloat(stats.stdDev)).toBeCloseTo(1.414, 2)
    })

    it('should calculate stats for nested arrays', () => {
      const data = [[1, 2], [3, 4]]
      const stats = calculateArrayStats(data)
      
      expect(stats).toBeDefined()
      expect(stats.count).toBe(4)
      expect(parseFloat(stats.min)).toBe(1)
      expect(parseFloat(stats.max)).toBe(4)
      expect(parseFloat(stats.avg)).toBeCloseTo(2.5, 1)
    })

    it('should calculate stats for 3D arrays', () => {
      const data = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]]
      const stats = calculateArrayStats(data)
      
      expect(stats).toBeDefined()
      expect(stats.count).toBe(8)
      expect(parseFloat(stats.min)).toBe(1)
      expect(parseFloat(stats.max)).toBe(8)
      expect(parseFloat(stats.avg)).toBeCloseTo(4.5, 1)
    })

    it('should handle arrays with non-numeric values', () => {
      const data = [1, 'hello', 3, null, 5]
      const stats = calculateArrayStats(data)
      
      expect(stats).toBeDefined()
      expect(stats.count).toBe(3) // Only counts numeric values
      expect(parseFloat(stats.min)).toBe(1)
      expect(parseFloat(stats.max)).toBe(5)
    })

    it('should return null for empty arrays', () => {
      expect(calculateArrayStats([])).toBeNull()
    })

    it('should return null for arrays with no numeric values', () => {
      expect(calculateArrayStats(['hello', 'world'])).toBeNull()
      expect(calculateArrayStats([null, undefined, {}])).toBeNull()
    })

    it('should handle single value arrays', () => {
      const stats = calculateArrayStats([42])
      
      expect(stats).toBeDefined()
      expect(stats.count).toBe(1)
      expect(parseFloat(stats.min)).toBe(42)
      expect(parseFloat(stats.max)).toBe(42)
      expect(parseFloat(stats.avg)).toBe(42)
      expect(parseFloat(stats.stdDev)).toBe(0)
    })

    it('should handle NaN values', () => {
      const data = [1, NaN, 3]
      const stats = calculateArrayStats(data)
      
      expect(stats).toBeDefined()
      expect(stats.count).toBe(2) // NaN should be filtered out
      expect(parseFloat(stats.min)).toBe(1)
      expect(parseFloat(stats.max)).toBe(3)
    })
  })
})
