package org.example.communication

import org.example.api.QueryResponseDto
import java.util.concurrent.CompletableFuture

/**
 * Abstract communication protocol interface for handling queries.
 * Allows for different implementations (HTTP, WebSocket, TCP, etc.)
 */
interface CommunicationProtocol {
    /**
     * Execute a query synchronously
     */
    suspend fun executeQuery(query: String): QueryResponseDto
    
    /**
     * Execute a query asynchronously
     */
    fun executeQueryAsync(query: String): CompletableFuture<QueryResponseDto>
    
    /**
     * Start the communication protocol
     */
    fun start()
    
    /**
     * Stop the communication protocol
     */
    fun stop()
    
    /**
     * Check if the protocol is running
     */
    fun isRunning(): Boolean
    
    /**
     * Get protocol-specific connection status
     */
    fun getConnectionStatus(): ConnectionStatus
}

/**
 * Communication channel types for different performance requirements
 */
enum class ChannelType {
    STANDARD,  // Regular HTTP API for normal queries
    FAST       // WebSocket/TCP for live mode and real-time queries
}

/**
 * Connection status information
 */
data class ConnectionStatus(
    val isConnected: Boolean,
    val protocolType: String,
    val latencyMs: Long? = null,
    val lastError: String? = null,
    val timestamp: Long = System.currentTimeMillis()
)
