import React from 'react'
import LiveModeControls from './LiveModeControls'
import CanvasSizeControls from './CanvasSizeControls'

const SettingsPanel = ({ 
  showSettings, 
  isLiveMode, 
  toggleLiveMode, 
  query, 
  setError, 
  canvasSize, 
  setCanvasSize,
  liveModeForever,
  setLiveModeForever
}) => {
  if (!showSettings) return null

  return (
    <div className="bg-console-panel border border-console-border p-3 mb-3">
      <div className="space-y-3">
        <div className="text-xs font-mono text-console-neon flex items-center space-x-2">
          <span>►</span>
          <span>CONTROL PANEL</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LiveModeControls 
            isLiveMode={isLiveMode}
            toggleLiveMode={toggleLiveMode}
            query={query}
            setError={setError}
            liveModeForever={liveModeForever}
            setLiveModeForever={setLiveModeForever}
          />
          <CanvasSizeControls 
            canvasSize={canvasSize}
            setCanvasSize={setCanvasSize}
            isLiveMode={isLiveMode}
          />
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel
