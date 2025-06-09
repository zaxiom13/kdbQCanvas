import React from 'react'

const CanvasHeader = ({ isLiveMode, mousePos, showSettings, setShowSettings }) => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Visual Output</h2>
          <p className="text-indigo-100">Your Q expressions rendered as interactive visuals</p>
        </div>
        <div className="flex items-center space-x-4">
          {isLiveMode && (
            <div className="flex items-center space-x-2 bg-red-500 bg-opacity-20 px-4 py-2 rounded-full border border-red-300">
              <div className="animate-pulse w-3 h-3 bg-red-300 rounded-full"></div>
              <span className="text-red-100 font-medium">LIVE MODE</span>
              <span className="text-red-200 text-sm">({mousePos.x.toFixed(2)}, {mousePos.y.toFixed(2)})</span>
            </div>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all duration-200"
          >
            <span>⚙️</span>
            <span className="text-white font-medium">Settings</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CanvasHeader
