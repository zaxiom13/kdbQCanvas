import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import ConnectionStatus from '../../components/status/ConnectionStatus'

describe('ConnectionStatus', () => {
  it('should render with connected status', () => {
    render(<ConnectionStatus connectionStatus="connected" />)
    
    expect(screen.getByText('Connection Status')).toBeInTheDocument()
    expect(screen.getByText('Connected')).toBeInTheDocument()
    expect(screen.getByText('Ready to execute Q expressions')).toBeInTheDocument()
  })

  it('should render with disconnected status', () => {
    render(<ConnectionStatus connectionStatus="disconnected" />)
    
    expect(screen.getByText('Q Process Not Running')).toBeInTheDocument()
    expect(screen.getByText('Make sure your Kotlin backend is running on port 8080')).toBeInTheDocument()
  })

  it('should render with error status', () => {
    render(<ConnectionStatus connectionStatus="error" />)
    
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Make sure your Kotlin backend is running on port 8080')).toBeInTheDocument()
  })

  it('should render with unavailable status', () => {
    render(<ConnectionStatus connectionStatus="unavailable" />)
    
    expect(screen.getByText('Unavailable')).toBeInTheDocument()
    expect(screen.getByText('Make sure your Kotlin backend is running on port 8080')).toBeInTheDocument()
  })

  it('should render with unknown status', () => {
    render(<ConnectionStatus connectionStatus="unknown" />)
    
    expect(screen.getByText('Unknown')).toBeInTheDocument()
    expect(screen.getByText('Make sure your Kotlin backend is running on port 8080')).toBeInTheDocument()
  })

  it('should show different colored indicators for different statuses', () => {
    const { rerender } = render(<ConnectionStatus connectionStatus="connected" />)
    
    // Check connected indicator (green)
    let indicator = document.querySelector('.bg-green-500')
    expect(indicator).toBeInTheDocument()
    
    // Check disconnected indicator (yellow)
    rerender(<ConnectionStatus connectionStatus="disconnected" />)
    indicator = document.querySelector('.bg-yellow-500')
    expect(indicator).toBeInTheDocument()
    
    // Check error indicator (red)
    rerender(<ConnectionStatus connectionStatus="error" />)
    indicator = document.querySelector('.bg-red-500')
    expect(indicator).toBeInTheDocument()
    
    // Check unknown indicator (gray)
    rerender(<ConnectionStatus connectionStatus="unknown" />)
    indicator = document.querySelector('.bg-gray-400')
    expect(indicator).toBeInTheDocument()
  })

  it('should have proper component structure', () => {
    render(<ConnectionStatus connectionStatus="connected" />)
    
    // Check for main container
    const container = document.querySelector('.bg-white.rounded-lg.shadow-sm.border.p-6')
    expect(container).toBeInTheDocument()
    
    // Check for title
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Connection Status')
  })
})
