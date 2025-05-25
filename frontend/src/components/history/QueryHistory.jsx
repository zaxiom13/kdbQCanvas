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
              <div className="font-mono text-sm text-gray-800 group-hover:text-indigo-700 truncate">
                {item.query}
              </div>
              <div className="text-xs text-gray-500 group-hover:text-indigo-600">
                {item.timestamp} • {item.result.success ? '✓ Success' : '✗ Failed'}
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
