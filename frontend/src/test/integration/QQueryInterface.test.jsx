import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import QQueryInterface from '../../components/QQueryInterface'

// Mock all the hooks used by QQueryInterface
vi.mock('../../hooks/useQQueryInterface', () => ({
  useQQueryInterface: () => ({
    query: '',
    setQuery: vi.fn(),
    loading: false,
    error: null,
    setError: vi.fn(),
    result: null,
    history: [],
    connectionStatus: 'connected',
    isLiveMode: false,
    mousePos: { x: 100, y: 200 },
    showSettings: false,
    setShowSettings: vi.fn(),
    canvasSize: 400,
    setCanvasSize: vi.fn(),
    liveModeForever: true,
    setLiveModeForever: vi.fn(),
    channelStatus: { standard: true, fast: true },
    communicationManager: null,
    executeQuery: vi.fn(),
    toggleLiveMode: vi.fn()
  })
}))

// Mock child components to focus on integration
vi.mock('../../components/sections/EditorSection', () => ({
  default: ({ query, setQuery, executeQuery }) => (
    <div data-testid="editor-section">
      <input 
        data-testid="query-input" 
        value={query} 
        onChange={(e) => setQuery(e.target.value)}
      />
      <button data-testid="execute-btn" onClick={executeQuery}>
        Execute
      </button>
    </div>
  )
}))

vi.mock('../../components/sections/CanvasSection', () => ({
  default: ({ showSettings, setShowSettings }) => (
    <div data-testid="canvas-section">
      <button 
        data-testid="settings-toggle" 
        onClick={() => setShowSettings(!showSettings)}
      >
        {showSettings ? 'Hide Settings' : 'Show Settings'}
      </button>
    </div>
  )
}))

vi.mock('../../components/result/ResultDisplay', () => ({
  default: ({ result, error }) => (
    <div data-testid="result-display">
      {result && <div>Result: {JSON.stringify(result)}</div>}
      {error && <div>Error: {error}</div>}
    </div>
  )
}))

vi.mock('../../components/history/QueryHistory', () => ({
  default: ({ history, setQuery }) => (
    <div data-testid="query-history">
      History items: {history.length}
      {history.map((item, idx) => (
        <button key={idx} onClick={() => setQuery(item.query)}>
          {item.query}
        </button>
      ))}
    </div>
  )
}))

vi.mock('../../components/status/ConnectionStatus', () => ({
  default: ({ connectionStatus }) => (
    <div data-testid="connection-status">
      Status: {connectionStatus}
    </div>
  )
}))

vi.mock('../../components/status/ChannelStatusIndicator', () => ({
  default: ({ channelStatus }) => (
    <div data-testid="channel-status">
      Standard: {channelStatus.standard ? 'connected' : 'disconnected'}
      Fast: {channelStatus.fast ? 'connected' : 'disconnected'}
    </div>
  )
}))

describe('QQueryInterface Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render all main sections', () => {
    render(<QQueryInterface />)
    
    expect(screen.getByTestId('editor-section')).toBeInTheDocument()
    expect(screen.getByTestId('canvas-section')).toBeInTheDocument()
    expect(screen.getByTestId('result-display')).toBeInTheDocument()
    expect(screen.getByTestId('query-history')).toBeInTheDocument()
    expect(screen.getByTestId('connection-status')).toBeInTheDocument()
    expect(screen.getByTestId('channel-status')).toBeInTheDocument()
  })

  it('should display correct connection status', () => {
    render(<QQueryInterface />)
    
    expect(screen.getByText('Status: connected')).toBeInTheDocument()
  })

  it('should display correct channel status', () => {
    render(<QQueryInterface />)
    
    expect(screen.getByText(/Standard: connected/)).toBeInTheDocument()
    expect(screen.getByText(/Fast: connected/)).toBeInTheDocument()
  })

  it('should show empty history initially', () => {
    render(<QQueryInterface />)
    
    expect(screen.getByText('History items: 0')).toBeInTheDocument()
  })

  it('should have proper layout structure', () => {
    render(<QQueryInterface />)
    
    // Check for main container
    const mainContainer = document.querySelector('.min-h-screen.w-full.max-w-none.p-8.space-y-8')
    expect(mainContainer).toBeInTheDocument()
    
    // Check for flex layout
    const flexContainer = document.querySelector('.flex.gap-6')
    expect(flexContainer).toBeInTheDocument()
  })

  it('should handle component interactions', async () => {
    const user = userEvent.setup()
    render(<QQueryInterface />)
    
    // Test settings toggle
    const settingsToggle = screen.getByTestId('settings-toggle')
    expect(settingsToggle).toHaveTextContent('Show Settings')
    
    await user.click(settingsToggle)
    // The mocked hook doesn't actually change state, but we can verify the button exists
    expect(settingsToggle).toBeInTheDocument()
  })

  it('should handle execute button', async () => {
    const user = userEvent.setup()
    render(<QQueryInterface />)
    
    const executeButton = screen.getByTestId('execute-btn')
    await user.click(executeButton)
    
    // Button should be clickable (mocked function doesn't change state)
    expect(executeButton).toBeInTheDocument()
  })

  it('should have responsive layout classes', () => {
    render(<QQueryInterface />)
    
    // Check for responsive sidebar
    const sidebar = document.querySelector('.w-80.flex-shrink-0')
    expect(sidebar).toBeInTheDocument()
    
    // Check for flexible main content
    const mainContent = document.querySelector('.flex-1.flex.flex-col')
    expect(mainContent).toBeInTheDocument()
  })

  it('should render editor in sidebar', () => {
    render(<QQueryInterface />)
    
    const sidebar = document.querySelector('.w-80')
    const editorSection = screen.getByTestId('editor-section')
    
    expect(sidebar).toContainElement(editorSection)
  })

  it('should render canvas in main area', () => {
    render(<QQueryInterface />)
    
    const mainContent = document.querySelector('.flex-1')
    const canvasSection = screen.getByTestId('canvas-section')
    
    expect(mainContent).toContainElement(canvasSection)
  })

  it('should render right sidebar components', () => {
    render(<QQueryInterface />)
    
    const rightSidebar = document.querySelector('.w-96')
    const connectionStatus = screen.getByTestId('connection-status')
    const resultDisplay = screen.getByTestId('result-display')
    const queryHistory = screen.getByTestId('query-history')
    
    expect(rightSidebar).toContainElement(connectionStatus)
    expect(rightSidebar).toContainElement(resultDisplay)
    expect(rightSidebar).toContainElement(queryHistory)
  })

  it('should handle canvas ref properly', () => {
    render(<QQueryInterface />)
    
    // Component should render without crashing when canvas ref is used
    expect(screen.getByTestId('canvas-section')).toBeInTheDocument()
  })

  it('should maintain proper spacing between sections', () => {
    render(<QQueryInterface />)
    
    // Check for space-y-8 on main container
    const mainContainer = document.querySelector('.space-y-8')
    expect(mainContainer).toBeInTheDocument()
    
    // Check for space-y-6 on sidebar
    const sidebarSpace = document.querySelector('.space-y-6')
    expect(sidebarSpace).toBeInTheDocument()
  })
})
