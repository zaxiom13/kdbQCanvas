import React from 'react'
import { predefinedQueries } from '../../data/predefinedQueries'

const PredefinedQueries = ({ setQuery }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center flex-shrink-0">
        <span className="text-2xl mr-2">🎯</span>
        Creative Examples
      </h3>
      <div className="grid grid-cols-1 gap-3 overflow-y-auto flex-1 pr-2">
        {predefinedQueries.map((predefined, index) => (
          <button
            key={index}
            onClick={() => setQuery(predefined.query)}
            className="p-3 text-left bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-lg transition-all duration-200 group flex-shrink-0"
          >
            <div className="font-medium text-sm text-gray-800 group-hover:text-indigo-700">
              {predefined.label}
            </div>
            <div className="text-xs text-gray-500 font-mono mt-1 group-hover:text-indigo-600">
              {predefined.query}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default PredefinedQueries
