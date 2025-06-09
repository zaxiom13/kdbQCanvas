import { useState, useEffect } from 'react'

export const useConnectionStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState('unknown')

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/health')
        
        if (response.ok) {
          const data = await response.json()
          setConnectionStatus(data.qProcessRunning ? 'connected' : 'disconnected')
          console.log('Connection status:', data)
        } else {
          setConnectionStatus('error')
          console.error('Failed to check connection:', response.statusText)
        }
      } catch (err) {
        setConnectionStatus('unavailable')
        console.error('Connection check error:', err)
      }
    }
    
    checkConnection()
    const interval = setInterval(checkConnection, 10000)
    
    return () => clearInterval(interval)
  }, [])

  return connectionStatus
}
