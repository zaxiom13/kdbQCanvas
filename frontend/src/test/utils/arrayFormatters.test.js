import { describe, it, expect } from 'vitest'
import { 
  formatArrayByShape, 
  compactArrayString, 
  formatArrayWithBoxDrawing 
} from '../../utils/arrayFormatters'

describe('arrayFormatters', () => {
  describe('formatArrayByShape', () => {
    it('should format flat array into 2D matrix', () => {
      const flat = [1, 2, 3, 4]
      const dims = [2, 2]
      const result = formatArrayByShape(flat, dims)
      
      expect(result).toEqual([[1, 2], [3, 4]])
    })

    it('should format flat array into 3D array', () => {
      const flat = [1, 2, 3, 4, 5, 6, 7, 8]
      const dims = [2, 2, 2]
      const result = formatArrayByShape(flat, dims)
      
      expect(result).toEqual([[[1, 2], [3, 4]], [[5, 6], [7, 8]]])
    })

    it('should handle single dimension', () => {
      const flat = [1, 2, 3]
      const dims = [3]
      const result = formatArrayByShape(flat, dims)
      
      expect(result).toEqual([1, 2, 3])
    })

    it('should handle empty dimensions', () => {
      const flat = [1, 2, 3]
      const dims = []
      const result = formatArrayByShape(flat, dims)
      
      expect(result).toEqual([1, 2, 3])
    })

    it('should handle non-array input', () => {
      const flat = 'not an array'
      const dims = [2, 2]
      const result = formatArrayByShape(flat, dims)
      
      expect(result).toBe('not an array')
    })

    it('should handle larger dimensions', () => {
      const flat = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
      const dims = [3, 4]
      const result = formatArrayByShape(flat, dims)
      
      expect(result).toEqual([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]])
    })
  })

  describe('compactArrayString', () => {
    it('should format flat arrays compactly', () => {
      expect(compactArrayString([1, 2, 3])).toBe('[1, 2, 3]')
      expect(compactArrayString(['a', 'b', 'c'])).toBe('[a, b, c]')
    })

    it('should handle empty arrays', () => {
      expect(compactArrayString([])).toBe('[]')
    })

    it('should handle single element arrays', () => {
      expect(compactArrayString([42])).toBe('[42]')
    })

    it('should handle nested arrays', () => {
      const nested = [[1, 2], [3, 4]]
      const result = compactArrayString(nested)
      expect(result).toBe('[[1, 2], [3, 4]]')
    })

    it('should handle deeply nested arrays', () => {
      const nested = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]]
      const result = compactArrayString(nested)
      expect(result).toBe('[[[1, 2], [3, 4]], [[5, 6], [7, 8]]]')
    })

    it('should handle non-array values', () => {
      expect(compactArrayString(42)).toBe('42')
      expect(compactArrayString('hello')).toBe('hello')
      expect(compactArrayString(null)).toBe('null')
      expect(compactArrayString(undefined)).toBe('undefined')
    })

    it('should handle arrays with mixed types', () => {
      expect(compactArrayString([1, 'hello', null])).toBe('[1, hello, ]')
    })
  })

  describe('formatArrayWithBoxDrawing', () => {
    it('should handle array format dimensions', () => {
      const nestedArr = [[1, 2], [3, 4]]
      const arrayShape = [2, 2]
      
      // This function is complex and involves box drawing characters
      // We'll test that it returns a string and doesn't throw
      const result = formatArrayWithBoxDrawing(nestedArr, arrayShape)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle object format dimensions', () => {
      const nestedArr = [[1, 2], [3, 4]]
      const arrayShape = { dimensions: [2, 2] }
      
      const result = formatArrayWithBoxDrawing(nestedArr, arrayShape)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle undefined arrayShape', () => {
      const nestedArr = [[1, 2], [3, 4]]
      
      const result = formatArrayWithBoxDrawing(nestedArr, undefined)
      expect(typeof result).toBe('string')
    })

    it('should handle empty arrays', () => {
      const result = formatArrayWithBoxDrawing([], [])
      expect(typeof result).toBe('string')
    })

    it('should handle 1D arrays', () => {
      const nestedArr = [1, 2, 3, 4]
      const arrayShape = [4]
      
      const result = formatArrayWithBoxDrawing(nestedArr, arrayShape)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle large arrays gracefully', () => {
      const large = Array(1000).fill(0).map((_, i) => i)
      const result = formatArrayWithBoxDrawing(large, [1000])
      
      expect(typeof result).toBe('string')
      // Should return a formatted string representation
      expect(result.length).toBeGreaterThan(0)
    })
  })
})
