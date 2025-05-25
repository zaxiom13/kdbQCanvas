/**
 * WebSocket client for fast channel communication
 * Provides real-time query execution with minimal latency
 */
export class FastChannelClient {
  constructor(url = 'ws://localhost:8081/ws') {
    this.url = url
    this.ws = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.queryCallbacks = new Map()
    this.queryIdCounter = 0
    
    // Event listeners
    this.onConnected = null
    this.onDisconnected = null
    this.onError = null
    this.onMessage = null
  }
  
  /**
   * Connect to the WebSocket server
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)
        
        this.ws.onopen = () => {
          console.log('FastChannel WebSocket connected')
          this.isConnected = true
          this.reconnectAttempts = 0
          
          if (this.onConnected) {
            this.onConnected()
          }
          
          resolve()
        }
        
        this.ws.onclose = (event) => {
          console.log('FastChannel WebSocket disconnected', event)
          this.isConnected = false
          
          if (this.onDisconnected) {
            this.onDisconnected(event)
          }
          
          // Auto-reconnect if not a normal closure
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect()
          }
        }
        
        this.ws.onerror = (error) => {
          console.error('FastChannel WebSocket error', error)
          
          if (this.onError) {
            this.onError(error)
          }
          
          reject(error)
        }
        
        this.ws.onmessage = (event) => {
          this.handleMessage(event.data)
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
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
      this.isConnected = false
    }
  }
  
  /**
   * Execute a query on the fast channel
   */
  async executeQuery(query, timeout = 5000) {
    if (!this.isConnected) {
      throw new Error('FastChannel not connected')
    }
    
    const queryId = `query_${++this.queryIdCounter}_${Date.now()}`
    
    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeoutId = setTimeout(() => {
        this.queryCallbacks.delete(queryId)
        reject(new Error('Query timeout'))
      }, timeout)
      
      // Store callback
      this.queryCallbacks.set(queryId, (response) => {
        clearTimeout(timeoutId)
        this.queryCallbacks.delete(queryId)
        
        if (response.success) {
          resolve(response)
        } else {
          reject(new Error(response.error || 'Query failed'))
        }
      })
      
      // Send query
      const message = {
        id: queryId,
        query: query,
        timestamp: Date.now()
      }
      
      try {
        this.ws.send(JSON.stringify(message))
      } catch (error) {
        clearTimeout(timeoutId)
        this.queryCallbacks.delete(queryId)
        reject(error)
      }
    })
  }
  
  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(data) {
    try {
      const response = JSON.parse(data)
      
      // If this is a response to a specific query
      if (response.id && this.queryCallbacks.has(response.id)) {
        const callback = this.queryCallbacks.get(response.id)
        callback(response)
        return
      }
      
      // Handle broadcast messages
      if (this.onMessage) {
        this.onMessage(response)
      }
      
    } catch (error) {
      console.error('Error parsing WebSocket message', error)
    }
  }
  
  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1) // Exponential backoff
    
    console.log(`Scheduling FastChannel reconnect attempt ${this.reconnectAttempts} in ${delay}ms`)
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect().catch(error => {
          console.error('FastChannel reconnect failed', error)
        })
      }
    }, delay)
  }
  
  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      url: this.url,
      reconnectAttempts: this.reconnectAttempts
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
