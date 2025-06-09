package org.example.communication

import org.example.config.CommunicationConfig
import org.example.QProcessManager
import org.example.api.QueryResponseDto
import org.slf4j.LoggerFactory
import java.util.concurrent.CompletableFuture
import java.util.concurrent.ConcurrentHashMap

/**
 * Dual-band communication manager that routes queries to appropriate channels
 * based on performance requirements.
 */
class DualBandCommunicationManager(
    private val qManager: QProcessManager,
    private val config: CommunicationConfig = CommunicationConfig.default()
) {
    private val logger = LoggerFactory.getLogger(DualBandCommunicationManager::class.java)
    
    private var standardProtocol: CommunicationProtocol? = null
    private var fastProtocol: CommunicationProtocol? = null
    
    // Performance monitoring
    private val channelMetrics = ConcurrentHashMap<ChannelType, ChannelMetrics>()
    
    init {
        // Validate configuration
        val configErrors = config.validate()
        if (configErrors.isNotEmpty()) {
            throw IllegalArgumentException("Invalid configuration: ${configErrors.joinToString(", ")}")
        }
        
        channelMetrics[ChannelType.STANDARD] = ChannelMetrics()
        channelMetrics[ChannelType.FAST] = ChannelMetrics()
        
        logger.info("Initialized DualBandCommunicationManager with config: ${config}")
    }
    
    fun start() {
        if (!config.enableDualBand) {
            logger.info("Dual-band communication disabled, starting only standard HTTP protocol")
            standardProtocol = HttpCommunicationProtocol(qManager, config.httpPort)
            standardProtocol?.start()
            return
        }
        
        logger.info("Starting dual-band communication manager")
        
        // Start standard HTTP protocol
        standardProtocol = HttpCommunicationProtocol(qManager, config.httpPort)
        standardProtocol?.start()
        
        // Start fast WebSocket protocol  
        fastProtocol = WebSocketCommunicationProtocol(qManager, config.websocketPort)
        fastProtocol?.start()
        
        logger.info("Dual-band communication manager started - Standard: ${config.httpPort}, Fast: ${config.websocketPort}")
    }
    
    fun stop() {
        logger.info("Stopping dual-band communication manager")
        standardProtocol?.stop()
        fastProtocol?.stop()
        logger.info("Dual-band communication manager stopped")
    }
    
    /**
     * Execute query on the most appropriate channel
     */
    suspend fun executeQuery(query: String, channelHint: ChannelType = ChannelType.STANDARD): QueryResponseDto {
        val protocol = getProtocolForChannel(channelHint)
        val startTime = System.currentTimeMillis()
        
        return try {
            val result = protocol.executeQuery(query)
            val duration = System.currentTimeMillis() - startTime
            // Update metrics based on the actual success status of the response
            updateMetrics(channelHint, duration, result.success)
            result
        } catch (e: Exception) {
            val duration = System.currentTimeMillis() - startTime
            updateMetrics(channelHint, duration, false)
            logger.error("Query execution failed on $channelHint channel", e)
            throw e
        }
    }
    
    /**
     * Execute query asynchronously on the most appropriate channel
     */
    fun executeQueryAsync(query: String, channelHint: ChannelType = ChannelType.STANDARD): CompletableFuture<QueryResponseDto> {
        val protocol = getProtocolForChannel(channelHint)
        val startTime = System.currentTimeMillis()
        
        return protocol.executeQueryAsync(query)
            .whenComplete { result, throwable ->
                val duration = System.currentTimeMillis() - startTime
                // Update metrics based on exception OR response success status
                val success = throwable == null && (result?.success == true)
                updateMetrics(channelHint, duration, success)
            }
    }
    
    /**
     * Get connection status for all channels
     */
    fun getConnectionStatus(): Map<ChannelType, ConnectionStatus> {
        return mapOf(
            ChannelType.STANDARD to (standardProtocol?.getConnectionStatus() ?: 
                ConnectionStatus(false, "HTTP", null, "Not initialized")),
            ChannelType.FAST to (fastProtocol?.getConnectionStatus() ?: 
                ConnectionStatus(false, "WebSocket", null, "Not initialized"))
        )
    }
    
    /**
     * Get performance metrics for all channels
     */
    fun getMetrics(): Map<ChannelType, ChannelMetrics> {
        return channelMetrics.toMap()
    }
    
    /**
     * Automatically select the best channel based on query characteristics
     */
    fun selectOptimalChannel(query: String, isLiveMode: Boolean = false): ChannelType {
        if (!config.enableDualBand || !config.autoChannelSelection) {
            return ChannelType.STANDARD
        }
        
        return when {
            isLiveMode && config.liveModeForceFastChannel -> ChannelType.FAST
            config.preferFastChannel && fastProtocol != null -> {
                val fastMetrics = channelMetrics[ChannelType.FAST]
                if (fastMetrics != null && fastMetrics.averageLatencyMs < config.fastChannelLatencyThresholdMs) {
                    ChannelType.FAST
                } else {
                    ChannelType.STANDARD
                }
            }
            query.contains("mouseX") || query.contains("mouseY") -> ChannelType.FAST
            else -> ChannelType.STANDARD
        }
    }
    
    private fun getProtocolForChannel(channelType: ChannelType): CommunicationProtocol {
        return when (channelType) {
            ChannelType.STANDARD -> standardProtocol ?: throw IllegalStateException("Standard protocol not initialized")
            ChannelType.FAST -> fastProtocol ?: throw IllegalStateException("Fast protocol not initialized")
        }
    }
    
    private fun updateMetrics(channelType: ChannelType, durationMs: Long, success: Boolean) {
        channelMetrics[channelType]?.let { metrics ->
            metrics.totalRequests++
            metrics.totalLatencyMs += durationMs
            metrics.averageLatencyMs = metrics.totalLatencyMs / metrics.totalRequests
            
            if (success) {
                metrics.successfulRequests++
            } else {
                metrics.failedRequests++
            }
            
            if (durationMs < metrics.minLatencyMs || metrics.minLatencyMs == 0L) {
                metrics.minLatencyMs = durationMs
            }
            
            if (durationMs > metrics.maxLatencyMs) {
                metrics.maxLatencyMs = durationMs
            }
        }
    }
}

/**
 * Performance metrics for a communication channel
 */
data class ChannelMetrics(
    var totalRequests: Long = 0,
    var successfulRequests: Long = 0,
    var failedRequests: Long = 0,
    var totalLatencyMs: Long = 0,
    var averageLatencyMs: Long = 0,
    var minLatencyMs: Long = 0,
    var maxLatencyMs: Long = 0
) {
    val successRate: Double
        get() = if (totalRequests > 0) (successfulRequests.toDouble() / totalRequests) * 100 else 0.0
}
