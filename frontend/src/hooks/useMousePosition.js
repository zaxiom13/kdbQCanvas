import { useState, useEffect, useRef, useCallback } from 'react'

export const useMousePosition = (canvasRef = null) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const mousePosRef = useRef({ x: 0, y: 0 })
  
  // Performance optimization: throttle mouse updates
  const lastUpdateTime = useRef(0)
  const updateThrottle = 16 // ~60 FPS max update rate
  const pendingUpdate = useRef(false)
  
  // Cache canvas rect to avoid repeated getBoundingClientRect calls
  const canvasRect = useRef(null)
  const lastCanvasRectUpdate = useRef(0)
  const canvasRectCacheTime = 1000 // Cache for 1 second
  
  const updateCanvasRect = useCallback(() => {
    const now = Date.now()
    if (canvasRef?.current && (now - lastCanvasRectUpdate.current > canvasRectCacheTime)) {
      canvasRect.current = canvasRef.current.getBoundingClientRect()
      lastCanvasRectUpdate.current = now
    }
  }, [canvasRef])
  
  const handleMouseMove = useCallback((e) => {
    const now = Date.now()
    
    // Throttle updates to prevent excessive re-renders
    if (now - lastUpdateTime.current < updateThrottle) {
      if (!pendingUpdate.current) {
        pendingUpdate.current = true
        requestAnimationFrame(() => {
          pendingUpdate.current = false
          handleMouseMove(e)
        })
      }
      return
    }
    
    lastUpdateTime.current = now
    
    let newPos = { x: e.clientX, y: e.clientY }
    
    // If we have a canvas reference, calculate relative coordinates
    if (canvasRef?.current) {
      // Update cached rect if needed
      updateCanvasRect()
      
      if (canvasRect.current) {
        // Calculate position relative to canvas using cached rect
        const relativeX = e.clientX - canvasRect.current.left
        const relativeY = e.clientY - canvasRect.current.top
        
        // Normalize to 0-1 range by dividing by canvas size
        const canvas = canvasRef.current
        const normalizedX = Math.max(0, Math.min(1, relativeX / canvas.width))
        const normalizedY = Math.max(0, Math.min(1, relativeY / canvas.height))
        
        newPos = { x: normalizedX, y: normalizedY }
      }
    }
    
    // Update both state and ref
    setMousePos(newPos)
    mousePosRef.current = newPos
  }, [canvasRef, updateCanvasRect])

  useEffect(() => {
    // Use passive event listener for better performance
    const options = { passive: true }
    document.addEventListener('mousemove', handleMouseMove, options)
    
    // Update canvas rect on window resize
    const handleResize = () => {
      canvasRect.current = null // Invalidate cache
      lastCanvasRectUpdate.current = 0
    }
    window.addEventListener('resize', handleResize, options)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
    }
  }, [handleMouseMove])
  
  // Initialize canvas rect if available
  useEffect(() => {
    if (canvasRef?.current) {
      updateCanvasRect()
    }
  }, [canvasRef, updateCanvasRect])

  return { mousePos, mousePosRef }
}
