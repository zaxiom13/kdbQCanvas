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
    <div className="bg-gray-50 border-b p-6">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="text-xl mr-2">⚙️</span>
          Canvas Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
