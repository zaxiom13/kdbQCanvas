import { useState, useEffect } from 'react'
import { containsMouseVariables } from '../utils/queryUtils'

export const useLiveMode = (executeQuery, query, mousePosRef) => {
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
    } else {
      // Start live mode
      if (!containsMouseVariables(query.trim())) {
        throw new Error('Live mode requires mouseX or mouseY variables in your query')
      }
      
      setIsLiveMode(true)
      executeQuery()
      
      const interval = setInterval(() => {
        executeQuery(null, mousePosRef.current)
      }, 100)
      
      setLiveInterval(interval)

      // If not forever mode, set a 10-second timeout
      if (!liveModeForever) {
        const timeout = setTimeout(() => {
          if (interval) {
            clearInterval(interval)
            setLiveInterval(null)
          }
          setIsLiveMode(false)
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
