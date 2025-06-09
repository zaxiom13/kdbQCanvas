import React from 'react'

const CanvasSizeControls = ({ canvasSize, setCanvasSize, isLiveMode }) => {
  return (
    <div className="bg-white rounded-lg p-4 border">
      <h4 className="font-medium text-gray-700 mb-3 flex items-center">
        <span className="text-lg mr-2">📐</span>
        Canvas Size
      </h4>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Size: {canvasSize}px</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {canvasSize}×{canvasSize}
          </span>
        </div>
        
        {isLiveMode && (
          <p className="text-xs text-orange-600">
            🔒 Canvas size is locked during live mode
          </p>
        )}
        
        <input
          type="range"
          min="200"
          max="800"
          step="50"
          value={canvasSize}
          onChange={(e) => setCanvasSize(parseInt(e.target.value))}
          disabled={isLiveMode}
          className={`w-full h-2 bg-gray-200 rounded-lg appearance-none slider ${
            isLiveMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
          style={{
            background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${((canvasSize - 200) / 600) * 100}%, #e5e7eb ${((canvasSize - 200) / 600) * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>200px</span>
          <span>500px</span>
          <span>800px</span>
        </div>
      </div>
    </div>
  )
}

export default CanvasSizeControls
