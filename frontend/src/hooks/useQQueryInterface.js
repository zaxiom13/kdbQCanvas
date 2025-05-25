import { useState } from 'react'
import { useMousePosition } from './useMousePosition'
import { useConnectionStatus } from './useConnectionStatus'
import { useQueryExecution } from './useQueryExecution'
import { useLiveMode } from './useLiveMode'

export const useQQueryInterface = (canvasRef) => {
  const [query, setQuery] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [canvasSize, setCanvasSize] = useState(400)

  const { mousePos, mousePosRef } = useMousePosition(canvasRef)
  const connectionStatus = useConnectionStatus()
  const { loading, error, result, history, executeQuery, setError } = useQueryExecution()
  
  const wrappedExecuteQuery = (queryToExecute, forceMousePos) => {
    executeQuery(queryToExecute, forceMousePos, mousePosRef, query)
  }

  const { isLiveMode, toggleLiveMode, liveModeForever, setLiveModeForever } = useLiveMode(wrappedExecuteQuery, query, mousePosRef)

  return {
    // State
    query,
    setQuery,
    loading,
    error,
    setError,
    result,
    history,
    connectionStatus,
    isLiveMode,
    mousePos,
    showSettings,
    setShowSettings,
    canvasSize,
    setCanvasSize,
    liveModeForever,
    setLiveModeForever,
    
    // Actions
    executeQuery: wrappedExecuteQuery,
    toggleLiveMode
  }
}
