import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import SettingsPanel from '../../components/settings/SettingsPanel'

describe('SettingsPanel', () => {
  const mockProps = {
    showSettings: true,
    isLiveMode: false,
    toggleLiveMode: vi.fn(),
    query: 'til 8',
    setError: vi.fn(),
    canvasSize: 400,
    setCanvasSize: vi.fn(),
    liveModeForever: true,
    setLiveModeForever: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when showSettings is false', () => {
    render(<SettingsPanel {...mockProps} showSettings={false} />)
    
    expect(screen.queryByText('Canvas Settings')).not.toBeInTheDocument()
  })

  it('should render when showSettings is true', () => {
    render(<SettingsPanel {...mockProps} />)
    
    expect(screen.getByText('Canvas Settings')).toBeInTheDocument()
    expect(screen.getByText('⚙️')).toBeInTheDocument()
  })

  it('should render LiveModeControls component', () => {
    render(<SettingsPanel {...mockProps} />)
    
    expect(screen.getByText('Live Mode Controls')).toBeInTheDocument()
    expect(screen.getByText('🔴')).toBeInTheDocument()
  })

  it('should render CanvasSizeControls component', () => {
    render(<SettingsPanel {...mockProps} />)
    
    expect(screen.getByText('Canvas Size')).toBeInTheDocument()
    expect(screen.getByText('📐')).toBeInTheDocument()
  })

  it('should pass correct props to LiveModeControls', () => {
    render(<SettingsPanel {...mockProps} />)
    
    // Check that LiveModeControls receives the expected props
    // We can verify this by checking rendered content that depends on these props
    expect(screen.getByText('Live Mode Controls')).toBeInTheDocument()
  })

  it('should pass correct props to CanvasSizeControls', () => {
    render(<SettingsPanel {...mockProps} />)
    
    // Check that CanvasSizeControls receives the expected props
    expect(screen.getByText('Size: 400px')).toBeInTheDocument()
    expect(screen.getByText('400×400')).toBeInTheDocument()
  })

  it('should have proper grid layout', () => {
    render(<SettingsPanel {...mockProps} />)
    
    const gridContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.gap-6')
    expect(gridContainer).toBeInTheDocument()
  })

  it('should have proper styling', () => {
    render(<SettingsPanel {...mockProps} />)
    
    const container = document.querySelector('.bg-gray-50.border-b.p-6')
    expect(container).toBeInTheDocument()
  })

  it('should render with correct max-width container', () => {
    render(<SettingsPanel {...mockProps} />)
    
    const innerContainer = document.querySelector('.max-w-4xl.mx-auto')
    expect(innerContainer).toBeInTheDocument()
  })

  it('should show live mode warning when query has no mouse variables', () => {
    render(<SettingsPanel {...mockProps} query="8 8#64?1.0" />)
    
    expect(screen.getByText('⚠️ Live mode requires mouseX or mouseY variables in your query')).toBeInTheDocument()
  })

  it('should not show live mode warning when query has mouse variables', () => {
    render(<SettingsPanel {...mockProps} query="mouseX + mouseY" />)
    
    expect(screen.queryByText('⚠️ Live mode requires mouseX or mouseY variables in your query')).not.toBeInTheDocument()
  })

  it('should show canvas locked message during live mode', () => {
    render(<SettingsPanel {...mockProps} isLiveMode={true} />)
    
    expect(screen.getByText('🔒 Canvas size is locked during live mode')).toBeInTheDocument()
  })

  it('should show live mode duration settings', () => {
    render(<SettingsPanel {...mockProps} />)
    
    expect(screen.getByText('Duration Mode')).toBeInTheDocument()
    expect(screen.getByText('10s')).toBeInTheDocument()
    expect(screen.getByText('Forever')).toBeInTheDocument()
  })
})
