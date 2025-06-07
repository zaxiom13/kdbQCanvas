import { useState, useEffect, useRef } from 'react'
import { containsMouseVariables } from '../utils/queryUtils'

export const useLiveMode = (executeQuery, query, mousePosRef, endLiveModeSession) => {
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [liveInterval, setLiveInterval] = useState(null)
  const [liveTimeout, setLiveTimeout] = useState(null)
  const [liveModeForever, setLiveModeForever] = useState(true) // Default to forever
  
  // Performance optimization: reduce throttling for better responsiveness
  const frameRequestRef = useRef()
  const lastExecutionTime = useRef(0)
  const minExecutionInterval = 20 // Reduced from 50ms to 20ms (50 FPS max, up from 20 FPS)
  const pendingExecution = useRef(false)
  
  // Use ref to track live mode state for animation frames
  const isLiveModeRef = useRef(false)
  
  // Track mouse position at query execution time to prevent stale coordinates
  const executionMousePos = useRef({ x: 0, y: 0 })

  const executeThrottledQuery = () => {
    const now = performance.now()
    
    // Skip if we've executed too recently or if there's already a pending execution
    if (now - lastExecutionTime.current < minExecutionInterval || pendingExecution.current) {
      return
    }
    
    pendingExecution.current = true
    lastExecutionTime.current = now
    
    // Capture fresh mouse position at execution time to prevent jumps
    const freshMousePos = { ...mousePosRef.current }
    executionMousePos.current = freshMousePos
    
    // Execute query asynchronously to avoid blocking the animation frame
    Promise.resolve().then(async () => {
      try {
        await executeQuery(null, freshMousePos, mousePosRef, query, { 
          isLiveMode: true, 
          channelHint: 'fast' 
        })
      } catch (error) {
        // Only log non-throttling errors to reduce console spam
        if (!error.message?.includes('throttled')) {
          console.error('Live mode query execution error:', error)
        }
      } finally {
        pendingExecution.current = false
      }
    })
  }

  const scheduleNextExecution = () => {
    // Use ref instead of state to ensure consistency across animation frames
    if (isLiveModeRef.current) {
      frameRequestRef.current = requestAnimationFrame(() => {
        executeThrottledQuery()
        scheduleNextExecution() // Schedule next frame
      })
    }
  }

  const toggleLiveMode = () => {
    if (isLiveMode) {
      // Stop live mode
      if (liveInterval) {
        clearInterval(liveInterval)
        setLiveInterval(null)
      }
      if (liveTimeout) {
        clearTimeout(liveTimeout)
        setLiveTimeout(null)
      }
      if (frameRequestRef.current) {
        cancelAnimationFrame(frameRequestRef.current)
        frameRequestRef.current = null
      }
      
      setIsLiveMode(false)
      isLiveModeRef.current = false // Update ref
      pendingExecution.current = false
      
      // Mark the end of live mode session in history
      if (endLiveModeSession) {
        endLiveModeSession()
      }
    } else {
      // Start live mode
      if (!containsMouseVariables(query.trim())) {
        throw new Error('Live mode requires mouseX or mouseY variables in your query')
      }
      
      setIsLiveMode(true)
      isLiveModeRef.current = true // Update ref
      lastExecutionTime.current = 0 // Reset throttling
      
      // Capture initial mouse position
      executionMousePos.current = { ...mousePosRef.current }
      
      // Execute initial query with live mode options
      executeQuery(null, executionMousePos.current, mousePosRef, query, { 
        isLiveMode: true, 
        channelHint: 'fast' 
      })
      
      // Use requestAnimationFrame for smooth, throttled updates
      scheduleNextExecution()

      // If not forever mode, set a 10-second timeout
      if (!liveModeForever) {
        const timeout = setTimeout(() => {
          if (frameRequestRef.current) {
            cancelAnimationFrame(frameRequestRef.current)
            frameRequestRef.current = null
          }
          setIsLiveMode(false)
          isLiveModeRef.current = false // Update ref
          pendingExecution.current = false
          
          // Mark the end of live mode session in history
          if (endLiveModeSession) {
            endLiveModeSession()
          }
        }, 10000) // 10 seconds
        
        setLiveTimeout(timeout)
      }
    }
  }

  useEffect(() => {
    return () => {
      if (liveInterval) {
        clearInterval(liveInterval)
      }
      if (liveTimeout) {
        clearTimeout(liveTimeout)
      }
      if (frameRequestRef.current) {
        cancelAnimationFrame(frameRequestRef.current)
      }
    }
  }, [liveInterval, liveTimeout])

  return {
    isLiveMode,
    toggleLiveMode,
    liveModeForever,
    setLiveModeForever
  }
}
