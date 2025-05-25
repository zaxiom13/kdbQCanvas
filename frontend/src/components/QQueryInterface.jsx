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
    <div className="min-h-screen w-full max-w-none p-8 space-y-8">

      <div className="flex gap-6">
        {/* Left Sidebar - Editor and Creative Examples */}
        <div className="w-80 flex-shrink-0 space-y-6">
          <EditorSection
            query={query}
            setQuery={setQuery}
            loading={loading}
            executeQuery={executeQuery}
            isLiveMode={isLiveMode}
            toggleLiveMode={toggleLiveMode}
          />
        </div>

        {/* Main Content Area - Canvas and Results */}
        <div className="flex-1 flex flex-col space-y-8">
          {/* Canvas Section */}
          <div className="w-full">
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

          {/* Results Section */}
          <div className="w-full">
            <ResultDisplay 
              result={result}
              error={error}
            />
          </div>
        </div>

        {/* Right Sidebar - History and Connection Status */}
        <div className="w-80 flex-shrink-0 space-y-6">
          <ConnectionStatus 
            connectionStatus={connectionStatus}
          />
          
          <ChannelStatusIndicator 
            channelStatus={channelStatus}
            communicationManager={communicationManager}
          />
          
          <QueryHistory 
            history={history}
            setQuery={setQuery}
          />
        </div>
      </div>
    </div>
  )
}

export default QQueryInterface
