import { useState, useEffect } from 'react'

const TimeDebugger = () => {
  const [timeInfo, setTimeInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTimeDebug = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:8080/api/debug/time')
      
      if (response.ok) {
        const data = await response.json()
        console.log('Time debug data:', data)
        setTimeInfo(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch time debug information')
      }
    } catch (err) {
      console.error('Error fetching time debug:', err)
      setError('Failed to connect to backend')
    } finally {
      setLoading(false)
    }
  }

  // Format the time information for display
  const formatTimeInfo = () => {
    if (!timeInfo) return null
    
    const rows = [
      { label: 'Raw Response', value: String(timeInfo.rawResponse) },
      { label: 'Response Type', value: timeInfo.responseType },
      { label: 'ToString', value: timeInfo.toString },
      { label: 'System Time', value: new Date(timeInfo.currentSystemTime).toLocaleTimeString() },
      { label: 'Formatted System Time', value: timeInfo.formattedSystemTime },
      { label: 'As Milliseconds since midnight', value: timeInfo.asMilliseconds || 'N/A' },
      { label: 'As Nanoseconds since midnight', value: timeInfo.asNanoseconds || 'N/A' },
      { label: 'System Milliseconds since midnight', value: `${timeInfo.systemTimeMillis} (${new Date(timeInfo.systemTimeMillis).toLocaleTimeString().split(' ')[0]})` }
    ]
    
    return (
      <div className="grid grid-cols-1 gap-2">
        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-2 border-b border-gray-200 py-2">
            <span className="font-medium text-gray-700">{row.label}:</span>
            <span className="font-mono text-gray-600">{row.value}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Time (.z.t) Debug</h3>
        <button
          onClick={fetchTimeDebug}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Loading...' : 'Fetch Time Debug'}
        </button>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {timeInfo && (
        <div className="mt-4">
          {formatTimeInfo()}
        </div>
      )}
      
      <div className="mt-4 p-4 bg-gray-50 rounded-lg text-gray-600 text-sm">
        <p>This debug panel helps diagnose issues with the <code className="bg-gray-200 px-1 py-0.5 rounded">.z.t</code> time query in Q.</p>
      </div>
    </div>
  )
}

export default TimeDebugger
