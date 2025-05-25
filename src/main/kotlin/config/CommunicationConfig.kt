package org.example.config

/**
 * Configuration class for dual-band communication system
 */
data class CommunicationConfig(
    // HTTP Communication Settings
    val httpPort: Int = 8080,
    val httpHost: String = "localhost",
    val httpTimeoutMs: Long = 5000,
    
    // WebSocket (Fast Channel) Settings
    val websocketPort: Int = 8081,
    val websocketHost: String = "localhost",
    val websocketTimeoutMs: Long = 1000,
    val websocketPingIntervalMs: Long = 30000,
    val websocketReconnectAttempts: Int = 5,
    val websocketReconnectDelayMs: Long = 1000,
    
    // Performance Thresholds
    val fastChannelLatencyThresholdMs: Long = 100,
    val slowChannelFallbackThresholdMs: Long = 500,
    val liveModeForceFastChannel: Boolean = true,
    
    // Metrics Settings
    val metricsRetentionMs: Long = 300000, // 5 minutes
    val metricsCleanupIntervalMs: Long = 60000, // 1 minute
    
    // Q Process Settings
    val qProcessHost: String = "localhost",
    val qProcessPort: Int = 5000,
    
    // Channel Selection Settings
    val enableDualBand: Boolean = true,
    val preferFastChannel: Boolean = true,
    val autoChannelSelection: Boolean = true
) {
    companion object {
        /**
         * Default configuration optimized for live mode performance
         */
        fun default() = CommunicationConfig()
        
        /**
         * Configuration optimized for testing with shorter timeouts
         */
        fun testing() = CommunicationConfig(
            httpTimeoutMs = 1000,
            websocketTimeoutMs = 500,
            websocketPingIntervalMs = 5000,
            websocketReconnectAttempts = 2,
            websocketReconnectDelayMs = 500,
            metricsRetentionMs = 60000,
            metricsCleanupIntervalMs = 10000
        )
        
        /**
         * Configuration for development with verbose logging
         */
        fun development() = CommunicationConfig(
            httpTimeoutMs = 10000,
            websocketTimeoutMs = 2000,
            websocketPingIntervalMs = 15000,
            fastChannelLatencyThresholdMs = 150,
            slowChannelFallbackThresholdMs = 1000
        )
        
        /**
         * Configuration for production with optimized settings
         */
        fun production() = CommunicationConfig(
            httpTimeoutMs = 3000,
            websocketTimeoutMs = 800,
            websocketPingIntervalMs = 60000,
            fastChannelLatencyThresholdMs = 80,
            slowChannelFallbackThresholdMs = 300,
            websocketReconnectAttempts = 10,
            websocketReconnectDelayMs = 2000
        )
    }
    
    /**
     * Validate configuration settings
     */
    fun validate(): List<String> {
        val errors = mutableListOf<String>()
        
        if (httpPort <= 0 || httpPort > 65535) {
            errors.add("HTTP port must be between 1 and 65535")
        }
        
        if (websocketPort <= 0 || websocketPort > 65535) {
            errors.add("WebSocket port must be between 1 and 65535")
        }
        
        if (httpPort == websocketPort) {
            errors.add("HTTP and WebSocket ports must be different")
        }
        
        if (httpTimeoutMs <= 0) {
            errors.add("HTTP timeout must be positive")
        }
        
        if (websocketTimeoutMs <= 0) {
            errors.add("WebSocket timeout must be positive")
        }
        
        if (fastChannelLatencyThresholdMs <= 0) {
            errors.add("Fast channel latency threshold must be positive")
        }
        
        if (slowChannelFallbackThresholdMs <= fastChannelLatencyThresholdMs) {
            errors.add("Slow channel fallback threshold must be greater than fast channel threshold")
        }
        
        if (websocketReconnectAttempts < 0) {
            errors.add("WebSocket reconnect attempts must be non-negative")
        }
        
        if (websocketReconnectDelayMs <= 0) {
            errors.add("WebSocket reconnect delay must be positive")
        }
        
        return errors
    }
    
    /**
     * Check if configuration is valid
     */
    fun isValid(): Boolean = validate().isEmpty()
    
    /**
     * Get HTTP base URL
     */
    fun getHttpBaseUrl(): String = "http://$httpHost:$httpPort"
    
    /**
     * Get WebSocket base URL
     */
    fun getWebSocketBaseUrl(): String = "ws://$websocketHost:$websocketPort"
    
    /**
     * Get Q process connection string
     */
    fun getQProcessConnection(): String = "$qProcessHost:$qProcessPort"
}
