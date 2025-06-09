package org.example.communication

import org.example.api.QueryResponseDto
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Assertions.*
import kotlinx.coroutines.runBlocking
import java.util.concurrent.TimeUnit

class MockCommunicationProtocolTest {

    private lateinit var mockProtocol: MockCommunicationProtocol

    @BeforeEach
    fun setUp() {
        mockProtocol = MockCommunicationProtocol("TestMock")
    }

    @Test
    fun `should start and stop correctly`() {
        assertFalse(mockProtocol.isRunning())
        
        mockProtocol.start()
        assertTrue(mockProtocol.isRunning())
        
        mockProtocol.stop()
        assertFalse(mockProtocol.isRunning())
    }

    @Test
    fun `should return error when not running`() = runBlocking {
        val result = mockProtocol.executeQuery("1+1")
        
        assertFalse(result.success)
        assertEquals("Protocol not running", result.error)
    }

    @Test
    fun `should execute predefined queries correctly`() = runBlocking {
        mockProtocol.start()
        
        val result = mockProtocol.executeQuery("1+1")
        
        assertTrue(result.success)
        assertEquals(2L, result.data)
        assertEquals("long", result.dataType)
    }

    @Test
    fun `should execute array queries correctly`() = runBlocking {
        mockProtocol.start()
        
        val result = mockProtocol.executeQuery("til 5")
        
        assertTrue(result.success)
        assertTrue(result.data is LongArray)
        val array = result.data as LongArray
        assertArrayEquals(longArrayOf(0, 1, 2, 3, 4), array)
        assertEquals("long[]", result.dataType)
        assertEquals(listOf(5), result.arrayShape?.dimensions)
    }

    @Test
    fun `should handle error queries correctly`() = runBlocking {
        mockProtocol.start()
        
        val result = mockProtocol.executeQuery("'error")
        
        assertFalse(result.success)
        assertEquals("type", result.error)
        assertEquals("error", result.dataType)
    }

    @Test
    fun `should return default response for unknown queries`() = runBlocking {
        mockProtocol.start()
        
        val result = mockProtocol.executeQuery("unknown query")
        
        assertTrue(result.success)
        assertEquals("Mock response for: unknown query", result.data)
        assertEquals("string", result.dataType)
    }

    @Test
    fun `should execute queries asynchronously`() {
        mockProtocol.start()
        
        val future = mockProtocol.executeQueryAsync("1+1")
        val result = future.get(5, TimeUnit.SECONDS)
        
        assertTrue(result.success)
        assertEquals(2L, result.data)
    }

    @Test
    fun `should count queries correctly`() = runBlocking {
        mockProtocol.start()
        
        assertEquals(0, mockProtocol.getQueryCount())
        
        mockProtocol.executeQuery("1+1")
        assertEquals(1, mockProtocol.getQueryCount())
        
        mockProtocol.executeQuery("2+2")
        assertEquals(2, mockProtocol.getQueryCount())
        
        mockProtocol.resetQueryCounter()
        assertEquals(0, mockProtocol.getQueryCount())
    }

    @Test
    fun `should handle custom predefined responses`() = runBlocking {
        mockProtocol.start()
        
        val customResponse = QueryResponseDto(
            success = true,
            data = "custom result",
            dataType = "custom",
            timestamp = System.currentTimeMillis()
        )
        
        mockProtocol.addPredefinedResponse("custom query", customResponse)
        
        val result = mockProtocol.executeQuery("custom query")
        
        assertTrue(result.success)
        assertEquals("custom result", result.data)
        assertEquals("custom", result.dataType)
    }

    @Test
    fun `should simulate latency correctly`() = runBlocking {
        val latencyMs = 100L
        val protocolWithLatency = MockCommunicationProtocol("SlowMock", latencyMs)
        protocolWithLatency.start()
        
        val start = System.currentTimeMillis()
        protocolWithLatency.executeQuery("1+1")
        val duration = System.currentTimeMillis() - start
        
        // Should take at least the simulated latency time
        assertTrue(duration >= latencyMs, "Query should take at least ${latencyMs}ms, but took ${duration}ms")
    }

    @Test
    fun `should simulate failures correctly`() = runBlocking {
        val protocolWithFailures = MockCommunicationProtocol("FailingMock", 0, 1.0) // 100% failure rate
        protocolWithFailures.start()
        
        val result = protocolWithFailures.executeQuery("1+1")
        
        assertFalse(result.success)
        assertEquals("Simulated network failure", result.error)
    }

    @Test
    fun `should provide correct connection status`() {
        // When stopped
        val status1 = mockProtocol.getConnectionStatus()
        assertFalse(status1.isConnected)
        assertEquals("TestMock", status1.protocolType)
        assertEquals("Protocol stopped", status1.lastError)
        
        // When running
        mockProtocol.start()
        val status2 = mockProtocol.getConnectionStatus()
        assertTrue(status2.isConnected)
        assertEquals("TestMock", status2.protocolType)
        assertNull(status2.lastError)
    }

    @Test
    fun `should manage predefined responses correctly`() = runBlocking {
        mockProtocol.start()
        
        // Add custom response
        val customResponse = QueryResponseDto(
            success = true,
            data = "test",
            timestamp = System.currentTimeMillis()
        )
        mockProtocol.addPredefinedResponse("test", customResponse)
        
        val result1 = mockProtocol.executeQuery("test")
        assertEquals("test", result1.data)
        
        // Remove response
        mockProtocol.removePredefinedResponse("test")
        val result2 = mockProtocol.executeQuery("test")
        assertEquals("Mock response for: test", result2.data) // Should fall back to default
        
        // Clear all responses
        mockProtocol.clearPredefinedResponses()
        val result3 = mockProtocol.executeQuery("1+1")
        assertEquals("Mock response for: 1+1", result3.data) // Should fall back to default
    }
}
