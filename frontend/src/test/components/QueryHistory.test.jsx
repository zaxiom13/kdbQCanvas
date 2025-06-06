import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import QueryHistory from '../../components/history/QueryHistory'

describe('QueryHistory', () => {
  const mockSetQuery = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render empty state when no history', () => {
    render(<QueryHistory history={[]} setQuery={mockSetQuery} />)
    
    expect(screen.getByText('Query History')).toBeInTheDocument()
    expect(screen.getByText('🕒')).toBeInTheDocument()
    expect(screen.getByText('No queries executed yet')).toBeInTheDocument()
  })

  it('should render history count when history exists', () => {
    const mockHistory = [
      {
        query: 'til 8',
        timestamp: '12:00:00',
        result: { success: true },
        isLiveMode: false
      },
      {
        query: 'mouseX + mouseY',
        timestamp: '12:01:00',
        result: { success: false },
        isLiveMode: true
      }
    ]

    render(<QueryHistory history={mockHistory} setQuery={mockSetQuery} />)
    
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Query History')).toBeInTheDocument()
  })

  it('should render individual history items', () => {
    const mockHistory = [
      {
        query: 'til 8',
        timestamp: '12:00:00',
        result: { success: true },
        isLiveMode: false
      }
    ]

    render(<QueryHistory history={mockHistory} setQuery={mockSetQuery} />)
    
    expect(screen.getByText('til 8')).toBeInTheDocument()
    expect(screen.getByText('12:00:00')).toBeInTheDocument()
    expect(screen.getByText('✓ Success')).toBeInTheDocument()
  })

  it('should show live mode indicator', () => {
    const mockHistory = [
      {
        query: 'mouseX + mouseY',
        timestamp: '12:01:00',
        result: { success: true },
        isLiveMode: true
      }
    ]

    render(<QueryHistory history={mockHistory} setQuery={mockSetQuery} />)
    
    expect(screen.getByText('🔴 Live Mode')).toBeInTheDocument()
  })

  it('should show failed status', () => {
    const mockHistory = [
      {
        query: 'invalid query',
        timestamp: '12:02:00',
        result: { success: false },
        isLiveMode: false
      }
    ]

    render(<QueryHistory history={mockHistory} setQuery={mockSetQuery} />)
    
    expect(screen.getByText('✗ Failed')).toBeInTheDocument()
  })

  it('should call setQuery when history item is clicked', async () => {
    const user = userEvent.setup()
    const mockHistory = [
      {
        query: 'til 8',
        timestamp: '12:00:00',
        result: { success: true },
        isLiveMode: false
      }
    ]

    render(<QueryHistory history={mockHistory} setQuery={mockSetQuery} />)
    
    const historyItem = screen.getByText('til 8').closest('.cursor-pointer')
    await user.click(historyItem)
    
    expect(mockSetQuery).toHaveBeenCalledWith('til 8')
  })

  it('should show live mode session details', () => {
    const mockHistory = [
      {
        query: 'mouseX + mouseY',
        timestamp: '12:01:00',
        endTime: '12:02:00',
        latestTimestamp: '12:01:45',
        executionCount: 15,
        result: { success: true },
        isLiveMode: true
      }
    ]

    render(<QueryHistory history={mockHistory} setQuery={mockSetQuery} />)
    
    expect(screen.getByText('Started: 12:01:00')).toBeInTheDocument()
    expect(screen.getByText('Ended: 12:02:00')).toBeInTheDocument()
    expect(screen.getByText('15 executions')).toBeInTheDocument()
  })

  it('should show ongoing live mode session', () => {
    const mockHistory = [
      {
        query: 'mouseX + mouseY',
        timestamp: '12:01:00',
        latestTimestamp: '12:01:45',
        executionCount: 8,
        result: { success: true },
        isLiveMode: true
      }
    ]

    render(<QueryHistory history={mockHistory} setQuery={mockSetQuery} />)
    
    expect(screen.getByText('Last: 12:01:45')).toBeInTheDocument()
    expect(screen.getByText('8 executions')).toBeInTheDocument()
    
    // Should show pulsing indicator for ongoing session
    const pulsingIndicator = document.querySelector('.animate-pulse')
    expect(pulsingIndicator).toBeInTheDocument()
  })

  it('should show channel information', () => {
    const mockHistory = [
      {
        query: 'til 8',
        timestamp: '12:00:00',
        result: { success: true },
        isLiveMode: false,
        channel: 'fast'
      },
      {
        query: 'mouseX + mouseY',
        timestamp: '12:01:00',
        result: { success: true },
        isLiveMode: false,
        channel: 'standard'
      }
    ]

    render(<QueryHistory history={mockHistory} setQuery={mockSetQuery} />)
    
    expect(screen.getByText('WS')).toBeInTheDocument() // fast channel
    expect(screen.getByText('HTTP')).toBeInTheDocument() // standard channel
  })

  it('should have hover effects on history items', () => {
    const mockHistory = [
      {
        query: 'til 8',
        timestamp: '12:00:00',
        result: { success: true },
        isLiveMode: false
      }
    ]

    render(<QueryHistory history={mockHistory} setQuery={mockSetQuery} />)
    
    const historyItem = document.querySelector('.hover\\:bg-indigo-50')
    expect(historyItem).toBeInTheDocument()
  })

  it('should truncate long queries', () => {
    const longQuery = 'this is a very long query that should be truncated ' + 'a'.repeat(100)
    const mockHistory = [
      {
        query: longQuery,
        timestamp: '12:00:00',
        result: { success: true },
        isLiveMode: false
      }
    ]

    render(<QueryHistory history={mockHistory} setQuery={mockSetQuery} />)
    
    const queryElement = document.querySelector('.truncate')
    expect(queryElement).toBeInTheDocument()
  })

  it('should show retry button on hover', () => {
    const mockHistory = [
      {
        query: 'til 8',
        timestamp: '12:00:00',
        result: { success: true },
        isLiveMode: false
      }
    ]

    render(<QueryHistory history={mockHistory} setQuery={mockSetQuery} />)
    
    const retryButton = screen.getByText('↻')
    expect(retryButton).toHaveClass('opacity-0', 'group-hover:opacity-100')
  })

  it('should handle multiple history items correctly', () => {
    const mockHistory = [
      {
        query: 'til 8',
        timestamp: '12:00:00',
        result: { success: true },
        isLiveMode: false
      },
      {
        query: 'mouseX + mouseY',
        timestamp: '12:01:00',
        result: { success: false },
        isLiveMode: true
      },
      {
        query: '8 8#64?1.0',
        timestamp: '12:02:00',
        result: { success: true },
        isLiveMode: false
      }
    ]

    render(<QueryHistory history={mockHistory} setQuery={mockSetQuery} />)
    
    expect(screen.getAllByText(/✓ Success|✗ Failed/)).toHaveLength(3)
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
