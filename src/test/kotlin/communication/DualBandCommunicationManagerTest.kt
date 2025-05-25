package org.example.communication

import org.example.QProcessManager
import org.example.api.QueryResponseDto
import org.example.config.CommunicationConfig
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.mockito.Mockito.*
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import kotlinx.coroutines.runBlocking
import java.util.concurrent.TimeUnit

class DualBandCommunicationManagerTest {

    private lateinit var mockQManager: QProcessManager
    private lateinit var communicationManager: DualBandCommunicationManager

    @BeforeEach
    fun setUp() {
        mockQManager = mock()
        val testConfig = CommunicationConfig.testing().copy(
            httpPort = 9080,
            websocketPort = 9081
        )
        communicationManager = DualBandCommunicationManager(mockQManager, testConfig)
    }

    @AfterEach
    fun tearDown() {
        communicationManager.stop()
    }

    @Test
    fun `should start and stop successfully`() {
        communicationManager.start()
        // Should not throw exceptions
        assertTrue(true)
        
        communicationManager.stop()
        // Should not throw exceptions
        assertTrue(true)
    }

    @Test
    fun `should select optimal channel correctly`() {
        // Live mode queries should use fast channel
        assertEquals(ChannelType.FAST, communicationManager.selectOptimalChannel("1+1", isLiveMode = true))
        
        // Mouse variable queries should use fast channel
        assertEquals(ChannelType.FAST, communicationManager.selectOptimalChannel("mouseX+mouseY"))
        assertEquals(ChannelType.FAST, communicationManager.selectOptimalChannel("plot mouseX vs mouseY"))
        
        // Regular queries should use standard channel
        assertEquals(ChannelType.STANDARD, communicationManager.selectOptimalChannel("1+1"))
        assertEquals(ChannelType.STANDARD, communicationManager.selectOptimalChannel("til 10"))
    }

    @Test
    fun `should get connection status for both channels`() {
        communicationManager.start()
        
        val status = communicationManager.getConnectionStatus()
        
        assertTrue(status.containsKey(ChannelType.STANDARD))
        assertTrue(status.containsKey(ChannelType.FAST))
        
        assertEquals("HTTP", status[ChannelType.STANDARD]?.protocolType)
        assertEquals("WebSocket", status[ChannelType.FAST]?.protocolType)
    }

    @Test
    fun `should get metrics for both channels`() {
        val metrics = communicationManager.getMetrics()
        
        assertTrue(metrics.containsKey(ChannelType.STANDARD))
        assertTrue(metrics.containsKey(ChannelType.FAST))
        
        // Initial metrics should be empty
        assertEquals(0, metrics[ChannelType.STANDARD]?.totalRequests)
        assertEquals(0, metrics[ChannelType.FAST]?.totalRequests)
    }

    @Test
    fun `should execute query on standard channel`() = runBlocking {
        whenever(mockQManager.isRunning()).thenReturn(false) // Will return error, but won't throw
        
        communicationManager.start()
        
        val result = communicationManager.executeQuery("1+1", ChannelType.STANDARD)
        
        assertNotNull(result)
        assertFalse(result.success) // Expected to fail since Q process is not running
        assertEquals("Q process is not running", result.error)
    }

    @Test
    fun `should execute query on fast channel`() = runBlocking {
        whenever(mockQManager.isRunning()).thenReturn(false) // Will return error, but won't throw
        
        communicationManager.start()
        
        val result = communicationManager.executeQuery("1+1", ChannelType.FAST)
        
        assertNotNull(result)
        assertFalse(result.success) // Expected to fail since Q process is not running
        assertEquals("Q process is not running", result.error)
    }

    @Test
    fun `should execute query asynchronously`() {
        whenever(mockQManager.isRunning()).thenReturn(false) // Will return error, but won't throw
        
        communicationManager.start()
        
        val future = communicationManager.executeQueryAsync("1+1", ChannelType.STANDARD)
        
        assertNotNull(future)
        val result = future.get(5, TimeUnit.SECONDS)
        assertNotNull(result)
        assertFalse(result.success) // Expected to fail since Q process is not running
    }

    @Test
    fun `should update metrics after query execution`() = runBlocking {
        whenever(mockQManager.isRunning()).thenReturn(false) // Will return error, but won't throw
        
        communicationManager.start()
        
        // Execute a few queries
        communicationManager.executeQuery("1+1", ChannelType.STANDARD)
        communicationManager.executeQuery("2+2", ChannelType.FAST)
        
        val metrics = communicationManager.getMetrics()
        
        // Should have recorded the requests
        assertEquals(1, metrics[ChannelType.STANDARD]?.totalRequests)
        assertEquals(1, metrics[ChannelType.FAST]?.totalRequests)
        
        // Should have recorded failures (since Q process is not running)
        assertEquals(1, metrics[ChannelType.STANDARD]?.failedRequests)
        assertEquals(1, metrics[ChannelType.FAST]?.failedRequests)
        assertEquals(0, metrics[ChannelType.STANDARD]?.successfulRequests)
        assertEquals(0, metrics[ChannelType.FAST]?.successfulRequests)
    }
}

class ChannelMetricsTest {

    @Test
    fun `should calculate success rate correctly`() {
        val metrics = ChannelMetrics()
        
        // Initially should be 0%
        assertEquals(0.0, metrics.successRate, 0.01)
        
        // After some successful and failed requests
        metrics.totalRequests = 10
        metrics.successfulRequests = 7
        metrics.failedRequests = 3
        
        assertEquals(70.0, metrics.successRate, 0.01)
        
        // Edge case: no requests
        val emptyMetrics = ChannelMetrics()
        assertEquals(0.0, emptyMetrics.successRate, 0.01)
    }
}
