import { useState, useEffect } from 'react'
import { containsMouseVariables } from '../utils/queryUtils'

export const useLiveMode = (executeQuery, query, mousePosRef, endLiveModeSession) => {
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [liveInterval, setLiveInterval] = useState(null)
  const [liveTimeout, setLiveTimeout] = useState(null)
  const [liveModeForever, setLiveModeForever] = useState(true) // Default to forever

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
      setIsLiveMode(false)
      
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
      
      // Execute initial query with live mode options
      executeQuery(null, null, mousePosRef, query, { 
        isLiveMode: true, 
        channelHint: 'fast' 
      })
      
      const interval = setInterval(() => {
        executeQuery(null, mousePosRef.current, mousePosRef, query, { 
          isLiveMode: true, 
          channelHint: 'fast' 
        })
      }, 100) // 10 FPS for smooth live updates
      
      setLiveInterval(interval)

      // If not forever mode, set a 10-second timeout
      if (!liveModeForever) {
        const timeout = setTimeout(() => {
          if (interval) {
            clearInterval(interval)
            setLiveInterval(null)
          }
          setIsLiveMode(false)
          
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
    }
  }, [liveInterval, liveTimeout])

  return {
    isLiveMode,
    toggleLiveMode,
    liveModeForever,
    setLiveModeForever
  }
}
