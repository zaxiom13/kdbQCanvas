import React, { useState, useEffect } from 'react'

const ChannelStatusIndicator = ({ channelStatus, communicationManager }) => {
  const [metrics, setMetrics] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (!communicationManager) return

    const updateMetrics = () => {
      setMetrics(communicationManager.getMetrics())
    }

    // Update metrics every 2 seconds
    const interval = setInterval(updateMetrics, 2000)
    updateMetrics() // Initial update

    return () => clearInterval(interval)
  }, [communicationManager])

  const getChannelStatus = (isConnected) => {
    return isConnected ? { dot: 'connected', text: 'ONLINE' } : { dot: 'disconnected', text: 'OFFLINE' }
  }

  const getLatencyColor = (latency) => {
    if (latency < 50) return 'text-console-neon'
    if (latency < 100) return 'text-console-warning'
    return 'text-console-accent'
  }

  const formatLatency = (latency) => {
    return latency ? `${Math.round(latency)}ms` : 'N/A'
  }

  return (
    <div className="space-y-3">
      {/* Channel Status Header */}
      <div className="text-xs font-mono text-console-neon flex items-center space-x-2">
        <span>►</span>
        <span>CHANNELS</span>
      </div>

      {/* Channel Indicators */}
      <div className="space-y-2">
        <div 
          className="cursor-pointer"
          onClick={() => setShowDetails(!showDetails)}
        >
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className={`status-dot ${getChannelStatus(channelStatus.standard).dot}`}></div>
                <span className="text-console-text">HTTP</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className={`status-dot ${getChannelStatus(channelStatus.fast).dot}`}></div>
                <span className="text-console-text">WS</span>
              </div>
            </div>
            <div className="text-console-dim">
              {showDetails ? '▼' : '►'}
            </div>
          </div>
        </div>

        {showDetails && metrics && (
          <div className="mt-3 space-y-3 border-t border-console-border pt-2">
            {/* Standard Channel Details */}
            <div className="space-y-1">
              <div className="text-xs font-mono text-console-warning">STANDARD [HTTP]</div>
              <div className="text-xs font-mono text-console-dim space-y-1 ml-2">
                <div>STATUS: {getChannelStatus(channelStatus.standard).text}</div>
                <div>REQS: {metrics.standard.totalRequests}</div>
                <div className={getLatencyColor(metrics.standard.averageLatency)}>
                  LATENCY: {formatLatency(metrics.standard.averageLatency)}
                </div>
                <div>SUCCESS: {metrics.standard.successRate.toFixed(1)}%</div>
              </div>
            </div>

            {/* Fast Channel Details */}
            <div className="space-y-1">
              <div className="text-xs font-mono text-console-blue">FAST [WEBSOCKET]</div>
              <div className="text-xs font-mono text-console-dim space-y-1 ml-2">
                <div>STATUS: {getChannelStatus(channelStatus.fast).text}</div>
                <div>REQS: {metrics.fast.totalRequests}</div>
                <div className={getLatencyColor(metrics.fast.averageLatency)}>
                  LATENCY: {formatLatency(metrics.fast.averageLatency)}
                </div>
                <div>SUCCESS: {metrics.fast.successRate.toFixed(1)}%</div>
              </div>
            </div>

            {/* Performance Stats */}
            {metrics.standard.totalRequests > 0 && metrics.fast.totalRequests > 0 && (
              <div className="border border-console-border p-2 space-y-1">
                <div className="text-xs font-mono text-console-neon">PERFORMANCE</div>
                <div className="text-xs font-mono text-console-dim">
                  SPEEDUP: {
                    metrics.standard.averageLatency > 0 
                      ? `${((metrics.standard.averageLatency / metrics.fast.averageLatency - 1) * 100).toFixed(0)}%`
                      : 'N/A'
                  } FASTER
                </div>
              </div>
            )}

            {/* System Note */}
            <div className="text-xs font-mono text-console-dim border-t border-console-border pt-2">
              ► LIVE MODE USES FAST CHANNEL
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChannelStatusIndicator
