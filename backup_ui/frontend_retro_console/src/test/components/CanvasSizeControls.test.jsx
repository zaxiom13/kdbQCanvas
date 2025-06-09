import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import CanvasSizeControls from '../../components/settings/CanvasSizeControls'

describe('CanvasSizeControls', () => {
  const mockProps = {
    canvasSize: 400,
    setCanvasSize: vi.fn(),
    isLiveMode: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with default props', () => {
    render(<CanvasSizeControls {...mockProps} />)
    
    expect(screen.getByText('Canvas Size')).toBeInTheDocument()
    expect(screen.getByText('📐')).toBeInTheDocument()
    expect(screen.getByText('Size: 400px')).toBeInTheDocument()
    expect(screen.getByText('400×400')).toBeInTheDocument()
  })

  it('should display current canvas size', () => {
    render(<CanvasSizeControls {...mockProps} canvasSize={600} />)
    
    expect(screen.getByText('Size: 600px')).toBeInTheDocument()
    expect(screen.getByText('600×600')).toBeInTheDocument()
  })

  it('should render range slider with correct attributes', () => {
    render(<CanvasSizeControls {...mockProps} />)
    
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('min', '200')
    expect(slider).toHaveAttribute('max', '800')
    expect(slider).toHaveAttribute('step', '50')
    expect(slider).toHaveValue('400')
  })

  it('should show range labels', () => {
    render(<CanvasSizeControls {...mockProps} />)
    
    expect(screen.getByText('200px')).toBeInTheDocument()
    expect(screen.getByText('500px')).toBeInTheDocument()
    expect(screen.getByText('800px')).toBeInTheDocument()
  })

  it('should call setCanvasSize when slider value changes', async () => {
    const user = userEvent.setup()
    render(<CanvasSizeControls {...mockProps} />)
    
    const slider = screen.getByRole('slider')
    await user.clear(slider)
    await user.type(slider, '600')
    
    expect(mockProps.setCanvasSize).toHaveBeenCalled()
  })

  it('should disable slider when in live mode', () => {
    render(<CanvasSizeControls {...mockProps} isLiveMode={true} />)
    
    const slider = screen.getByRole('slider')
    expect(slider).toBeDisabled()
    expect(slider).toHaveClass('opacity-50', 'cursor-not-allowed')
  })

  it('should enable slider when not in live mode', () => {
    render(<CanvasSizeControls {...mockProps} isLiveMode={false} />)
    
    const slider = screen.getByRole('slider')
    expect(slider).not.toBeDisabled()
    expect(slider).toHaveClass('cursor-pointer')
  })

  it('should show lock message when in live mode', () => {
    render(<CanvasSizeControls {...mockProps} isLiveMode={true} />)
    
    expect(screen.getByText('🔒 Canvas size is locked during live mode')).toBeInTheDocument()
  })

  it('should not show lock message when not in live mode', () => {
    render(<CanvasSizeControls {...mockProps} isLiveMode={false} />)
    
    expect(screen.queryByText('🔒 Canvas size is locked during live mode')).not.toBeInTheDocument()
  })

  it('should handle edge case canvas sizes', () => {
    const { rerender } = render(<CanvasSizeControls {...mockProps} canvasSize={200} />)
    
    expect(screen.getByText('Size: 200px')).toBeInTheDocument()
    expect(screen.getByText('200×200')).toBeInTheDocument()
    
    rerender(<CanvasSizeControls {...mockProps} canvasSize={800} />)
    expect(screen.getByText('Size: 800px')).toBeInTheDocument()
    expect(screen.getByText('800×800')).toBeInTheDocument()
  })

  it('should have proper styling classes', () => {
    render(<CanvasSizeControls {...mockProps} />)
    
    const container = document.querySelector('.bg-white.rounded-lg.p-4.border')
    expect(container).toBeInTheDocument()
  })

  it('should show dynamic slider background based on value', () => {
    render(<CanvasSizeControls {...mockProps} canvasSize={400} />)
    
    const slider = screen.getByRole('slider')
    const expectedPercent = ((400 - 200) / 600) * 100
    expect(slider.style.background).toContain(`${expectedPercent}%`)
  })

  it('should handle minimum canvas size', () => {
    render(<CanvasSizeControls {...mockProps} canvasSize={200} />)
    
    const slider = screen.getByRole('slider')
    expect(slider.value).toBe('200')
    expect(slider.style.background).toContain('0%')
  })

  it('should handle maximum canvas size', () => {
    render(<CanvasSizeControls {...mockProps} canvasSize={800} />)
    
    const slider = screen.getByRole('slider')
    expect(slider.value).toBe('800')
    expect(slider.style.background).toContain('100%')
  })
})
