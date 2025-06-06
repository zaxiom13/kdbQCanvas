import React from 'react'

const ConnectionStatus = ({ connectionStatus }) => {
  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected': 
        return { 
          color: 'connected',
          text: 'KDB+ ONLINE',
          symbol: '●'
        }
      case 'disconnected': 
        return { 
          color: 'disconnected',
          text: 'KDB+ OFFLINE',
          symbol: '○'
        }
      case 'error': 
        return { 
          color: 'disconnected',
          text: 'CONNECTION ERROR',
          symbol: '✗'
        }
      case 'unavailable': 
        return { 
          color: 'loading',
          text: 'SERVICE UNAVAILABLE',
          symbol: '△'
        }
      default: 
        return { 
          color: 'loading',
          text: 'STATUS UNKNOWN',
          symbol: '?'
        }
    }
  }

  const status = getStatusInfo()

  return (
    <div className="space-y-3">
      {/* Main status */}
      <div className="text-xs font-mono text-console-neon flex items-center space-x-2">
        <span>►</span>
        <span>CONNECTION</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-xs font-mono">
          <div className={`status-dot ${status.color}`}></div>
          <span className="text-console-text">{status.text}</span>
        </div>
        
        {/* Detailed status */}
        <div className="text-xs font-mono text-console-dim space-y-1">
          {connectionStatus !== 'connected' && (
            <div className="text-console-warning">
              └─ BACKEND:8080 REQUIRED
            </div>
          )}
          {connectionStatus === 'connected' && (
            <div className="text-console-neon">
              └─ READY FOR QUERIES
            </div>
          )}
        </div>
        
        {/* System info */}
        <div className="mt-3 pt-2 border-t border-console-border text-xs font-mono text-console-dim">
          <div>PROTO: HTTP/WS</div>
          <div>PORT: 8080/8081</div>
          <div>MODE: DUAL-BAND</div>
        </div>
      </div>
    </div>
  )
}

export default ConnectionStatus
