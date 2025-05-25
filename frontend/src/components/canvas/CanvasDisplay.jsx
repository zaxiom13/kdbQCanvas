import React, { useState, useEffect, forwardRef } from 'react'
import ArrayCanvas from '../ArrayCanvas'

const CanvasDisplay = forwardRef(({ result, canvasSize }, ref) => {
  const [isCollapsed, setIsCollapsed] = useState(true)
  
  const shouldShowCanvas = result && result.success && 
    Array.isArray(result.data) && 
    result.arrayShape && 
    result.arrayShape.dimensions && 
    result.arrayShape.dimensions.length >= 2 && 
    result.arrayShape.dimensions.length <= 4

  // Auto-expand when visual content becomes available
  useEffect(() => {
    if (shouldShowCanvas) {
      setIsCollapsed(false)
    }
  }, [shouldShowCanvas])

  // If there's visual content, show it
  if (shouldShowCanvas) {
    return (
      <div className="flex justify-center">
        <ArrayCanvas 
          ref={ref}
          data={result.data} 
          arrayShape={result.arrayShape}
          maxCanvasSize={canvasSize}
        />
      </div>
    )
  }

  // If canvas is empty and collapsed, show minimal view
  if (isCollapsed) {
    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🎨</div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Visual Output Area</h3>
            <p className="text-xs text-gray-500">Ready for 2D-4D array visualization</p>
          </div>
        </div>
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          <span>Expand</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    )
  }

  // If canvas is empty and expanded, show full placeholder
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-700">Visual Output Area</h3>
        <button
          onClick={() => setIsCollapsed(true)}
          className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          <span>Collapse</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Canvas Ready</h3>
          <p className="text-gray-500 max-w-md">
            Execute a Q expression that generates 2D-4D arrays to see visual output here.
            Try the predefined queries below to get started!
          </p>
        </div>
      </div>
    </div>
  )
})

CanvasDisplay.displayName = 'CanvasDisplay'

export default CanvasDisplay
