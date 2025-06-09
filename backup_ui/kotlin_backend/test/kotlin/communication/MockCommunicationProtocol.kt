package org.example.communication

import org.example.api.QueryResponseDto
import org.example.QIPC.ArrayShapeAnalyzer
import kotlinx.coroutines.delay
import java.util.concurrent.CompletableFuture
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Mock communication protocol for testing purposes.
 * Allows simulation of different network conditions and responses.
 */
class MockCommunicationProtocol(
    private val protocolName: String = "Mock",
    private val simulatedLatencyMs: Long = 0,
    private val failureRate: Double = 0.0 // 0.0 = never fail, 1.0 = always fail
) : CommunicationProtocol {
    
    private val isRunning = AtomicBoolean(false)
    private var queryCounter = 0
    
    // Predefined responses for specific queries
    private val predefinedResponses = mutableMapOf<String, QueryResponseDto>()
    
    init {
        // Set up some default responses
        predefinedResponses["1+1"] = QueryResponseDto(
            success = true,
            data = 2L,
            dataType = "long",
            timestamp = System.currentTimeMillis()
        )
        
        predefinedResponses["til 5"] = QueryResponseDto(
            success = true,
            data = longArrayOf(0, 1, 2, 3, 4),
            dataType = "long[]",
            arrayShape = ArrayShapeAnalyzer.ArrayShape(
                dimensions = listOf(5),
                totalElements = 5,
                elementType = "long",
                isJagged = false
            ),
            timestamp = System.currentTimeMillis()
        )
        
        predefinedResponses["'error"] = QueryResponseDto(
            success = false,
            error = "type",
            dataType = "error",
            timestamp = System.currentTimeMillis()
        )
    }
    
    override suspend fun executeQuery(query: String): QueryResponseDto {
        if (!isRunning.get()) {
            return QueryResponseDto(
                success = false,
                error = "Protocol not running",
                timestamp = System.currentTimeMillis()
            )
        }
        
        // Simulate network latency
        if (simulatedLatencyMs > 0) {
            delay(simulatedLatencyMs)
        }
        
        queryCounter++
        
        // Simulate random failures
        if (Math.random() < failureRate) {
            return QueryResponseDto(
                success = false,
                error = "Simulated network failure",
                timestamp = System.currentTimeMillis()
            )
        }
        
        // Return predefined response if available
        predefinedResponses[query]?.let { response ->
            return response.copy(timestamp = System.currentTimeMillis())
        }
        
        // Default response for unknown queries
        return QueryResponseDto(
            success = true,
            data = "Mock response for: $query",
            dataType = "string",
            timestamp = System.currentTimeMillis()
        )
    }
    
    override fun executeQueryAsync(query: String): CompletableFuture<QueryResponseDto> {
        return CompletableFuture.supplyAsync {
            kotlinx.coroutines.runBlocking {
                executeQuery(query)
            }
        }
    }
    
    override fun start() {
        isRunning.set(true)
    }
    
    override fun stop() {
        isRunning.set(false)
    }
    
    override fun isRunning(): Boolean = isRunning.get()
    
    override fun getConnectionStatus(): ConnectionStatus {
        return ConnectionStatus(
            isConnected = isRunning.get(),
            protocolType = protocolName,
            latencyMs = simulatedLatencyMs,
            lastError = if (isRunning.get()) null else "Protocol stopped"
        )
    }
    
    /**
     * Add a custom response for a specific query
     */
    fun addPredefinedResponse(query: String, response: QueryResponseDto) {
        predefinedResponses[query] = response
    }
    
    /**
     * Remove a predefined response
     */
    fun removePredefinedResponse(query: String) {
        predefinedResponses.remove(query)
    }
    
    /**
     * Get the number of queries executed
     */
    fun getQueryCount(): Int = queryCounter
    
    /**
     * Reset query counter
     */
    fun resetQueryCounter() {
        queryCounter = 0
    }
    
    /**
     * Clear all predefined responses
     */
    fun clearPredefinedResponses() {
        predefinedResponses.clear()
    }
}
