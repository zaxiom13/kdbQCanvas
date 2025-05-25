import { useState } from 'react'
import { containsMouseVariables } from '../utils/queryUtils'
import { debugQResponse } from '../utils/debugUtils'

export const useQueryExecution = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])

  const executeQuery = async (queryToExecute = null, forceMousePos = null, mousePosRef, query) => {
    const queryText = (typeof queryToExecute === 'string' ? queryToExecute : null) || query.trim()
    if (!queryText) return

    console.log('Executing query:', queryText)
    setLoading(true)
    setError(null)

    try {
      let finalQuery = queryText
      if (containsMouseVariables(queryText)) {
        const currentMousePos = forceMousePos || mousePosRef.current
        finalQuery = `mouseX:${currentMousePos.x}; mouseY:${currentMousePos.y}; ${queryText}`
      }
      console.log('Final query to send:', finalQuery)

      const response = await fetch('http://localhost:8080/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: finalQuery }),
      })

      const data = await response.json()
      console.log('Query response:', data)
      
      if (response.ok) {
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
        
        setHistory(prev => [{
          query: queryText,
          result: data,
          timestamp: new Date().toLocaleTimeString()
        }, ...prev.slice(0, 9)])
      } else {
        console.error('Query execution failed:', data)
        setError(data.message || 'Failed to execute query')
      }
    } catch (err) {
      console.error('Backend connection error:', err)
      setError('Failed to connect to backend. Make sure the server is running.')
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    result,
    history,
    executeQuery,
    setError
  }
}
