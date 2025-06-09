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
    <div className="space-y-3">
      {/* Console-style canvas header */}
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="text-console-neon">►</span>
          <span className="text-console-text">CRT MONITOR</span>
          <span className="text-console-dim">[{canvasSize}x{canvasSize}]</span>
        </div>
        <div className="flex items-center space-x-2">
          {isLiveMode && (
            <div className="flex items-center space-x-1">
              <div className="status-dot connected"></div>
              <span className="neon-text">SCANNING</span>
            </div>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="console-btn small"
          >
            SETTINGS
          </button>
        </div>
      </div>

      {/* Mouse coordinates display */}
      {isLiveMode && mousePos && (
        <div className="text-xs font-mono text-console-warning flex items-center space-x-4">
          <span>CURSOR:</span>
          <span>X:{mousePos.x.toFixed(3)}</span>
          <span>Y:{mousePos.y.toFixed(3)}</span>
          <span className="text-console-dim">│</span>
          <span>RELATIVE TO DISPLAY BUFFER</span>
        </div>
      )}
      
      {/* Settings Panel */}
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
      
      {/* CRT-style display area */}
      <div className="border-2 border-console-border bg-console-dark p-2">
        <div className="relative">
          {/* CRT Screen bezel effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black opacity-20 pointer-events-none z-10"></div>
          
          {/* Scanline overlay */}
          <div className="absolute inset-0 pointer-events-none z-20" style={{
            backgroundImage: 'linear-gradient(transparent 50%, rgba(0, 255, 0, 0.02) 50%)',
            backgroundSize: '100% 2px'
          }}></div>
          
          <CanvasDisplay 
            ref={ref}
            result={result}
            canvasSize={canvasSize}
          />
        </div>
      </div>
      
      {/* Display info */}
      <div className="text-xs font-mono text-console-dim flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span>REFRESH: 60Hz</span>
          <span>COLOR: 16-BIT</span>
          <span>MODE: {result ? 'ACTIVE' : 'STANDBY'}</span>
        </div>
        <div>
          PIXELS: {canvasSize * canvasSize}
        </div>
      </div>
    </div>
  )
})

CanvasSection.displayName = 'CanvasSection'

export default CanvasSection
