import { useState, useEffect, useRef } from 'react'

export const useMousePosition = (canvasRef = null) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const mousePosRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      let newPos = { x: e.clientX, y: e.clientY }
      
      // If we have a canvas reference, calculate relative coordinates
      if (canvasRef?.current) {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        
        // Calculate position relative to canvas
        const relativeX = e.clientX - rect.left
        const relativeY = e.clientY - rect.top
        
        // Normalize to 0-1 range by dividing by canvas size
        const normalizedX = Math.max(0, Math.min(1, relativeX / canvas.width))
        const normalizedY = Math.max(0, Math.min(1, relativeY / canvas.height))
        
        newPos = { x: normalizedX, y: normalizedY }
      }
      
      setMousePos(newPos)
      mousePosRef.current = newPos
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [canvasRef])

  return { mousePos, mousePosRef }
}
