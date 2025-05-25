import React from 'react'

const ConnectionStatus = ({ connectionStatus }) => {
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500'
      case 'disconnected': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected'
      case 'disconnected': return 'Q Process Not Running'
      case 'error': return 'Error'
      case 'unavailable': return 'Unavailable'
      default: return 'Unknown'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Connection Status</h3>
      <div className="flex items-center space-x-3 mb-4">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
        <span className="text-sm text-gray-600">{getStatusText()}</span>
      </div>
      <p className="text-xs text-gray-500">
        {connectionStatus !== 'connected' && 
          'Make sure your Kotlin backend is running on port 8080'}
        {connectionStatus === 'connected' &&
          'Ready to execute Q expressions'}
      </p>
    </div>
  )
}

export default ConnectionStatus
