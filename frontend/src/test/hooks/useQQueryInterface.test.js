import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useQQueryInterface } from '../../hooks/useQQueryInterface'

// Mock the custom hooks
vi.mock('../../hooks/useMousePosition', () => ({
  useMousePosition: () => ({
    mousePos: { x: 100, y: 200 },
    mousePosRef: { current: { x: 100, y: 200 } }
  })
}))

vi.mock('../../hooks/useConnectionStatus', () => ({
  useConnectionStatus: () => 'connected'
}))

vi.mock('../../hooks/useQueryExecution', () => ({
  useQueryExecution: () => ({
    loading: false,
    error: null,
    result: null,
    history: [],
    communicationManager: null,
    channelStatus: { standard: true, fast: true },
    executeQuery: vi.fn(),
    setError: vi.fn()
  })
}))

vi.mock('../../hooks/useLiveMode', () => ({
  useLiveMode: () => ({
    isLiveMode: false,
    toggleLiveMode: vi.fn(),
    liveModeForever: true,
    setLiveModeForever: vi.fn()
  })
}))

describe('useQQueryInterface', () => {
  let mockCanvasRef

  beforeEach(() => {
    mockCanvasRef = { current: null }
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useQQueryInterface(mockCanvasRef))
    
    expect(result.current.query).toBe('')
    expect(result.current.showSettings).toBe(false)
    expect(result.current.canvasSize).toBe(400)
    expect(result.current.mousePos).toEqual({ x: 100, y: 200 })
    expect(result.current.connectionStatus).toBe('connected')
  })

  it('should update query state', () => {
    const { result } = renderHook(() => useQQueryInterface(mockCanvasRef))
    
    act(() => {
      result.current.setQuery('til 8')
    })
    
    expect(result.current.query).toBe('til 8')
  })

  it('should toggle settings visibility', () => {
    const { result } = renderHook(() => useQQueryInterface(mockCanvasRef))
    
    expect(result.current.showSettings).toBe(false)
    
    act(() => {
      result.current.setShowSettings(true)
    })
    
    expect(result.current.showSettings).toBe(true)
  })

  it('should update canvas size', () => {
    const { result } = renderHook(() => useQQueryInterface(mockCanvasRef))
    
    expect(result.current.canvasSize).toBe(400)
    
    act(() => {
      result.current.setCanvasSize(600)
    })
    
    expect(result.current.canvasSize).toBe(600)
  })

  it('should provide all necessary interface properties', () => {
    const { result } = renderHook(() => useQQueryInterface(mockCanvasRef))
    
    // Check that all expected properties are present
    const expectedProperties = [
      'query',
      'setQuery',
      'loading',
      'error',
      'setError',
      'result',
      'history',
      'connectionStatus',
      'isLiveMode',
      'mousePos',
      'showSettings',
      'setShowSettings',
      'canvasSize',
      'setCanvasSize',
      'liveModeForever',
      'setLiveModeForever',
      'channelStatus',
      'communicationManager',
      'executeQuery',
      'toggleLiveMode'
    ]
    
    expectedProperties.forEach(prop => {
      expect(result.current).toHaveProperty(prop)
    })
  })

  it('should handle canvas size constraints', () => {
    const { result } = renderHook(() => useQQueryInterface(mockCanvasRef))
    
    // Test minimum canvas size
    act(() => {
      result.current.setCanvasSize(100)
    })
    expect(result.current.canvasSize).toBe(100)
    
    // Test maximum canvas size
    act(() => {
      result.current.setCanvasSize(1000)
    })
    expect(result.current.canvasSize).toBe(1000)
  })

  it('should maintain state consistency', () => {
    const { result } = renderHook(() => useQQueryInterface(mockCanvasRef))
    
    // Make multiple state changes
    act(() => {
      result.current.setQuery('mouseX + mouseY')
      result.current.setShowSettings(true)
      result.current.setCanvasSize(500)
    })
    
    // All changes should be preserved
    expect(result.current.query).toBe('mouseX + mouseY')
    expect(result.current.showSettings).toBe(true)
    expect(result.current.canvasSize).toBe(500)
  })

  it('should handle canvas ref properly', () => {
    const canvasElement = document.createElement('canvas')
    mockCanvasRef.current = canvasElement
    
    const { result } = renderHook(() => useQQueryInterface(mockCanvasRef))
    
    // Hook should not fail with canvas ref
    expect(result.current).toBeDefined()
    expect(typeof result.current.executeQuery).toBe('function')
  })

  it('should integrate with mouse position hook', () => {
    const { result } = renderHook(() => useQQueryInterface(mockCanvasRef))
    
    // Mouse position should be available from the mocked hook
    expect(result.current.mousePos).toEqual({ x: 100, y: 200 })
  })

  it('should integrate with connection status hook', () => {
    const { result } = renderHook(() => useQQueryInterface(mockCanvasRef))
    
    // Connection status should be available from the mocked hook
    expect(result.current.connectionStatus).toBe('connected')
  })

  it('should provide channel status from query execution hook', () => {
    const { result } = renderHook(() => useQQueryInterface(mockCanvasRef))
    
    expect(result.current.channelStatus).toEqual({ standard: true, fast: true })
  })

  it('should provide live mode functionality', () => {
    const { result } = renderHook(() => useQQueryInterface(mockCanvasRef))
    
    expect(result.current.isLiveMode).toBe(false)
    expect(result.current.liveModeForever).toBe(true)
    expect(typeof result.current.toggleLiveMode).toBe('function')
    expect(typeof result.current.setLiveModeForever).toBe('function')
  })

  it('should handle error state properly', () => {
    const { result } = renderHook(() => useQQueryInterface(mockCanvasRef))
    
    expect(result.current.error).toBeNull()
    expect(typeof result.current.setError).toBe('function')
  })
})
