import { useState, useEffect, useRef, useCallback } from 'react'

export const useMousePosition = (canvasRef = null) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const mousePosRef = useRef({ x: 0, y: 0 })
  
  // Performance optimization: reduce throttling to align with live mode updates
  const lastUpdateTime = useRef(0)
  const updateThrottle = 8 // Reduced from 16ms to 8ms (~120 FPS max for better responsiveness)
  const pendingUpdate = useRef(false)
  
  // Cache canvas rect to avoid repeated getBoundingClientRect calls
  const canvasRect = useRef(null)
  const lastCanvasRectUpdate = useRef(0)
  const canvasRectCacheTime = 500 // Reduced from 1000ms to 500ms for more responsive updates
  
  // Add a high-frequency ref update that bypasses React state throttling
  const immediateMousePos = useRef({ x: 0, y: 0 })
  
  const updateCanvasRect = useCallback(() => {
    const now = Date.now()
    if (canvasRef?.current && (now - lastCanvasRectUpdate.current > canvasRectCacheTime)) {
      canvasRect.current = canvasRef.current.getBoundingClientRect()
      lastCanvasRectUpdate.current = now
    }
  }, [canvasRef])
  
  const calculateMousePosition = useCallback((e) => {
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
    
    return newPos
  }, [canvasRef, updateCanvasRect])
  
  const handleMouseMove = useCallback((e) => {
    const now = Date.now()
    const newPos = calculateMousePosition(e)
    
    // Always update the immediate ref for live mode queries to prevent stale coordinates
    immediateMousePos.current = newPos
    mousePosRef.current = newPos
    
    // Throttle React state updates to prevent excessive re-renders
    if (now - lastUpdateTime.current < updateThrottle) {
      if (!pendingUpdate.current) {
        pendingUpdate.current = true
        requestAnimationFrame(() => {
          pendingUpdate.current = false
          // Use the most recent mouse position for state update
          setMousePos({ ...immediateMousePos.current })
        })
      }
      return
    }
    
    lastUpdateTime.current = now
    
    // Update React state
    setMousePos(newPos)
  }, [calculateMousePosition, updateThrottle])

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
