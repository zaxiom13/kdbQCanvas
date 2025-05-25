import React, { forwardRef } from 'react'
import CanvasHeader from '../canvas/CanvasHeader'
import CanvasDisplay from '../canvas/CanvasDisplay'
import SettingsPanel from '../settings/SettingsPanel'

const CanvasSection = forwardRef(({ 
  result, 
  canvasSize, 
  isLiveMode, 
  mousePos, 
  showSettings, 
  setShowSettings,
  toggleLiveMode,
  query,
  setError,
  setCanvasSize,
  liveModeForever,
  setLiveModeForever
}, ref) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <CanvasHeader 
        isLiveMode={isLiveMode}
        mousePos={mousePos}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
      />
      
      <SettingsPanel 
        showSettings={showSettings}
        isLiveMode={isLiveMode}
        toggleLiveMode={toggleLiveMode}
        query={query}
        setError={setError}
        canvasSize={canvasSize}
        setCanvasSize={setCanvasSize}
        liveModeForever={liveModeForever}
        setLiveModeForever={setLiveModeForever}
      />
      
      <div className="p-6">
        <CanvasDisplay 
          ref={ref}
          result={result}
          canvasSize={canvasSize}
        />
      </div>
    </div>
  )
})

CanvasSection.displayName = 'CanvasSection'

export default CanvasSection
