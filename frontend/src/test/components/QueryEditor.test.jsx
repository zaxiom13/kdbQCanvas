import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import QueryEditor from '../../components/editor/QueryEditor'

describe('QueryEditor', () => {
  const mockProps = {
    query: '',
    setQuery: vi.fn(),
    loading: false,
    executeQuery: vi.fn(),
    isLiveMode: false,
    toggleLiveMode: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with default props', () => {
    render(<QueryEditor {...mockProps} />)
    
    expect(screen.getByText('⚡')).toBeInTheDocument()
    expect(screen.getByText('Q Expression Editor')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByText('Execute Q Expression')).toBeInTheDocument()
  })

  it('should display query value in textarea', () => {
    const testQuery = 'til 8'
    render(<QueryEditor {...mockProps} query={testQuery} />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea.value).toBe(testQuery)
  })

  it('should call setQuery when textarea value changes', async () => {
    const user = userEvent.setup()
    render(<QueryEditor {...mockProps} />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'new query')
    
    expect(mockProps.setQuery).toHaveBeenCalled()
  })

  it('should call executeQuery when execute button is clicked', async () => {
    const user = userEvent.setup()
    render(<QueryEditor {...mockProps} query="til 8" />)
    
    const executeButton = screen.getByText('Execute Q Expression')
    await user.click(executeButton)
    
    expect(mockProps.executeQuery).toHaveBeenCalledTimes(1)
  })

  it('should disable execute button when loading', () => {
    render(<QueryEditor {...mockProps} loading={true} />)
    
    const executeButton = screen.getByText('Executing...')
    expect(executeButton).toBeDisabled()
  })

  it('should disable execute button when query is empty', () => {
    render(<QueryEditor {...mockProps} query="" />)
    
    const executeButton = screen.getByText('Execute Q Expression')
    expect(executeButton).toBeDisabled()
  })

  it('should disable execute button when query is only whitespace', () => {
    render(<QueryEditor {...mockProps} query="   " />)
    
    const executeButton = screen.getByText('Execute Q Expression')
    expect(executeButton).toBeDisabled()
  })

  it('should show loading state correctly', () => {
    render(<QueryEditor {...mockProps} loading={true} />)
    
    expect(screen.getByText('Executing...')).toBeInTheDocument()
    expect(screen.getByText('⏳')).toBeInTheDocument()
  })

  it('should handle live mode toggle', async () => {
    const user = userEvent.setup()
    render(<QueryEditor {...mockProps} query="mouseX + mouseY" />)
    
    const liveButton = screen.getByText('Live')
    await user.click(liveButton)
    
    expect(mockProps.toggleLiveMode).toHaveBeenCalledTimes(1)
  })

  it('should disable live mode button when query has no mouse variables', () => {
    render(<QueryEditor {...mockProps} query="til 8" />)
    
    const liveButton = screen.getByText('Live')
    expect(liveButton).toBeDisabled()
  })

  it('should enable live mode button when query has mouse variables', () => {
    render(<QueryEditor {...mockProps} query="mouseX + mouseY" />)
    
    const liveButton = screen.getByText('Live')
    expect(liveButton).not.toBeDisabled()
  })

  it('should show stop button when in live mode', () => {
    render(<QueryEditor {...mockProps} isLiveMode={true} />)
    
    expect(screen.getByText('Stop')).toBeInTheDocument()
    expect(screen.getByText('⏹')).toBeInTheDocument()
  })

  it('should execute query on Ctrl+Enter', () => {
    render(<QueryEditor {...mockProps} query="til 8" />)
    
    const textarea = screen.getByRole('textbox')
    fireEvent.keyDown(textarea, {
      key: 'Enter',
      ctrlKey: true
    })
    
    expect(mockProps.executeQuery).toHaveBeenCalledTimes(1)
  })

  it('should not execute query on Enter without Ctrl', () => {
    render(<QueryEditor {...mockProps} query="til 8" />)
    
    const textarea = screen.getByRole('textbox')
    fireEvent.keyDown(textarea, {
      key: 'Enter',
      ctrlKey: false
    })
    
    expect(mockProps.executeQuery).not.toHaveBeenCalled()
  })

  it('should disable textarea when loading', () => {
    render(<QueryEditor {...mockProps} loading={true} />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
  })

  it('should show correct placeholder text', () => {
    render(<QueryEditor {...mockProps} />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea.placeholder).toContain('Enter your Q expression here')
  })

  it('should show keyboard shortcut hint', () => {
    render(<QueryEditor {...mockProps} />)
    
    expect(screen.getByText('Ctrl+Enter to execute')).toBeInTheDocument()
  })
})
