import { useState, useEffect } from 'react'
import { containsMouseVariables } from '../utils/queryUtils'
import { debugQResponse } from '../utils/debugUtils'
import { DualBandCommunicationManager } from '../utils/DualBandCommunicationManager'

interface QueryOptions {
  isLiveMode?: boolean
  channelHint?: string
  [key: string]: any
}

interface MousePosRef {
  current: { x: number; y: number }
}

interface HistoryItem {
  query: string
  baseQuery?: string
  result: any
  timestamp: string
  latestTimestamp?: string
  channel?: string
  isLiveMode?: boolean
  executionCount?: number
  endTime?: string
}

export const useQueryExecution = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [communicationManager, setCommunicationManager] = useState<DualBandCommunicationManager | null>(null)
  const [channelStatus, setChannelStatus] = useState({ standard: false, fast: false })

  // Initialize communication manager
  useEffect(() => {
    const initCommunication = async () => {
      const manager = new DualBandCommunicationManager()
      
      // Set up connection status listener
      manager.setConnectionStatusChangeListener((channel: string, isConnected: boolean, error: string | null) => {
        setChannelStatus(prev => ({
          ...prev,
          [channel]: isConnected
        }))
        
        if (error) {
          console.warn(`${channel} channel error:`, error)
        }
      })
      
      try {
        await manager.initialize()
        setCommunicationManager(manager)
        
        // Update initial status
        const status = manager.getConnectionStatus()
        setChannelStatus({
          standard: status.standard.isConnected,
          fast: status.fast.isConnected
        })
      } catch (error) {
        console.error('Failed to initialize communication manager:', error)
        setError('Failed to initialize communication channels')
      }
    }
    
    initCommunication()
    
    return () => {
      if (communicationManager) {
        communicationManager.disconnect()
      }
    }
  }, [])

  const executeQuery = async (queryToExecute: string | null = null, forceMousePos: { x: number; y: number } | null = null, mousePosRef: MousePosRef, query: string, options: QueryOptions = {}) => {
    const queryText = (typeof queryToExecute === 'string' ? queryToExecute : null) || query.trim()
    if (!queryText) return

    if (!communicationManager) {
      setError('Communication manager not initialized')
      return
    }

    console.log('Executing query:', queryText)
    console.log('Query options received:', options)
    setLoading(true)
    setError(null)

    try {
      let finalQuery = queryText
      if (containsMouseVariables(queryText)) {
        const currentMousePos = forceMousePos || mousePosRef.current
        finalQuery = `mouseX:${currentMousePos.x}; mouseY:${currentMousePos.y}; ${queryText}`
      }
      console.log('Final query to send:', finalQuery)

      // Determine query options
      const queryOptions = {
        ...options,
        isLiveMode: options.isLiveMode || false,
        channelHint: options.channelHint || communicationManager.selectOptimalChannel(finalQuery, options)
      }

      console.log('Final queryOptions:', queryOptions)

      console.log(`Executing on ${queryOptions.channelHint} channel`)

      // === COMPREHENSIVE FINAL QUERY LOGGING ===
      console.group('🚀 FINAL QUERY TO BACKEND')
      console.log('📝 Original query text:', queryText)
      console.log('🎯 Final processed query:', finalQuery)
      console.log('🏷️ Query contains mouse variables:', containsMouseVariables(queryText))
      if (containsMouseVariables(queryText)) {
        const currentMousePos = forceMousePos || mousePosRef.current
        console.log('🖱️ Mouse position:', currentMousePos)
      }
      console.log('⚙️ Query options:', queryOptions)
      console.log('📡 Channel:', queryOptions.channelHint)
      console.log('🔄 Live mode:', queryOptions.isLiveMode)
      console.log('⏰ Timestamp:', new Date().toISOString())
      console.groupEnd()

      const data = await communicationManager.executeQuery(finalQuery, queryOptions)
      console.log('Query response:', data)
      
      setResult(data)
      debugQResponse(query.trim(), data)
      
      if (query.trim() === '.z.t') {
        console.log('Special debug for .z.t query:', {
          success: data.success,
          dataType: data.dataType,
          data: data.data,
          error: data.error
        })
      }
      
      // Handle history differently for live mode
      if (queryOptions.isLiveMode) {
        setHistory(prev => {
          console.log('Live mode query execution:', {
            queryText,
            isLiveMode: queryOptions.isLiveMode,
            historyLength: prev.length,
            mostRecentEntry: prev[0]
          })
          // Find the most recent active live mode entry for the same base query
          const activeLiveModeIndex = prev.findIndex(item => 
            item.isLiveMode && 
            item.baseQuery === queryText && 
            !item.endTime
          )
          
          console.log('Active live mode entry found at index:', activeLiveModeIndex)
          
          if (activeLiveModeIndex !== -1) {
            // Update existing live mode entry with latest timestamp
            const updatedHistory = [...prev]
            updatedHistory[activeLiveModeIndex] = {
              ...updatedHistory[activeLiveModeIndex],
              latestTimestamp: new Date().toLocaleTimeString(),
              result: data, // Update with latest result
              executionCount: (updatedHistory[activeLiveModeIndex].executionCount || 1) + 1
            }
            console.log('Updated live mode entry:', updatedHistory[activeLiveModeIndex])
            return updatedHistory
          } else {
            // Start new live mode session
            console.log('Starting new live mode session for:', queryText)
            return [{
              query: queryText, // Display query (base query without mouse coords)
              baseQuery: queryText, // Store base query for comparison
              result: data,
              timestamp: new Date().toLocaleTimeString(),
              latestTimestamp: new Date().toLocaleTimeString(),
              channel: queryOptions.channelHint,
              isLiveMode: true,
              executionCount: 1
            }, ...prev.slice(0, 9)]
          }
        })
      } else {
        // Regular query execution
        setHistory(prev => [{
          query: queryText,
          result: data,
          timestamp: new Date().toLocaleTimeString(),
          channel: queryOptions.channelHint
        }, ...prev.slice(0, 9)])
      }

    } catch (err) {
      console.error('Query execution error:', err)
      setError(err instanceof Error ? err.message : 'Failed to execute query')
    } finally {
      setLoading(false)
    }
  }

  const endLiveModeSession = () => {
    setHistory(prev => {
      const mostRecent = prev[0]
      if (mostRecent && mostRecent.isLiveMode && !mostRecent.endTime) {
        // Mark the end time for the live mode session
        return [{
          ...mostRecent,
          endTime: new Date().toLocaleTimeString()
        }, ...prev.slice(1)]
      }
      return prev
    })
  }

  return {
    loading,
    error,
    result,
    history,
    executeQuery,
    endLiveModeSession,
    setError,
    channelStatus,
    communicationManager
  }
}
