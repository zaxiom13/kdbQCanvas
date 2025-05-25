import React from 'react'
import { containsMouseVariables } from '../../utils/queryUtils'

const QueryEditor = ({ query, setQuery, loading, executeQuery, isLiveMode, toggleLiveMode }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      executeQuery()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <span className="text-2xl mr-2">⚡</span>
        Q Expression Editor
      </h3>
      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your Q expression here... (e.g., 8 8#64?1.0 for a random matrix)"
            className="w-full p-4 border rounded-lg font-mono text-sm resize-none h-24 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={loading}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            Ctrl+Enter to execute
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={executeQuery}
            disabled={loading || !query.trim()}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {loading && !isLiveMode ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Executing...</span>
              </>
            ) : (
              <>
                <span>▶</span>
                <span>Execute Q Expression</span>
              </>
            )}
          </button>
          <button
            onClick={toggleLiveMode}
            disabled={!containsMouseVariables(query.trim())}
            className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              isLiveMode 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isLiveMode ? 'Stop Live Mode' : 'Start Live Mode'}
          >
            <span>{isLiveMode ? '⏹' : '🔴'}</span>
            <span>{isLiveMode ? 'Stop' : 'Live'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default QueryEditor
