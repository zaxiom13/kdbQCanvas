package org.example.config

/**
 * Performance configuration for latency optimization in live mode
 */
data class PerformanceConfig(
    // Query execution performance
    val enableFastPathForLiveMode: Boolean = true,
    val enableConnectionStatusCaching: Boolean = true,
    val connectionStatusCacheIntervalMs: Long = 1000L,
    
    // Logging optimization
    val enableDebugLogging: Boolean = false,
    val enableQueryPerformanceLogging: Boolean = false,
    val logSlowQueriesThresholdMs: Long = 100L,
    
    // WebSocket performance
    val websocketPingIntervalSeconds: Long = 15L,
    val websocketTimeoutSeconds: Long = 15L,
    val websocketMaxFrameSize: Long = Long.MAX_VALUE,
    val enableWebSocketMasking: Boolean = false,
    
    // Query lifecycle optimization
    val enableQueryLifecycleManagerCaching: Boolean = true,
    val enableSerializerSingletons: Boolean = true,
    val enableResponseCaching: Boolean = false, // For future implementation
    
    // Frontend performance
    val liveModeMinIntervalMs: Int = 50, // 20 FPS max
    val websocketThrottleIntervalMs: Int = 16, // 60 FPS max
    val enableQueryDeduplication: Boolean = true,
    val enableRequestAnimationFrame: Boolean = true,
    
    // Connection management
    val maxReconnectAttempts: Int = 5,
    val reconnectBaseDelayMs: Long = 1000L,
    val enableExponentialBackoff: Boolean = true,
    
    // Memory optimization
    val enableObjectPooling: Boolean = true,
    val enableMessageReuse: Boolean = true,
    val enableGarbageCollectionOptimization: Boolean = true
) {
    companion object {
        /**
         * High-performance configuration optimized for live mode
         */
        fun highPerformance() = PerformanceConfig(
            enableFastPathForLiveMode = true,
            enableConnectionStatusCaching = true,
            connectionStatusCacheIntervalMs = 500L,
            enableDebugLogging = false,
            enableQueryPerformanceLogging = true,
            logSlowQueriesThresholdMs = 50L,
            websocketPingIntervalSeconds = 30L, // Reduce ping frequency
            websocketTimeoutSeconds = 30L,
            enableWebSocketMasking = false,
            enableQueryLifecycleManagerCaching = true,
            enableSerializerSingletons = true,
            liveModeMinIntervalMs = 33, // 30 FPS for smooth updates
            websocketThrottleIntervalMs = 16, // 60 FPS max
            enableQueryDeduplication = true,
            enableRequestAnimationFrame = true,
            enableObjectPooling = true,
            enableMessageReuse = true,
            enableGarbageCollectionOptimization = true
        )
        
        /**
         * Development configuration with more debugging enabled
         */
        fun development() = PerformanceConfig(
            enableFastPathForLiveMode = true,
            enableConnectionStatusCaching = false,
            enableDebugLogging = true,
            enableQueryPerformanceLogging = true,
            logSlowQueriesThresholdMs = 200L,
            websocketPingIntervalSeconds = 15L,
            enableQueryLifecycleManagerCaching = false, // For easier debugging
            enableSerializerSingletons = true,
            liveModeMinIntervalMs = 100, // Slower for debugging
            websocketThrottleIntervalMs = 50,
            enableQueryDeduplication = false, // For debugging
            enableRequestAnimationFrame = false,
            enableObjectPooling = false,
            enableMessageReuse = false
        )
        
        /**
         * Ultra-low latency configuration for demanding applications
         */
        fun ultraLowLatency() = PerformanceConfig(
            enableFastPathForLiveMode = true,
            enableConnectionStatusCaching = true,
            connectionStatusCacheIntervalMs = 100L, // Very aggressive caching
            enableDebugLogging = false,
            enableQueryPerformanceLogging = false, // Disable all non-essential logging
            websocketPingIntervalSeconds = 60L, // Minimal ping
            websocketTimeoutSeconds = 60L,
            enableWebSocketMasking = false,
            enableQueryLifecycleManagerCaching = true,
            enableSerializerSingletons = true,
            liveModeMinIntervalMs = 16, // 60 FPS target
            websocketThrottleIntervalMs = 8, // 120 FPS max
            enableQueryDeduplication = true,
            enableRequestAnimationFrame = true,
            maxReconnectAttempts = 3, // Quick failure
            reconnectBaseDelayMs = 500L,
            enableObjectPooling = true,
            enableMessageReuse = true,
            enableGarbageCollectionOptimization = true
        )
    }
    
    /**
     * Validate configuration settings
     */
    fun validate(): List<String> {
        val warnings = mutableListOf<String>()
        
        if (liveModeMinIntervalMs < 16) {
            warnings.add("liveModeMinIntervalMs < 16ms may cause performance issues")
        }
        
        if (websocketThrottleIntervalMs < 8) {
            warnings.add("websocketThrottleIntervalMs < 8ms may overwhelm the backend")
        }
        
        if (connectionStatusCacheIntervalMs < 100) {
            warnings.add("connectionStatusCacheIntervalMs < 100ms may not provide significant optimization")
        }
        
        if (enableDebugLogging && enableFastPathForLiveMode) {
            warnings.add("Debug logging enabled with fast path may impact performance")
        }
        
        return warnings
    }
} 