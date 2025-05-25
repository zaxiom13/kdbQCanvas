package org.example.config

import org.example.config.CommunicationConfig
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*

class CommunicationConfigTest {

    @Test
    fun `default configuration should be valid`() {
        val config = CommunicationConfig.default()
        assertTrue(config.isValid())
        assertTrue(config.validate().isEmpty())
    }

    @Test
    fun `testing configuration should be valid`() {
        val config = CommunicationConfig.testing()
        assertTrue(config.isValid())
        assertTrue(config.validate().isEmpty())
    }

    @Test
    fun `development configuration should be valid`() {
        val config = CommunicationConfig.development()
        assertTrue(config.isValid())
        assertTrue(config.validate().isEmpty())
    }

    @Test
    fun `production configuration should be valid`() {
        val config = CommunicationConfig.production()
        assertTrue(config.isValid())
        assertTrue(config.validate().isEmpty())
    }

    @Test
    fun `configuration should validate port ranges`() {
        val config = CommunicationConfig(httpPort = 0)
        assertFalse(config.isValid())
        assertTrue(config.validate().any { it.contains("HTTP port must be between") })
        
        val config2 = CommunicationConfig(websocketPort = 65536)
        assertFalse(config2.isValid())
        assertTrue(config2.validate().any { it.contains("WebSocket port must be between") })
    }

    @Test
    fun `configuration should reject same ports for HTTP and WebSocket`() {
        val config = CommunicationConfig(httpPort = 8080, websocketPort = 8080)
        assertFalse(config.isValid())
        assertTrue(config.validate().any { it.contains("HTTP and WebSocket ports must be different") })
    }

    @Test
    fun `configuration should validate timeout values`() {
        val config = CommunicationConfig(httpTimeoutMs = 0)
        assertFalse(config.isValid())
        assertTrue(config.validate().any { it.contains("HTTP timeout must be positive") })
        
        val config2 = CommunicationConfig(websocketTimeoutMs = -1)
        assertFalse(config2.isValid())
        assertTrue(config2.validate().any { it.contains("WebSocket timeout must be positive") })
    }

    @Test
    fun `configuration should validate latency thresholds`() {
        val config = CommunicationConfig(fastChannelLatencyThresholdMs = 0)
        assertFalse(config.isValid())
        assertTrue(config.validate().any { it.contains("Fast channel latency threshold must be positive") })
        
        val config2 = CommunicationConfig(
            fastChannelLatencyThresholdMs = 200,
            slowChannelFallbackThresholdMs = 100
        )
        assertFalse(config2.isValid())
        assertTrue(config2.validate().any { it.contains("Slow channel fallback threshold must be greater") })
    }

    @Test
    fun `configuration should validate reconnect settings`() {
        val config = CommunicationConfig(websocketReconnectAttempts = -1)
        assertFalse(config.isValid())
        assertTrue(config.validate().any { it.contains("WebSocket reconnect attempts must be non-negative") })
        
        val config2 = CommunicationConfig(websocketReconnectDelayMs = 0)
        assertFalse(config2.isValid())
        assertTrue(config2.validate().any { it.contains("WebSocket reconnect delay must be positive") })
    }

    @Test
    fun `configuration should generate correct URLs`() {
        val config = CommunicationConfig(
            httpHost = "example.com",
            httpPort = 9090,
            websocketHost = "ws.example.com",
            websocketPort = 9091,
            qProcessHost = "q.example.com",
            qProcessPort = 6000
        )
        
        assertEquals("http://example.com:9090", config.getHttpBaseUrl())
        assertEquals("ws://ws.example.com:9091", config.getWebSocketBaseUrl())
        assertEquals("q.example.com:6000", config.getQProcessConnection())
    }

    @Test
    fun `testing configuration should have shorter timeouts`() {
        val testing = CommunicationConfig.testing()
        val default = CommunicationConfig.default()
        
        assertTrue(testing.httpTimeoutMs < default.httpTimeoutMs)
        assertTrue(testing.websocketTimeoutMs < default.websocketTimeoutMs)
        assertTrue(testing.websocketPingIntervalMs < default.websocketPingIntervalMs)
        assertTrue(testing.websocketReconnectAttempts < default.websocketReconnectAttempts)
    }

    @Test
    fun `production configuration should be optimized for performance`() {
        val production = CommunicationConfig.production()
        val default = CommunicationConfig.default()
        
        assertTrue(production.fastChannelLatencyThresholdMs <= default.fastChannelLatencyThresholdMs)
        assertTrue(production.slowChannelFallbackThresholdMs <= default.slowChannelFallbackThresholdMs)
        assertTrue(production.websocketReconnectAttempts >= default.websocketReconnectAttempts)
    }

    @Test
    fun `development configuration should have relaxed timeouts`() {
        val development = CommunicationConfig.development()
        val default = CommunicationConfig.default()
        
        assertTrue(development.httpTimeoutMs >= default.httpTimeoutMs)
        assertTrue(development.websocketTimeoutMs >= default.websocketTimeoutMs)
        assertTrue(development.fastChannelLatencyThresholdMs >= default.fastChannelLatencyThresholdMs)
    }

    @Test
    fun `configuration should allow disabling dual-band`() {
        val config = CommunicationConfig(enableDualBand = false)
        assertFalse(config.enableDualBand)
        assertTrue(config.isValid()) // Should still be valid
    }

    @Test
    fun `configuration should allow disabling auto-channel selection`() {
        val config = CommunicationConfig(autoChannelSelection = false)
        assertFalse(config.autoChannelSelection)
        assertTrue(config.isValid()) // Should still be valid
    }

    @Test
    fun `multiple validation errors should be reported`() {
        val config = CommunicationConfig(
            httpPort = 0,
            websocketPort = 65536,
            httpTimeoutMs = -1,
            websocketTimeoutMs = 0
        )
        
        val errors = config.validate()
        assertTrue(errors.size >= 4) // Should have multiple errors
        assertTrue(errors.any { it.contains("HTTP port") })
        assertTrue(errors.any { it.contains("WebSocket port") })
        assertTrue(errors.any { it.contains("HTTP timeout") })
        assertTrue(errors.any { it.contains("WebSocket timeout") })
    }
}
