import React, { useRef } from 'react'
import { useQQueryInterface } from '../hooks/useQQueryInterface'
import EditorSection from './sections/EditorSection'
import CanvasSection from './sections/CanvasSection'
import ResultDisplay from './result/ResultDisplay'
import QueryHistory from './history/QueryHistory'
import ConnectionStatus from './status/ConnectionStatus'
import ChannelStatusIndicator from './status/ChannelStatusIndicator'

const QQueryInterface = () => {
  const canvasRef = useRef(null)
  
  const {
    query,
    setQuery,
    loading,
    error,
    setError,
    result,
    history,
    connectionStatus,
    isLiveMode,
    mousePos,
    showSettings,
    setShowSettings,
    canvasSize,
    setCanvasSize,
    liveModeForever,
    setLiveModeForever,
    channelStatus,
    communicationManager,
    executeQuery,
    toggleLiveMode
  } = useQQueryInterface(canvasRef)

  return (
    <div className="min-h-screen w-full max-w-none font-mono">
      <div className="grid grid-cols-12 gap-4 h-full">
        
        {/* Left Panel - Editor Console */}
        <div className="col-span-3 space-y-4">
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dots">
                <div className="terminal-dot red"></div>
                <div className="terminal-dot yellow"></div>
                <div className="terminal-dot green"></div>
              </div>
              <div className="text-xs">Q-EDITOR</div>
            </div>
            <div className="p-4">
              <EditorSection
                query={query}
                setQuery={setQuery}
                loading={loading}
                executeQuery={executeQuery}
                isLiveMode={isLiveMode}
                toggleLiveMode={toggleLiveMode}
              />
            </div>
          </div>
        </div>

        {/* Center Panel - Results and Display */}
        <div className="col-span-6 space-y-4">
          {/* Query Results Terminal - NOW ON TOP */}
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dots">
                <div className="terminal-dot red"></div>
                <div className="terminal-dot yellow"></div>
                <div className="terminal-dot green"></div>
              </div>
              <div className="text-xs flex items-center space-x-2">
                <span>DATA OUTPUT</span>
                {result && result.success && (
                  <span className="neon-text">● VALID</span>
                )}
              </div>
            </div>
            <div className="p-4">
              <ResultDisplay 
                result={result}
                error={error}
              />
            </div>
          </div>

          {/* Visual Canvas Terminal - NOW BELOW */}
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dots">
                <div className="terminal-dot red"></div>
                <div className="terminal-dot yellow"></div>
                <div className="terminal-dot green"></div>
              </div>
              <div className="text-xs flex items-center space-x-2">
                <span>VISUAL OUTPUT</span>
                {isLiveMode && <span className="neon-text animate-pulse">● LIVE</span>}
                <span className="text-console-dim">
                  [{canvasSize}x{canvasSize}]
                </span>
              </div>
            </div>
            <div className="p-4 bg-console-dark">
              <CanvasSection
                ref={canvasRef}
                result={result}
                canvasSize={canvasSize}
                isLiveMode={isLiveMode}
                mousePos={mousePos}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                toggleLiveMode={toggleLiveMode}
                query={query}
                setError={setError}
                setCanvasSize={setCanvasSize}
                liveModeForever={liveModeForever}
                setLiveModeForever={setLiveModeForever}
              />
            </div>
          </div>
        </div>

        {/* Right Panel - System Status */}
        <div className="col-span-3 space-y-4">
          {/* Connection Status Terminal */}
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dots">
                <div className="terminal-dot red"></div>
                <div className="terminal-dot yellow"></div>
                <div className="terminal-dot green"></div>
              </div>
              <div className="text-xs">SYSTEM</div>
            </div>
            <div className="p-4 space-y-4">
              <ConnectionStatus 
                connectionStatus={connectionStatus}
              />
              
              <ChannelStatusIndicator 
                channelStatus={channelStatus}
                communicationManager={communicationManager}
              />
            </div>
          </div>
          
          {/* History Terminal */}
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dots">
                <div className="terminal-dot red"></div>
                <div className="terminal-dot yellow"></div>
                <div className="terminal-dot green"></div>
              </div>
              <div className="text-xs flex items-center space-x-2">
                <span>COMMAND LOG</span>
                <span className="text-console-dim">[{history.length}]</span>
              </div>
            </div>
            <div className="p-4">
              <QueryHistory 
                history={history}
                setQuery={setQuery}
              />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}

export default QQueryInterface
