import { useEffect, useRef, useState, forwardRef } from 'react'

const ArrayCanvas = forwardRef(({ data, arrayShape, maxCanvasSize = 400 }, ref) => {
  const canvasRef = useRef(null)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [intervalId, setIntervalId] = useState(null)

  // Debug logging for mouse-based queries
  useEffect(() => {
    console.log('ArrayCanvas props debug:', {
      hasData: !!data,
      dataType: typeof data,
      dataLength: Array.isArray(data) ? data.length : 'not array',
      hasArrayShape: !!arrayShape,
      arrayShape: arrayShape,
      arrayShapeType: Array.isArray(arrayShape) ? 'array' : 'object',
      dimensions: Array.isArray(arrayShape) ? arrayShape : arrayShape?.dimensions,
      maxCanvasSize
    })
  }, [data, arrayShape, maxCanvasSize])

  // Forward the canvas ref to parent
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(canvasRef.current)
      } else {
        ref.current = canvasRef.current
      }
    }
  }, [ref])

  // Handle both object format {dimensions: [16, 16]} and array format [16, 16]
  const dimensions = Array.isArray(arrayShape) ? arrayShape : arrayShape?.dimensions
  
  const isGrayscale2D = dimensions?.length === 2
  const isColorImage = dimensions?.length === 3 && dimensions?.[2] === 3
  const isGrayscaleGif = dimensions?.length === 3 && dimensions?.[2] !== 3
  const isColorGif = dimensions?.length === 4 && dimensions?.[3] === 3

  useEffect(() => {
    if (!data || !arrayShape || !dimensions) {
      return
    }

    const dims = dimensions
    if (dims.length < 2 || dims.length > 4) {
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')

    if (isGrayscale2D) {
      renderGrayscale2D(ctx, data, dims)
    } else if (isColorImage) {
      renderColorImage(ctx, data, dims)
    } else if (isGrayscaleGif) {
      renderGrayscaleFrame(ctx, data, dims, currentFrame)
    } else if (isColorGif) {
      renderColorFrame(ctx, data, dims, currentFrame)
    }

  }, [data, arrayShape, currentFrame, maxCanvasSize])

  const renderGrayscale2D = (ctx, data, dims) => {
    const [rows, cols] = dims
    
    // Convert flat array to 2D if needed
    let matrix = data
    if (Array.isArray(data) && !Array.isArray(data[0])) {
      matrix = []
      for (let i = 0; i < rows; i++) {
        matrix.push(data.slice(i * cols, (i + 1) * cols))
      }
    }

    const { canvasWidth, canvasHeight, pixelWidth, pixelHeight } = calculateCanvasSize(rows, cols)
    setupCanvas(ctx.canvas, canvasWidth, canvasHeight)

    // Get normalization values
    const { minVal, maxVal, range } = getNormalizationValues(matrix, rows, cols)

    // Draw pixels
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (matrix[i] && matrix[i][j] !== undefined && matrix[i][j] !== null) {
          const value = Number(matrix[i][j])
          const normalized = range === 0 ? 0 : (value - minVal) / range
          const grayValue = Math.floor(normalized * 255)
          
          ctx.fillStyle = `rgb(${grayValue}, ${grayValue}, ${grayValue})`
          ctx.fillRect(j * pixelWidth, i * pixelHeight, pixelWidth, pixelHeight)
        } else {
          ctx.fillStyle = 'red'
          ctx.fillRect(j * pixelWidth, i * pixelHeight, pixelWidth, pixelHeight)
        }
      }
    }
  }

  const renderColorImage = (ctx, data, dims) => {
    const [rows, cols, channels] = dims
    
    console.log('Color image debug:', {
      dims,
      dataLength: data.length,
      dataSample: data.slice(0, 12),
      expectedSize: rows * cols * channels
    })
    
    // Convert flat array to 3D if needed
    let matrix = data
    if (Array.isArray(data) && typeof data[0] === 'number') {
      matrix = []
      for (let i = 0; i < rows; i++) {
        matrix[i] = []
        for (let j = 0; j < cols; j++) {
          matrix[i][j] = []
          for (let c = 0; c < channels; c++) {
            const idx = i * cols * channels + j * channels + c
            matrix[i][j][c] = data[idx] || 0
          }
        }
      }
    }

    const { canvasWidth, canvasHeight, pixelWidth, pixelHeight } = calculateCanvasSize(rows, cols)
    setupCanvas(ctx.canvas, canvasWidth, canvasHeight)

    // Find min/max for normalization
    let allValues = []
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        for (let c = 0; c < channels; c++) {
          if (matrix[i] && matrix[i][j] && matrix[i][j][c] !== undefined) {
            allValues.push(Number(matrix[i][j][c]))
          }
        }
      }
    }
    
    console.log('Color image normalization:', {
      allValuesLength: allValues.length,
      min: Math.min(...allValues),
      max: Math.max(...allValues)
    })
    
    const minVal = Math.min(...allValues)
    const maxVal = Math.max(...allValues)
    const range = maxVal - minVal

    // Draw pixels
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (matrix[i] && matrix[i][j]) {
          const r = range === 0 ? 128 : Math.floor(((Number(matrix[i][j][0]) - minVal) / range) * 255)
          const g = range === 0 ? 128 : Math.floor(((Number(matrix[i][j][1]) - minVal) / range) * 255)
          const b = range === 0 ? 128 : Math.floor(((Number(matrix[i][j][2]) - minVal) / range) * 255)
          
          // Clamp values
          const rClamped = Math.max(0, Math.min(255, r))
          const gClamped = Math.max(0, Math.min(255, g))
          const bClamped = Math.max(0, Math.min(255, b))
          
          ctx.fillStyle = `rgb(${rClamped}, ${gClamped}, ${bClamped})`
          ctx.fillRect(j * pixelWidth, i * pixelHeight, pixelWidth, pixelHeight)
        }
      }
    }
  }

  const renderGrayscaleFrame = (ctx, data, dims, frameIndex) => {
    const [frames, rows, cols] = dims
    
    if (frameIndex >= frames) return

    // Extract frame data
    const frameSize = rows * cols
    const frameStart = frameIndex * frameSize
    const frameData = data.slice(frameStart, frameStart + frameSize)
    
    // Convert to 2D matrix
    let matrix = []
    for (let i = 0; i < rows; i++) {
      matrix.push(frameData.slice(i * cols, (i + 1) * cols))
    }

    const { canvasWidth, canvasHeight, pixelWidth, pixelHeight } = calculateCanvasSize(rows, cols)
    setupCanvas(ctx.canvas, canvasWidth, canvasHeight)

    const { minVal, maxVal, range } = getNormalizationValues(matrix, rows, cols)

    // Draw pixels
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (matrix[i] && matrix[i][j] !== undefined && matrix[i][j] !== null) {
          const value = Number(matrix[i][j])
          const normalized = range === 0 ? 0 : (value - minVal) / range
          const grayValue = Math.floor(normalized * 255)
          
          ctx.fillStyle = `rgb(${grayValue}, ${grayValue}, ${grayValue})`
          ctx.fillRect(j * pixelWidth, i * pixelHeight, pixelWidth, pixelHeight)
        }
      }
    }
  }

  const renderColorFrame = (ctx, data, dims, frameIndex) => {
    const [frames, rows, cols, channels] = dims
    
    if (frameIndex >= frames) return

    // Extract frame data - handle nested array structure from Q
    let frameData = []
    
    console.log('Color frame data structure debug:', {
      frameIndex,
      dataType: typeof data,
      isArray: Array.isArray(data),
      dataLength: data?.length,
      firstElementType: typeof data?.[0],
      firstElementIsArray: Array.isArray(data?.[0]),
      firstElementLength: data?.[0]?.length,
      secondElementType: typeof data?.[1],
      sampleStructure: {
        frame0Sample: data?.[0]?.slice?.(0, 2),
        frame1Sample: data?.[1]?.slice?.(0, 2)
      },
      deepStructure: {
        frame0_row0_sample: data?.[0]?.[0]?.slice?.(0, 2),
        frame0_row0_col0: data?.[0]?.[0]?.[0]
      }
    })
    
    if (Array.isArray(data)) {
      if (Array.isArray(data[0])) {
        // Data comes from Q as nested 4D structure: data[frame][row][col][channel]
        if (frameIndex < data.length && data[frameIndex]) {
          const currentFrame = data[frameIndex]
          
          // Flatten the 3D frame data (rows x cols x channels) into 1D array
          frameData = []
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              for (let channel = 0; channel < channels; channel++) {
                // Extract RGB value from nested structure
                const value = currentFrame?.[row]?.[col]?.[channel]
                frameData.push(typeof value === 'number' ? value : 0)
              }
            }
          }
        }
      } else {
        // Data is already flat - use original slicing logic
        const frameSize = rows * cols * channels
        const frameStart = frameIndex * frameSize
        frameData = data.slice(frameStart, frameStart + frameSize)
      }
    }
    
    console.log('Color frame debug:', {
      frameIndex,
      frameDataLength: frameData.length,
      frameDataSample: frameData.slice(0, 12),
      dims,
      expectedFrameSize: rows * cols * channels
    })
    
    // Convert to 3D matrix - fix the indexing
    let matrix = []
    for (let i = 0; i < rows; i++) {
      matrix[i] = []
      for (let j = 0; j < cols; j++) {
        matrix[i][j] = []
        for (let c = 0; c < channels; c++) {
          // Correct indexing within the frame data
          const idx = i * cols * channels + j * channels + c
          matrix[i][j][c] = frameData[idx] !== undefined ? frameData[idx] : 0
        }
      }
    }

    const { canvasWidth, canvasHeight, pixelWidth, pixelHeight } = calculateCanvasSize(rows, cols)
    setupCanvas(ctx.canvas, canvasWidth, canvasHeight)

    // Find min/max for normalization from frame data only
    let allValues = []
    frameData.forEach(val => {
      if (typeof val === 'number' && !isNaN(val)) {
        allValues.push(Number(val))
      }
    })
    
    console.log('Color frame normalization:', {
      allValuesLength: allValues.length,
      sampleValues: allValues.slice(0, 10),
      min: Math.min(...allValues),
      max: Math.max(...allValues)
    })
    
    if (allValues.length === 0) {
      console.warn('No valid values found in frame data')
      return
    }
    
    const minVal = Math.min(...allValues)
    const maxVal = Math.max(...allValues)
    const range = maxVal - minVal

    // Draw pixels
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (matrix[i] && matrix[i][j]) {
          const rVal = Number(matrix[i][j][0]) || 0
          const gVal = Number(matrix[i][j][1]) || 0
          const bVal = Number(matrix[i][j][2]) || 0
          
          const r = range === 0 ? 128 : Math.floor(((rVal - minVal) / range) * 255)
          const g = range === 0 ? 128 : Math.floor(((gVal - minVal) / range) * 255)
          const b = range === 0 ? 128 : Math.floor(((bVal - minVal) / range) * 255)
          
          // Clamp values to 0-255
          const rClamped = Math.max(0, Math.min(255, r))
          const gClamped = Math.max(0, Math.min(255, g))
          const bClamped = Math.max(0, Math.min(255, b))
          
          ctx.fillStyle = `rgb(${rClamped}, ${gClamped}, ${bClamped})`
          ctx.fillRect(j * pixelWidth, i * pixelHeight, pixelWidth, pixelHeight)
        }
      }
    }
  }

  const calculateCanvasSize = (rows, cols) => {
    // Use the maxCanvasSize prop instead of fixed 800px
    const canvasWidth = maxCanvasSize
    const canvasHeight = maxCanvasSize
    const pixelWidth = canvasWidth / cols
    const pixelHeight = canvasHeight / rows

    return { canvasWidth, canvasHeight, pixelWidth, pixelHeight }
  }

  const setupCanvas = (canvas, width, height) => {
    canvas.width = width
    canvas.height = height
  }

  const getNormalizationValues = (matrix, rows, cols) => {
    let allValues = []
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (matrix[i] && matrix[i][j] !== undefined && matrix[i][j] !== null) {
          allValues.push(Number(matrix[i][j]))
        }
      }
    }
    
    const minVal = Math.min(...allValues)
    const maxVal = Math.max(...allValues)
    const range = maxVal - minVal

    return { minVal, maxVal, range }
  }

  // Auto-start animation for GIF types
  useEffect(() => {
    if (isGrayscaleGif || isColorGif) {
      const frames = dimensions?.[0] || 1
      const id = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % frames)
      }, 200) // 200ms per frame = 5 FPS
      setIntervalId(id)
      setIsPlaying(true)
      
      return () => {
        clearInterval(id)
      }
    }
  }, [isGrayscaleGif, isColorGif, dimensions])

  const handleFrameChange = (e) => {
    const newFrame = parseInt(e.target.value)
    setCurrentFrame(newFrame)
    
    // When manually changing frame, restart the animation from this frame
    if (intervalId) {
      clearInterval(intervalId)
      const frames = dimensions?.[0] || 1
      const id = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % frames)
      }, 200) // 200ms per frame = 5 FPS
      setIntervalId(id)
    }
  }

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [intervalId])

  if (!data || !arrayShape || !dimensions) {
    console.log('ArrayCanvas early return debug:', {
      hasData: !!data,
      hasArrayShape: !!arrayShape,
      hasDimensions: !!dimensions,
      arrayShapeType: Array.isArray(arrayShape) ? 'array' : 'object',
      arrayShape: arrayShape,
      dimensions: dimensions
    })
    return null
  }

  const dims = dimensions
  if (dims.length < 2 || dims.length > 4) {
    return null
  }

  // Calculate display values based on the type
  let displayRows, displayCols, totalFrames = 1
  
  if (isGrayscale2D) {
    [displayRows, displayCols] = dims
  } else if (isColorImage) {
    [displayRows, displayCols] = dims
  } else if (isGrayscaleGif) {
    [totalFrames, displayRows, displayCols] = dims
  } else if (isColorGif) {
    [totalFrames, displayRows, displayCols] = dims
  }

  // Calculate stats for display
  let allValues = []
  if (isGrayscale2D || isColorImage) {
    // For static images, use all data
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
  } else {
    // For GIFs, use current frame data only
    if (isGrayscaleGif) {
      const frameSize = displayRows * displayCols
      const frameStart = currentFrame * frameSize
      const frameData = data.slice(frameStart, frameStart + frameSize)
      frameData.forEach(val => {
        if (typeof val === 'number' && !isNaN(val)) {
          allValues.push(val)
        }
      })
    } else if (isColorGif) {
      const frameSize = displayRows * displayCols * 3
      const frameStart = currentFrame * frameSize
      const frameData = data.slice(frameStart, frameStart + frameSize)
      frameData.forEach(val => {
        if (typeof val === 'number' && !isNaN(val)) {
          allValues.push(val)
        }
      })
    }
  }
  
  const stats = allValues.length > 0 ? {
    min: Math.min(...allValues),
    max: Math.max(...allValues),
    avg: allValues.reduce((a, b) => a + b, 0) / allValues.length
  } : null

  const getVisualizationType = () => {
    if (isGrayscale2D) return "Grayscale Image"
    if (isColorImage) return "Color Image (RGB)"
    if (isGrayscaleGif) return "Grayscale Animation"
    if (isColorGif) return "Color Animation (RGB)"
    return "Unknown"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="text-2xl mr-2">
            {isColorImage || isColorGif ? '🎨' : '⬛'}
          </span>
          {getVisualizationType()}
        </h4>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            Data: {(isGrayscaleGif || isColorGif) ? `${totalFrames}×${displayRows}×${displayCols}` : `${displayRows}×${displayCols}`}
          </span>
          <span className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded-full">
            Canvas: {maxCanvasSize}×{maxCanvasSize}px
          </span>
        </div>
      </div>
      
      {/* Animation controls for GIFs */}
      {(isGrayscaleGif || isColorGif) && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
          <div className="flex items-center justify-center mb-3">
            <span className="text-sm font-medium text-gray-700">Frame {currentFrame + 1} of {totalFrames}</span>
          </div>
          <input
            type="range"
            min="0"
            max={totalFrames - 1}
            value={currentFrame}
            onChange={handleFrameChange}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(currentFrame / (totalFrames - 1)) * 100}%, #e5e7eb ${(currentFrame / (totalFrames - 1)) * 100}%, #e5e7eb 100%)`
            }}
          />
        </div>
      )}
      
      <div className="rounded-xl p-6 bg-white shadow-lg flex justify-center">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="rounded-lg shadow-md"
            style={{ imageRendering: 'pixelated' }}
          />
          {/* Canvas overlay for small arrays */}
          {displayRows <= 10 && displayCols <= 10 && (
            <div className="absolute top-0 left-0 text-xs text-gray-400 bg-white px-2 py-1 rounded-br-lg">
              {displayRows}×{displayCols}
            </div>
          )}
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <div className="text-sm text-gray-600">
          {isColorImage || isColorGif ? 'RGB channels normalized: 0 (black) → 1 (white)' : 'Values normalized: 0 (black) → 1 (white)'}
        </div>
        {stats && (
          <div className="flex justify-center space-x-6 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            <span><strong>Range:</strong> {stats.min} - {stats.max}</span>
            <span><strong>Avg:</strong> {stats.avg}</span>
            {(isGrayscaleGif || isColorGif) && (
              <span><strong>Frame:</strong> {currentFrame + 1}/{totalFrames}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
})

ArrayCanvas.displayName = 'ArrayCanvas'

export default ArrayCanvas
