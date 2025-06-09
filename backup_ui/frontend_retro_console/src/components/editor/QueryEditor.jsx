import React from 'react'
import { containsMouseVariables } from '../../utils/queryUtils'

const QueryEditor = ({ query, setQuery, loading, executeQuery, isLiveMode, toggleLiveMode }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      executeQuery()
    }
  }

  return (
    <div className="space-y-4">
      {/* Terminal-style header */}
      <div className="text-xs font-mono text-console-neon flex items-center space-x-2">
        <span>►</span>
        <span>Q-EXPR INPUT</span>
      </div>
      
      <div className="space-y-3">
        {/* Code editor area */}
        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="// Enter Q expression... (e.g., 8 8#64?1.0)&#10;// Use mx,my for mouse coordinates"
            className="console-input w-full h-20 text-xs font-mono resize-none leading-relaxed"
            disabled={loading}
          />
          <div className="absolute bottom-1 right-2 text-xs text-console-dim">
            CTRL+ENTER
          </div>
        </div>
        
        {/* Control buttons */}
        <div className="flex space-x-2">
          <button
            onClick={executeQuery}
            disabled={loading || !query.trim()}
            className="console-btn primary flex-1 text-xs flex items-center justify-center space-x-1"
          >
            {loading && !isLiveMode ? (
              <>
                <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full"></div>
                <span>EXEC</span>
              </>
            ) : (
              <>
                <span>►</span>
                <span>EXECUTE</span>
              </>
            )}
          </button>
          
          <button
            onClick={toggleLiveMode}
            disabled={!containsMouseVariables(query.trim())}
            className={`console-btn text-xs flex items-center space-x-1 ${
              isLiveMode 
                ? 'bg-console-accent border-console-accent text-console-text' 
                : 'bg-console-neon border-console-neon text-console-dark'
            }`}
            title={isLiveMode ? 'Stop Live Mode' : 'Start Live Mode'}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
            <span>{isLiveMode ? 'STOP' : 'LIVE'}</span>
          </button>
        </div>
        
        {/* Status indicator */}
        <div className="text-xs font-mono flex items-center justify-between text-console-dim">
          <div className="flex items-center space-x-2">
            {isLiveMode && (
              <div className="flex items-center space-x-1">
                <div className="status-dot connected"></div>
                <span className="neon-text">LIVE MODE ACTIVE</span>
              </div>
            )}
          </div>
          <div>
            {containsMouseVariables(query.trim()) && (
              <span className="text-console-warning">MOUSE VARS DETECTED</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QueryEditor
