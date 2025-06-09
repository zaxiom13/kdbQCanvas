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
  const { loading, error, result, history, executeQuery, endLiveModeSession, setError, channelStatus, communicationManager } = useQueryExecution()
  
  const wrappedExecuteQuery = (queryToExecute = null, forceMousePos = null, mousePosRefParam = null, queryParam = null, options = {}) => {
    // Use the provided parameters or fall back to the hook's state
    const actualMousePosRef = mousePosRefParam || mousePosRef
    const actualQuery = queryParam || query
    executeQuery(queryToExecute, forceMousePos, actualMousePosRef, actualQuery, options)
  }

  const { isLiveMode, toggleLiveMode, liveModeForever, setLiveModeForever } = useLiveMode(wrappedExecuteQuery, query, mousePosRef, endLiveModeSession)

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
    channelStatus,
    communicationManager,
    
    // Actions
    executeQuery: wrappedExecuteQuery,
    toggleLiveMode
  }
}
