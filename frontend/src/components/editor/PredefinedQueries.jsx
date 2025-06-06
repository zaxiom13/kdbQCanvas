import React from 'react'
import { predefinedQueries } from '../../data/predefinedQueries'

const PredefinedQueries = ({ setQuery }) => {
  return (
    <div className="space-y-3 h-96 flex flex-col">
      <div className="text-xs font-mono text-console-neon flex items-center space-x-2 flex-shrink-0">
        <span>►</span>
        <span>DEMO CARTRIDGES</span>
        <span className="text-console-dim">[{predefinedQueries.length}]</span>
      </div>
      
      <div className="grid grid-cols-1 gap-2 overflow-y-auto flex-1">
        {predefinedQueries.map((predefined, index) => (
          <button
            key={index}
            onClick={() => setQuery(predefined.query)}
            className="console-btn small text-left p-3 hover:bg-console-panel border border-console-border hover:border-console-neon transition-all duration-200 flex-shrink-0"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-mono text-console-warning">
                CART#{String(index + 1).padStart(2, '0')}
              </div>
              <div className="text-xs font-mono text-console-blue">
                ►RUN
              </div>
            </div>
            
            <div className="text-xs font-mono text-console-text mb-1 font-medium">
              {predefined.label.toUpperCase()}
            </div>
            
            <div className="text-xs font-mono text-console-dim break-all leading-tight">
              {predefined.query}
            </div>
          </button>
        ))}
      </div>
      
      {/* Cartridge bay status */}
      <div className="text-xs font-mono text-console-dim border-t border-console-border pt-2 flex-shrink-0">
        CARTRIDGE BAY: {predefinedQueries.length} LOADED
      </div>
    </div>
  )
}

export default PredefinedQueries
