import React from 'react'

const QueryHistory = ({ history, setQuery }) => {
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">🕒</span>
          Query History
        </h3>
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">No queries executed yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <span className="text-2xl mr-2">🕒</span>
        Query History
        <span className="ml-2 text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
          {history.length}
        </span>
      </h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {history.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-indigo-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all duration-200 cursor-pointer group"
            onClick={() => setQuery(item.query)}
          >
            <div className="flex-1 min-w-0">
              <div className="font-mono text-sm text-gray-800 group-hover:text-indigo-700 truncate flex items-center space-x-2">
                <span>{item.query}</span>
                {item.isLiveMode && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    🔴 Live Mode
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 group-hover:text-indigo-600 flex items-center space-x-2">
                {item.isLiveMode ? (
                  <>
                    <span>Started: {item.timestamp}</span>
                    {item.endTime && (
                      <>
                        <span>•</span>
                        <span>Ended: {item.endTime}</span>
                      </>
                    )}
                    {!item.endTime && item.latestTimestamp && (
                      <>
                        <span>•</span>
                        <span>Last: {item.latestTimestamp}</span>
                        <span className="inline-flex items-center animate-pulse">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        </span>
                      </>
                    )}
                    {item.executionCount && (
                      <>
                        <span>•</span>
                        <span className="px-1 rounded text-xs bg-purple-100 text-purple-600">
                          {item.executionCount} executions
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  <span>{item.timestamp}</span>
                )}
                <span>•</span>
                <span>{item.result.success ? '✓ Success' : '✗ Failed'}</span>
                {item.channel && (
                  <>
                    <span>•</span>
                    <span className={`px-1 rounded text-xs ${
                      item.channel === 'fast' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {item.channel === 'fast' ? 'WS' : 'HTTP'}
                    </span>
                  </>
                )}
              </div>
            </div>
            <button className="ml-2 text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-sm">↻</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default QueryHistory
