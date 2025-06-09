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

  // If there's visual content, show it with pixel-perfect styling
  if (shouldShowCanvas) {
    return (
      <div className="flex justify-center bg-console-dark p-2">
        <div className="pixel-canvas">
          <ArrayCanvas 
            ref={ref}
            data={result.data} 
            arrayShape={result.arrayShape}
            maxCanvasSize={canvasSize}
          />
        </div>
      </div>
    )
  }

  // If canvas is empty and collapsed, show retro minimal view
  if (isCollapsed) {
    return (
      <div className="flex items-center justify-between p-3 bg-console-dark border border-console-border">
        <div className="flex items-center space-x-3">
          <div className="text-lg font-mono text-console-neon">█▓</div>
          <div>
            <h3 className="text-xs font-mono text-console-text">DISPLAY BUFFER</h3>
            <p className="text-xs font-mono text-console-dim">READY FOR 2D-4D ARRAYS</p>
          </div>
        </div>
        <button
          onClick={() => setIsCollapsed(false)}
          className="console-btn small"
        >
          EXPAND
        </button>
      </div>
    )
  }

  // If canvas is empty and expanded, show full retro placeholder
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-mono text-console-neon flex items-center space-x-2">
          <span>►</span>
          <span>DISPLAY BUFFER ACTIVE</span>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="console-btn small"
        >
          COLLAPSE
        </button>
      </div>
      
      <div className="flex items-center justify-center h-64 bg-console-dark border border-console-border relative">
        {/* Retro CRT noise pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23${process.env.NODE_ENV === 'development' ? '83769c' : '83769c'}' fill-opacity='0.1' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
        
        <div className="text-center relative z-10">
          <div className="text-4xl mb-4 font-mono text-console-dim">
            ▓▓▓
          </div>
          <div className="text-xs font-mono text-console-neon mb-2">CANVAS INITIALIZED</div>
          <div className="text-xs font-mono text-console-dim max-w-md">
            EXECUTE Q EXPRESSION WITH 2D-4D ARRAYS
          </div>
          <div className="text-xs font-mono text-console-dim mt-1">
            TRY DEMO CARTRIDGES FOR EXAMPLES
          </div>
          
          {/* Blinking cursor */}
          <div className="mt-4 flex justify-center">
            <span className="text-console-neon animate-pulse font-mono">█</span>
          </div>
        </div>
      </div>
    </div>
  )
})

CanvasDisplay.displayName = 'CanvasDisplay'

export default CanvasDisplay
