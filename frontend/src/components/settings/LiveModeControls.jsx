import React from 'react'
import { containsMouseVariables } from '../../utils/queryUtils'

const LiveModeControls = ({ isLiveMode, toggleLiveMode, query, setError, liveModeForever, setLiveModeForever }) => {
  const handleToggle = () => {
    try {
      toggleLiveMode()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="bg-white rounded-lg p-4 border">
      <h4 className="font-medium text-gray-700 mb-3 flex items-center">
        <span className="text-lg mr-2">🔴</span>
        Live Mode Controls
      </h4>
      <div className="space-y-3">
      
        {!containsMouseVariables(query.trim()) && (
          <p className="text-xs text-orange-600">
            ⚠️ Live mode requires mouseX or mouseY variables in your query
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Duration Mode</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => !isLiveMode && setLiveModeForever(false)}
              disabled={isLiveMode}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                !liveModeForever 
                  ? 'bg-blue-600 text-white' 
                  : isLiveMode
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              10s
            </button>
            <button
              onClick={() => !isLiveMode && setLiveModeForever(true)}
              disabled={isLiveMode}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                liveModeForever 
                  ? 'bg-blue-600 text-white' 
                  : isLiveMode
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              Forever
            </button>
          </div>
        </div>
        
        {isLiveMode && (
          <p className="text-xs text-gray-500">
            💡 Stop live mode to change duration settings
          </p>
        )}
        
        {isLiveMode && (
          <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
            ✓ Live mode active - canvas updates with mouse movement
            {liveModeForever ? ' (forever)' : ' (10 second duration)'}
          </div>
        )}
      </div>
    </div>
  )
}

export default LiveModeControls
