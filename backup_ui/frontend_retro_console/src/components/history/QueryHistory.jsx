import React from 'react'

const QueryHistory = ({ history, setQuery }) => {
  if (history.length === 0) {
    return (
      <div className="space-y-3">
        <div className="text-xs font-mono text-console-neon flex items-center space-x-2">
          <span>►</span>
          <span>COMMAND BUFFER</span>
        </div>
        <div className="text-center py-4 text-console-dim">
          <div className="text-sm font-mono">[ NO ENTRIES ]</div>
          <div className="text-xs font-mono mt-1">EXECUTE QUERIES TO LOG</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="text-xs font-mono text-console-neon flex items-center space-x-2">
        <span>►</span>
        <span>COMMAND BUFFER</span>
        <span className="text-console-dim">[{history.length}/64]</span>
      </div>
      
      <div className="space-y-1 max-h-80 overflow-y-auto">
        {history.slice().reverse().map((item, index) => (
          <div
            key={index}
            className={`history-item ${item.result.success ? 'success' : 'error'}`}
            onClick={() => setQuery(item.query)}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-mono text-console-warning">
                CMD#{String(history.length - index).padStart(3, '0')}
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono">
                {item.isLiveMode && (
                  <span className="text-console-accent animate-pulse">LIVE</span>
                )}
                <span className={item.result.success ? 'text-console-neon' : 'text-console-accent'}>
                  {item.result.success ? 'OK' : 'ERR'}
                </span>
                {item.channel && (
                  <span className={`${
                    item.channel === 'fast' 
                      ? 'text-console-blue' 
                      : 'text-console-purple'
                  }`}>
                    {item.channel === 'fast' ? 'WS' : 'HTTP'}
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-xs font-mono text-console-text truncate mb-1">
              {item.query}
            </div>
            
            <div className="text-xs font-mono text-console-dim flex items-center space-x-2">
              <span>{item.timestamp}</span>
              {item.isLiveMode && item.executionCount && (
                <>
                  <span>•</span>
                  <span>EXEC:{item.executionCount}</span>
                </>
              )}
              {item.isLiveMode && !item.endTime && item.latestTimestamp && (
                <>
                  <span>•</span>
                  <span className="neon-text">ACTIVE</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Buffer status */}
      <div className="text-xs font-mono text-console-dim border-t border-console-border pt-2">
        BUFFER: {((history.length / 64) * 100).toFixed(0)}% FULL
      </div>
    </div>
  )
}

export default QueryHistory
