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

  const getChannelIcon = (isConnected) => {
    return isConnected ? '🟢' : '🔴'
  }

  const getLatencyColor = (latency) => {
    if (latency < 50) return 'text-green-600'
    if (latency < 100) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatLatency = (latency) => {
    return latency ? `${Math.round(latency)}ms` : 'N/A'
  }

  return (
    <div className="bg-gray-50 border rounded-lg p-3 text-sm">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="font-medium text-gray-700">Communication Status</div>
        <div className="flex space-x-2">
          <span title="Standard Channel (HTTP)">
            {getChannelIcon(channelStatus.standard)} HTTP
          </span>
          <span title="Fast Channel (WebSocket)">
            {getChannelIcon(channelStatus.fast)} WS
          </span>
          <span className="text-gray-400">
            {showDetails ? '▼' : '▶'}
          </span>
        </div>
      </div>

      {showDetails && metrics && (
        <div className="mt-3 space-y-2 border-t pt-2">
          <div className="grid grid-cols-2 gap-4">
            {/* Standard Channel */}
            <div className="bg-white rounded p-2">
              <div className="font-medium text-gray-600 mb-1">Standard (HTTP)</div>
              <div className="text-xs space-y-1">
                <div>Status: {channelStatus.standard ? '✅ Connected' : '❌ Disconnected'}</div>
                <div>Requests: {metrics.standard.totalRequests}</div>
                <div className={getLatencyColor(metrics.standard.averageLatency)}>
                  Avg Latency: {formatLatency(metrics.standard.averageLatency)}
                </div>
                <div>Success Rate: {metrics.standard.successRate.toFixed(1)}%</div>
              </div>
            </div>

            {/* Fast Channel */}
            <div className="bg-white rounded p-2">
              <div className="font-medium text-gray-600 mb-1">Fast (WebSocket)</div>
              <div className="text-xs space-y-1">
                <div>Status: {channelStatus.fast ? '✅ Connected' : '❌ Disconnected'}</div>
                <div>Requests: {metrics.fast.totalRequests}</div>
                <div className={getLatencyColor(metrics.fast.averageLatency)}>
                  Avg Latency: {formatLatency(metrics.fast.averageLatency)}
                </div>
                <div>Success Rate: {metrics.fast.successRate.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Performance Comparison */}
          {metrics.standard.totalRequests > 0 && metrics.fast.totalRequests > 0 && (
            <div className="bg-blue-50 rounded p-2">
              <div className="font-medium text-blue-800 text-xs mb-1">Performance Comparison</div>
              <div className="text-xs text-blue-700">
                Fast channel is {
                  metrics.standard.averageLatency > 0 
                    ? `${((metrics.standard.averageLatency / metrics.fast.averageLatency - 1) * 100).toFixed(0)}%`
                    : 'N/A'
                } faster than standard channel
              </div>
            </div>
          )}

          {/* Live Mode Indicator */}
          <div className="text-xs text-gray-500">
            💡 Live mode automatically uses the fast channel for optimal performance
          </div>
        </div>
      )}
    </div>
  )
}

export default ChannelStatusIndicator
