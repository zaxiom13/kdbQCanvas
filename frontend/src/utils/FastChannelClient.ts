/**
 * WebSocket client for fast channel communication
 * Provides real-time query execution with minimal latency
 * Optimized for high-frequency live mode queries
 */
export class FastChannelClient {
  url: string
  ws: WebSocket | null
  isConnected: boolean
  reconnectAttempts: number
  maxReconnectAttempts: number
  reconnectDelay: number
  queryCallbacks: Map<string, (response: any) => void>
  queryIdCounter: number
  pendingQueries: Set<string>
  lastQueryTime: number
  minQueryInterval: number
  reuseableMessage: { id: string | null; query: string | null; timestamp: number | null }
  onConnected: (() => void) | null
  onDisconnected: ((event: CloseEvent) => void) | null
  onError: ((error: any) => void) | null
  onMessage: ((message: any) => void) | null

  constructor(url = 'ws://localhost:8081/ws') {
    this.url = url
    this.ws = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.queryCallbacks = new Map()
    this.queryIdCounter = 0
    
    // Performance optimizations
    this.pendingQueries = new Set() // Track pending queries to avoid duplicates
    this.lastQueryTime = 0
    this.minQueryInterval = 8 // Reduced from 16ms to 8ms for faster live mode updates
    
    // Reusable message object to reduce GC pressure
    this.reuseableMessage = {
      id: null,
      query: null,
      timestamp: null
    }
    
    // Event listeners
    this.onConnected = null
    this.onDisconnected = null
    this.onError = null
    this.onMessage = null
    
    // Auto-connect
    this.connect()
  }
  
  /**
   * Connect to the WebSocket server
   */
  async connect() {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return Promise.resolve(undefined)
    }
    
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)
        
        this.ws.onopen = () => {
          this.isConnected = true
          this.reconnectAttempts = 0
          console.log('FastChannel connected')
          if (this.onConnected) this.onConnected()
          resolve()
        }
        
        this.ws.onmessage = (event) => {
          this.handleMessage(event.data)
        }
        
        this.ws.onclose = (event) => {
          this.isConnected = false
          console.log('FastChannel disconnected')
          if (this.onDisconnected) this.onDisconnected(event)
          this.handleReconnect()
        }
        
        this.ws.onerror = (error) => {
          console.error('FastChannel error:', error)
          if (this.onError) this.onError(error)
          reject(error)
        }
      } catch (error) {
        reject(error)
      }
    })
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnected = false
    this.queryCallbacks.clear()
    this.pendingQueries.clear()
  }
  
  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(data) {
    try {
      const response = JSON.parse(data)
      
      if (this.onMessage) {
        this.onMessage(response)
      }
      
      if (response.id && this.queryCallbacks.has(response.id)) {
        const callback = this.queryCallbacks.get(response.id)
        this.queryCallbacks.delete(response.id)
        this.pendingQueries.delete(response.id)
        callback(response)
      }
    } catch (error) {
      console.error('FastChannel message parsing error:', error)
    }
  }
  
  /**
   * Schedule reconnection attempt
   */
  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      console.log(`FastChannel reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)
      setTimeout(() => this.connect(), delay)
    } else {
      console.error('FastChannel max reconnection attempts reached')
    }
  }
  
  /**
   * Execute a query on the fast channel with optimizations for live mode
   */
  async executeQuery(query, timeout = 5000) {
    if (!this.isConnected) {
      throw new Error('FastChannel not connected')
    }
    
    // Optimized throttling for live mode queries
    const isLiveModeQuery = query.includes('mouseX') || query.includes('mouseY')
    const throttleInterval = isLiveModeQuery ? 4 : this.minQueryInterval // 4ms for live mode (250 FPS max)
    
    const now = Date.now()
    if (now - this.lastQueryTime < throttleInterval) {
      // For live mode, return a quick skip to maintain responsiveness
      if (isLiveModeQuery) {
        return { success: false, error: 'Query throttled for responsiveness', throttled: true }
      }
      // For regular queries, honor the throttle
      return { success: false, error: 'Query throttled', throttled: true }
    }
    this.lastQueryTime = now
    
    const queryId = `query_${++this.queryIdCounter}_${now}`
    
    // Check for duplicate pending queries (for live mode efficiency)
    if (this.pendingQueries.has(query)) {
      return { success: false, error: 'Duplicate query pending', duplicate: true }
    }
    
    return new Promise((resolve, reject) => {
      // Set up timeout - shorter for live mode for better responsiveness
      const actualTimeout = isLiveModeQuery ? Math.min(timeout, 500) : timeout
      const timeoutId = setTimeout(() => {
        this.queryCallbacks.delete(queryId)
        this.pendingQueries.delete(queryId)
        reject(new Error(`Query timeout after ${actualTimeout}ms`))
      }, actualTimeout)
      
      // Store callback
      this.queryCallbacks.set(queryId, (response) => {
        clearTimeout(timeoutId)
        this.queryCallbacks.delete(queryId)
        this.pendingQueries.delete(queryId)
        
        if (response.success) {
          resolve(response)
        } else {
          reject(new Error(response.error || 'Query failed'))
        }
      })
      
      // Track pending query
      this.pendingQueries.add(queryId)
      
      // Optimize message creation to reduce GC pressure
      this.reuseableMessage.id = queryId
      this.reuseableMessage.query = query
      this.reuseableMessage.timestamp = now
      
      try {
        this.ws.send(JSON.stringify(this.reuseableMessage))
      } catch (error) {
        clearTimeout(timeoutId)
        this.queryCallbacks.delete(queryId)
        this.pendingQueries.delete(queryId)
        reject(error)
      }
    })
  }
  
  /**
   * Optimized query execution for live mode - fire and forget with minimal overhead
   */
  executeQueryFireAndForget(query) {
    if (!this.isConnected) {
      return false
    }
    
    // Ultra-fast path: no callbacks, no timeouts, minimal overhead
    const now = Date.now()
    if (now - this.lastQueryTime < this.minQueryInterval) {
      return false // Skip throttled query
    }
    this.lastQueryTime = now
    
    try {
      // Even more optimized - directly send without complex message creation
      this.ws.send(JSON.stringify({
        id: `fire_${++this.queryIdCounter}`,
        query: query,
        timestamp: now
      }))
      return true
    } catch (error) {
      console.warn('Fire-and-forget query failed:', error)
      return false
    }
  }
  
  /**
   * Get connection statistics for monitoring
   */
  getStats() {
    return {
      isConnected: this.isConnected,
      pendingQueries: this.pendingQueries.size,
      pendingCallbacks: this.queryCallbacks.size,
      reconnectAttempts: this.reconnectAttempts,
      queryCounter: this.queryIdCounter
    }
  }
  
  /**
   * Set event listeners
   */
  setEventListeners({ onConnected, onDisconnected, onError, onMessage }) {
    this.onConnected = onConnected
    this.onDisconnected = onDisconnected
    this.onError = onError
    this.onMessage = onMessage
  }
}
