package org.example.communication

import org.example.QProcessManager
import org.example.config.CommunicationConfig
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.condition.EnabledIfSystemProperty
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.delay
import java.util.concurrent.TimeUnit

/**
 * Integration tests for the dual-band communication system.
 * These tests require a real Q process to be available for testing.
 * 
 * To run these tests, set the system property: -Dintegration.tests.enabled=true
 * and ensure you have a Q process available on localhost:5001
 */
@EnabledIfSystemProperty(named = "integration.tests.enabled", matches = "true")
class DualBandCommunicationIntegrationTest {

    private lateinit var qManager: QProcessManager
    private lateinit var communicationManager: DualBandCommunicationManager

    @BeforeEach
    fun setUp() {
        // Use port 5001 for integration tests to avoid conflicts
        qManager = QProcessManager(host = "localhost", port = 5001)
        val testConfig = CommunicationConfig.testing().copy(
            httpPort = 9082,
            websocketPort = 9083,
            qProcessPort = 5001
        )
        communicationManager = DualBandCommunicationManager(qManager, testConfig)
        
        qManager.start()
        
        // Wait for Q process to start
        Thread.sleep(2000)
        
        if (!qManager.isRunning()) {
            throw IllegalStateException("Q process failed to start for integration tests")
        }
        
        communicationManager.start()
        
        // Wait for communication protocols to start
        Thread.sleep(1000)
    }

    @AfterEach
    fun tearDown() {
        communicationManager.stop()
        qManager.stop()
        
        // Wait for cleanup
        Thread.sleep(500)
    }

    @Test
    fun `should execute basic arithmetic query on both channels`() = runBlocking {
        // Test standard channel
        val standardResult = communicationManager.executeQuery("1+1", ChannelType.STANDARD)
        assertTrue(standardResult.success, "Standard channel query should succeed")
        assertEquals(2L, standardResult.data, "Standard channel should return correct result")
        
        // Test fast channel
        val fastResult = communicationManager.executeQuery("1+1", ChannelType.FAST)
        assertTrue(fastResult.success, "Fast channel query should succeed")
        assertEquals(2L, fastResult.data, "Fast channel should return correct result")
    }

    @Test
    fun `should execute array generation query on both channels`() = runBlocking {
        // Test standard channel
        val standardResult = communicationManager.executeQuery("til 5", ChannelType.STANDARD)
        assertTrue(standardResult.success, "Standard channel query should succeed")
        assertTrue(standardResult.data is LongArray, "Should return LongArray")
        val standardArray = standardResult.data as LongArray
        assertArrayEquals(longArrayOf(0, 1, 2, 3, 4), standardArray)
        
        // Test fast channel
        val fastResult = communicationManager.executeQuery("til 5", ChannelType.FAST)
        assertTrue(fastResult.success, "Fast channel query should succeed")
        assertTrue(fastResult.data is LongArray, "Should return LongArray")
        val fastArray = fastResult.data as LongArray
        assertArrayEquals(longArrayOf(0, 1, 2, 3, 4), fastArray)
    }

    @Test
    fun `should handle query errors gracefully on both channels`() = runBlocking {
        val invalidQuery = "'error"
        
        // Test standard channel
        val standardResult = communicationManager.executeQuery(invalidQuery, ChannelType.STANDARD)
        assertFalse(standardResult.success, "Standard channel should handle error gracefully")
        assertNotNull(standardResult.error, "Should have error message")
        
        // Test fast channel
        val fastResult = communicationManager.executeQuery(invalidQuery, ChannelType.FAST)
        assertFalse(fastResult.success, "Fast channel should handle error gracefully")
        assertNotNull(fastResult.error, "Should have error message")
    }

    @Test
    fun `should measure performance difference between channels`() = runBlocking {
        val simpleQuery = "1+1"
        val iterations = 10
        
        // Warm up both channels
        communicationManager.executeQuery(simpleQuery, ChannelType.STANDARD)
        communicationManager.executeQuery(simpleQuery, ChannelType.FAST)
        
        // Measure standard channel
        val standardStart = System.currentTimeMillis()
        repeat(iterations) {
            communicationManager.executeQuery(simpleQuery, ChannelType.STANDARD)
        }
        val standardDuration = System.currentTimeMillis() - standardStart
        
        // Measure fast channel
        val fastStart = System.currentTimeMillis()
        repeat(iterations) {
            communicationManager.executeQuery(simpleQuery, ChannelType.FAST)
        }
        val fastDuration = System.currentTimeMillis() - fastStart
        
        println("Standard channel: ${standardDuration}ms for $iterations queries")
        println("Fast channel: ${fastDuration}ms for $iterations queries")
        
        val metrics = communicationManager.getMetrics()
        println("Standard channel metrics: ${metrics[ChannelType.STANDARD]}")
        println("Fast channel metrics: ${metrics[ChannelType.FAST]}")
        
        // Verify metrics were collected
        assertTrue(metrics[ChannelType.STANDARD]!!.totalRequests >= iterations.toLong())
        assertTrue(metrics[ChannelType.FAST]!!.totalRequests >= iterations.toLong())
    }

    @Test
    fun `should execute concurrent queries successfully`() = runBlocking {
        val queries = listOf("1+1", "2+2", "3+3", "til 3", "4+4")
        
        // Execute queries concurrently on both channels
        val standardJobs = queries.map { query ->
            communicationManager.executeQueryAsync(query, ChannelType.STANDARD)
        }
        
        val fastJobs = queries.map { query ->
            communicationManager.executeQueryAsync(query, ChannelType.FAST)
        }
        
        // Wait for all to complete
        val standardResults = standardJobs.map { it.get(10, TimeUnit.SECONDS) }
        val fastResults = fastJobs.map { it.get(10, TimeUnit.SECONDS) }
        
        // Verify all succeeded
        standardResults.forEach { result ->
            assertTrue(result.success, "Standard channel concurrent query should succeed")
        }
        
        fastResults.forEach { result ->
            assertTrue(result.success, "Fast channel concurrent query should succeed")
        }
    }

    @Test
    fun `should automatically select optimal channel`() {
        // Regular queries should use standard channel
        assertEquals(ChannelType.STANDARD, communicationManager.selectOptimalChannel("1+1"))
        assertEquals(ChannelType.STANDARD, communicationManager.selectOptimalChannel("til 10"))
        
        // Live mode should use fast channel
        assertEquals(ChannelType.FAST, communicationManager.selectOptimalChannel("1+1", isLiveMode = true))
        
        // Mouse queries should use fast channel
        assertEquals(ChannelType.FAST, communicationManager.selectOptimalChannel("mouseX+mouseY"))
        assertEquals(ChannelType.FAST, communicationManager.selectOptimalChannel("plot[mouseX; mouseY]"))
    }

    @Test
    fun `should maintain connection status correctly`() = runBlocking {
        val status = communicationManager.getConnectionStatus()
        
        // Both channels should be connected
        assertTrue(status[ChannelType.STANDARD]!!.isConnected, "Standard channel should be connected")
        assertTrue(status[ChannelType.FAST]!!.isConnected, "Fast channel should be connected")
        
        assertNull(status[ChannelType.STANDARD]!!.lastError, "Standard channel should have no errors")
        assertEquals("HTTP", status[ChannelType.STANDARD]!!.protocolType)
        assertEquals("WebSocket", status[ChannelType.FAST]!!.protocolType)
    }

    @Test
    fun `should simulate live mode performance`() = runBlocking {
        val liveQuery = "mouseX:100; mouseY:200; mouseX+mouseY"
        val iterations = 50 // Simulate 5 seconds at 10 FPS
        
        val start = System.currentTimeMillis()
        
        repeat(iterations) {
            val result = communicationManager.executeQuery(liveQuery, ChannelType.FAST)
            assertTrue(result.success, "Live mode query should succeed")
            assertEquals(300L, result.data, "Should calculate correct mouse sum")
            
            // Simulate 100ms interval (10 FPS)
            delay(20) // Use shorter delay in tests
        }
        
        val duration = System.currentTimeMillis() - start
        val avgLatency = duration.toDouble() / iterations
        
        println("Live mode simulation: ${iterations} queries in ${duration}ms (avg: ${avgLatency}ms per query)")
        
        // In live mode, we want sub-50ms average latency for smooth experience
        assertTrue(avgLatency < 100, "Average latency should be under 100ms for good live mode performance")
        
        val metrics = communicationManager.getMetrics()[ChannelType.FAST]!!
        assertTrue(metrics.successRate > 95.0, "Success rate should be very high in live mode")
    }
}
