import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ResultDisplay from '../../components/result/ResultDisplay'

describe('ResultDisplay', () => {
  it('should render empty state when no result', () => {
    render(<ResultDisplay result={null} error={null} />)
    
    expect(screen.getByText('Result Output')).toBeInTheDocument()
    expect(screen.getByText('📊')).toBeInTheDocument()
    expect(screen.getByText('🔍')).toBeInTheDocument()
    expect(screen.getByText('Execute a Q expression to see results here')).toBeInTheDocument()
  })

  it('should render successful result', () => {
    const mockResult = {
      success: true,
      data: [1, 2, 3, 4],
      arrayShape: { dimensions: [4] }
    }

    render(<ResultDisplay result={mockResult} error={null} />)
    
    expect(screen.getByText('Result Output')).toBeInTheDocument()
    expect(screen.getByText('Success')).toBeInTheDocument()
    expect(screen.getByText('Success')).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('should render array statistics for numeric arrays', () => {
    const mockResult = {
      success: true,
      data: [1, 2, 3, 4, 5],
      arrayShape: { dimensions: [5] }
    }

    render(<ResultDisplay result={mockResult} error={null} />)
    
    expect(screen.getByText('Array Statistics')).toBeInTheDocument()
    expect(screen.getByText(/Min:/)).toBeInTheDocument()
    expect(screen.getByText(/Max:/)).toBeInTheDocument()
    expect(screen.getByText(/Avg:/)).toBeInTheDocument()
    expect(screen.getByText(/StdDev:/)).toBeInTheDocument()
    expect(screen.getByText(/Count:/)).toBeInTheDocument()
  })

  it('should render error state with client-side error', () => {
    render(<ResultDisplay result={null} error="Network connection failed" />)
    
    expect(screen.getByText('❌ Error Occurred')).toBeInTheDocument()
    expect(screen.getByText('General Error')).toBeInTheDocument()
    expect(screen.getByText('Network connection failed')).toBeInTheDocument()
  })

  it('should render error state with result error', () => {
    const mockResult = {
      success: false,
      error: 'Invalid Q syntax',
      dataType: 'SyntaxError'
    }

    render(<ResultDisplay result={mockResult} error={null} />)
    
    expect(screen.getByText('❌ Error Occurred')).toBeInTheDocument()
    expect(screen.getByText('Syntax Error')).toBeInTheDocument()
    expect(screen.getByText('Invalid Q syntax')).toBeInTheDocument()
  })

  it('should show error suggestions when available', () => {
    const mockResult = {
      success: false,
      error: 'Type error',
      errorDetails: {
        errorType: 'type',
        suggestions: ['Check variable types', 'Use proper casting']
      }
    }

    render(<ResultDisplay result={mockResult} error={null} />)
    
    expect(screen.getByText('💡 Suggestions')).toBeInTheDocument()
    expect(screen.getByText('Check variable types')).toBeInTheDocument()
    expect(screen.getByText('Use proper casting')).toBeInTheDocument()
  })

  it('should show documentation link when available', () => {
    const mockResult = {
      success: false,
      error: 'Domain error',
      errorDetails: {
        errorType: 'domain',
        relatedDocs: 'https://code.kx.com/q/ref/'
      }
    }

    render(<ResultDisplay result={mockResult} error={null} />)
    
    expect(screen.getByText('📚 Documentation')).toBeInTheDocument()
    
    const docLink = screen.getByText('View Q Documentation →')
    expect(docLink).toHaveAttribute('href', 'https://code.kx.com/q/ref/')
    expect(docLink).toHaveAttribute('target', '_blank')
  })

  it('should show quick actions section', () => {
    const mockResult = {
      success: false,
      error: 'Some error'
    }

    render(<ResultDisplay result={mockResult} error={null} />)
    
    expect(screen.getByText('🔧 Quick Actions')).toBeInTheDocument()
    expect(screen.getByText('• Try predefined queries')).toBeInTheDocument()
    expect(screen.getByText('• Check Q syntax')).toBeInTheDocument()
    expect(screen.getByText('• Use Ctrl+Enter to execute')).toBeInTheDocument()
  })

  it('should show browser console suggestion for failed results', () => {
    const mockResult = {
      success: false,
      error: 'Some error'
    }

    render(<ResultDisplay result={mockResult} error={null} />)
    
    expect(screen.getByText('• Check browser console')).toBeInTheDocument()
  })

  it('should display error timestamp', () => {
    const fixedDate = new Date('2025-05-25T12:00:00Z')
    vi.setSystemTime(fixedDate)
    
    const mockResult = {
      success: false,
      error: 'Some error',
      timestamp: fixedDate.toISOString()
    }

    render(<ResultDisplay result={mockResult} error={null} />)
    
    expect(screen.getByText(/Error occurred at/)).toBeInTheDocument()
  })

  it('should format different error types correctly', () => {
    const testCases = [
      { errorType: 'type', expected: 'Type Error' },
      { errorType: 'domain', expected: 'Domain Error' },
      { errorType: 'length', expected: 'Length Error' },
      { errorType: 'rank', expected: 'Rank Error' },
      { errorType: 'syntax', expected: 'Syntax Error' }
    ]

    testCases.forEach(({ errorType, expected }) => {
      const mockResult = {
        success: false,
        error: 'Test error',
        errorDetails: { errorType }
      }

      const { unmount } = render(<ResultDisplay result={mockResult} error={null} />)
      expect(screen.getByText(expected)).toBeInTheDocument()
      unmount()
    })
  })

  it('should handle formatted result data', () => {
    const mockResult = {
      success: true,
      data: [[1, 2], [3, 4]],
      arrayShape: { dimensions: [2, 2] }
    }

    render(<ResultDisplay result={mockResult} error={null} />)
    
    // Check that the result is formatted and displayed
    const preElement = document.querySelector('pre')
    expect(preElement).toBeInTheDocument()
    expect(preElement).toHaveClass('font-mono')
  })

  it('should handle non-array data', () => {
    const mockResult = {
      success: true,
      data: 42
    }

    render(<ResultDisplay result={mockResult} error={null} />)
    
    expect(screen.getByText('Success')).toBeInTheDocument()
    // Should not show array statistics for non-array data
    expect(screen.queryByText('Array Statistics')).not.toBeInTheDocument()
  })

  it('should have proper styling and layout', () => {
    const mockResult = {
      success: true,
      data: [1, 2, 3]
    }

    render(<ResultDisplay result={mockResult} error={null} />)
    
    const container = document.querySelector('.bg-white.rounded-lg.shadow-sm.border.p-6')
    expect(container).toBeInTheDocument()
  })

  it('should handle missing error details gracefully', () => {
    const mockResult = {
      success: false,
      error: 'Unknown error'
    }

    render(<ResultDisplay result={mockResult} error={null} />)
    
    // Should still render error without crashing
    expect(screen.getByText('❌ Error Occurred')).toBeInTheDocument()
    expect(screen.getByText('Unknown error')).toBeInTheDocument()
  })
})
