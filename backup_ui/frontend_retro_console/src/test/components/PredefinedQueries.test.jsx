import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import PredefinedQueries from '../../components/editor/PredefinedQueries'

describe('PredefinedQueries', () => {
  const mockSetQuery = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with correct title and icon', () => {
    render(<PredefinedQueries setQuery={mockSetQuery} />)
    
    expect(screen.getByText('🎯')).toBeInTheDocument()
    expect(screen.getByText('Creative Examples')).toBeInTheDocument()
  })

  it('should render all predefined queries', () => {
    render(<PredefinedQueries setQuery={mockSetQuery} />)
    
    // Check for some expected predefined queries
    expect(screen.getByText('Simple Pattern')).toBeInTheDocument()
    expect(screen.getByText('Random Matrix')).toBeInTheDocument()
    expect(screen.getByText('Mouse Ripple')).toBeInTheDocument()
    expect(screen.getByText('Color Splash')).toBeInTheDocument()
  })

  it('should call setQuery when a predefined query is clicked', async () => {
    const user = userEvent.setup()
    render(<PredefinedQueries setQuery={mockSetQuery} />)
    
    const simplePatternButton = screen.getByText('Simple Pattern')
    await user.click(simplePatternButton)
    
    expect(mockSetQuery).toHaveBeenCalledWith('1+1')
  })

  it('should show query descriptions', () => {
    render(<PredefinedQueries setQuery={mockSetQuery} />)
    
    // Check for query descriptions
    expect(screen.getByText(/Basic mathematical expression/)).toBeInTheDocument()
    expect(screen.getByText(/Interactive mouse-based ripple effect/)).toBeInTheDocument()
  })

  it('should show mouse interaction tags for relevant queries', () => {
    render(<PredefinedQueries setQuery={mockSetQuery} />)
    
    // Look for mouse interaction indicators
    const mouseRippleButton = screen.getByText('Mouse Ripple').closest('button')
    expect(mouseRippleButton).toBeInTheDocument()
    
    // Check if it has the mouse interaction indicator
    expect(mouseRippleButton.textContent).toContain('🖱️')
  })

  it('should have scrollable container for overflow', () => {
    render(<PredefinedQueries setQuery={mockSetQuery} />)
    
    const scrollContainer = document.querySelector('.overflow-y-auto')
    expect(scrollContainer).toBeInTheDocument()
  })

  it('should have proper grid layout', () => {
    render(<PredefinedQueries setQuery={mockSetQuery} />)
    
    const gridContainer = document.querySelector('.grid.grid-cols-1.gap-3')
    expect(gridContainer).toBeInTheDocument()
  })

  it('should have hover effects on buttons', () => {
    render(<PredefinedQueries setQuery={mockSetQuery} />)
    
    const buttons = document.querySelectorAll('button[class*="hover:bg-indigo-50"]')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should handle complex queries with mouse variables', async () => {
    const user = userEvent.setup()
    render(<PredefinedQueries setQuery={mockSetQuery} />)
    
    const mouseWaveButton = screen.getByText('Mouse Wave')
    await user.click(mouseWaveButton)
    
    expect(mockSetQuery).toHaveBeenCalledWith('16 16#(til 256)*(mouseX%10+mouseY%10)')
  })

  it('should handle 3D and 4D array queries', async () => {
    const user = userEvent.setup()
    render(<PredefinedQueries setQuery={mockSetQuery} />)
    
    const colorSplashButton = screen.getByText('Color Splash')
    await user.click(colorSplashButton)
    
    expect(mockSetQuery).toHaveBeenCalledWith('8 8 3#192?1.0')
  })

  it('should handle animation queries', async () => {
    const user = userEvent.setup()
    render(<PredefinedQueries setQuery={mockSetQuery} />)
    
    const movingWavesButton = screen.getByText('Moving Waves')
    await user.click(movingWavesButton)
    
    expect(mockSetQuery).toHaveBeenCalledWith('10 12 12#1440?1.0')
  })

  it('should have proper styling and classes', () => {
    render(<PredefinedQueries setQuery={mockSetQuery} />)
    
    const container = document.querySelector('.bg-white.rounded-lg.shadow-sm.border.p-6')
    expect(container).toBeInTheDocument()
  })

  it('should show category labels correctly', () => {
    render(<PredefinedQueries setQuery={mockSetQuery} />)
    
    // Look for different types of queries
    expect(screen.getByText(/2D Matrix/)).toBeInTheDocument()
    expect(screen.getByText(/3D Array/)).toBeInTheDocument()
    expect(screen.getByText(/Mouse Interactive/)).toBeInTheDocument()
  })

  it('should maintain button state and accessibility', () => {
    render(<PredefinedQueries setQuery={mockSetQuery} />)
    
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveAttribute('type', 'button')
      expect(button).not.toBeDisabled()
    })
  })
})
