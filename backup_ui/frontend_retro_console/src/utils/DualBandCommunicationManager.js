import { FastChannelClient } from './FastChannelClient.js'

/**
 * Dual-band communication manager for the frontend
 * Manages both HTTP (standard) and WebSocket (fast) channels
 */
export class DualBandCommunicationManager {
  constructor(httpBaseUrl = 'http://localhost:8080', wsUrl = 'ws://localhost:8081/ws') {
    this.httpBaseUrl = httpBaseUrl
    this.wsUrl = wsUrl
    this.fastChannel = new FastChannelClient(wsUrl)
    
    // Performance tracking
    this.metrics = {
      standard: { totalRequests: 0, totalLatency: 0, failures: 0 },
      fast: { totalRequests: 0, totalLatency: 0, failures: 0 }
    }
    
    // Connection status
    this.connectionStatus = {
      standard: { isConnected: false, lastError: null },
      fast: { isConnected: false, lastError: null }
    }
    
    // Event listeners
    this.onConnectionStatusChange = null
    
    this.setupFastChannelEvents()
  }
  
  /**
   * Initialize connections
   */
  async initialize() {
    try {
      // Test standard channel
      await this.testStandardChannel()
      
      // Connect to fast channel
      await this.fastChannel.connect()
      
      console.log('DualBandCommunicationManager initialized successfully')
    } catch (error) {
      console.warn('Failed to initialize all channels', error)
    }
  }
  
  /**
   * Execute query with automatic channel selection
   */
  async executeQuery(query, options = {}) {
    const {
      channelHint = this.selectOptimalChannel(query, options),
      timeout = 5000,
      isLiveMode = false
    } = options
    
    const startTime = Date.now()
    
    try {
      let result
      
      if (channelHint === 'fast' && this.fastChannel.isConnected) {
        result = await this.executeOnFastChannel(query, timeout)
        this.updateMetrics('fast', Date.now() - startTime, true)
      } else {
        result = await this.executeOnStandardChannel(query, timeout)
        this.updateMetrics('standard', Date.now() - startTime, true)
      }
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      this.updateMetrics(channelHint, duration, false)
      throw error
    }
  }
  
  /**
   * Execute query on standard HTTP channel
   */
  async executeOnStandardChannel(query, timeout = 5000) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(`${this.httpBaseUrl}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      this.updateConnectionStatus('standard', true, null)
      return data
      
    } catch (error) {
      clearTimeout(timeoutId)
      this.updateConnectionStatus('standard', false, error.message)
      throw error
    }
  }
  
  /**
   * Execute query on fast WebSocket channel
   */
  async executeOnFastChannel(query, timeout = 5000) {
    try {
      const result = await this.fastChannel.executeQuery(query, timeout)
      this.updateConnectionStatus('fast', true, null)
      return result
    } catch (error) {
      this.updateConnectionStatus('fast', false, error.message)
      throw error
    }
  }
  
  /**
   * Select optimal channel based on query characteristics
   */
  selectOptimalChannel(query, options = {}) {
    const { isLiveMode = false, forceChannel = null } = options
    
    if (forceChannel) {
      return forceChannel
    }
    
    // Use fast channel for live mode
    if (isLiveMode) {
      return 'fast'
    }
    
    // Use fast channel for mouse-related queries
    if (query.includes('mouseX') || query.includes('mouseY')) {
      return 'fast'
    }
    
    // Use fast channel if it's connected and query is simple
    if (this.fastChannel.isConnected && this.isSimpleQuery(query)) {
      return 'fast'
    }
    
    // Default to standard channel
    return 'standard'
  }
  
  /**
   * Check if query is simple enough for fast channel
   */
  isSimpleQuery(query) {
    const simplePatterns = [
      /^\d+[\+\-\*\/]\d+$/, // Basic arithmetic
      /^til\s+\d+$/, // til queries
      /^mouseX/, // Mouse queries
      /^mouseY/, // Mouse queries
    ]
    
    return simplePatterns.some(pattern => pattern.test(query.trim()))
  }
  
  /**
   * Test standard channel connectivity
   */
  async testStandardChannel() {
    try {
      const response = await fetch(`${this.httpBaseUrl}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        this.updateConnectionStatus('standard', true, null)
        return true
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      this.updateConnectionStatus('standard', false, error.message)
      return false
    }
  }
  
  /**
   * Get current connection status
   */
  getConnectionStatus() {
    return {
      standard: { ...this.connectionStatus.standard },
      fast: {
        ...this.connectionStatus.fast,
        isConnected: this.fastChannel.isConnected
      }
    }
  }
  
  /**
   * Get performance metrics
   */
  getMetrics() {
    const calculateAverage = (channel) => {
      const metrics = this.metrics[channel]
      return metrics.totalRequests > 0 ? metrics.totalLatency / metrics.totalRequests : 0
    }
    
    return {
      standard: {
        ...this.metrics.standard,
        averageLatency: calculateAverage('standard'),
        successRate: this.calculateSuccessRate('standard')
      },
      fast: {
        ...this.metrics.fast,
        averageLatency: calculateAverage('fast'),
        successRate: this.calculateSuccessRate('fast')
      }
    }
  }
  
  /**
   * Calculate success rate for a channel
   */
  calculateSuccessRate(channel) {
    const metrics = this.metrics[channel]
    if (metrics.totalRequests === 0) return 100
    return ((metrics.totalRequests - metrics.failures) / metrics.totalRequests) * 100
  }
  
  /**
   * Update performance metrics
   */
  updateMetrics(channel, latency, success) {
    const metrics = this.metrics[channel]
    metrics.totalRequests++
    metrics.totalLatency += latency
    
    if (!success) {
      metrics.failures++
    }
  }
  
  /**
   * Update connection status
   */
  updateConnectionStatus(channel, isConnected, error) {
    const oldStatus = this.connectionStatus[channel].isConnected
    this.connectionStatus[channel] = { isConnected, lastError: error }
    
    // Notify if status changed
    if (oldStatus !== isConnected && this.onConnectionStatusChange) {
      this.onConnectionStatusChange(channel, isConnected, error)
    }
  }
  
  /**
   * Set up fast channel event listeners
   */
  setupFastChannelEvents() {
    this.fastChannel.setEventListeners({
      onConnected: () => {
        this.updateConnectionStatus('fast', true, null)
      },
      onDisconnected: (event) => {
        this.updateConnectionStatus('fast', false, `Disconnected: ${event.code}`)
      },
      onError: (error) => {
        this.updateConnectionStatus('fast', false, error.message)
      },
      onMessage: (message) => {
        // Handle broadcast messages if needed
        console.log('FastChannel broadcast message:', message)
      }
    })
  }
  
  /**
   * Disconnect all channels
   */
  disconnect() {
    this.fastChannel.disconnect()
  }
  
  /**
   * Set connection status change listener
   */
  setConnectionStatusChangeListener(listener) {
    this.onConnectionStatusChange = listener
  }
}
