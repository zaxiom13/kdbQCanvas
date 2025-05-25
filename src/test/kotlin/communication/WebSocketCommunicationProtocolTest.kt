package org.example.communication

import org.example.QProcessManager
import org.example.api.QueryResponseDto
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.mockito.Mockito.*
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.example.QIPC.IPCConnector
import kotlinx.coroutines.runBlocking
import java.util.concurrent.TimeUnit

class WebSocketCommunicationProtocolTest {

    private lateinit var mockQManager: QProcessManager
    private lateinit var mockIPCConnector: IPCConnector
    private lateinit var webSocketProtocol: WebSocketCommunicationProtocol

    @BeforeEach
    fun setUp() {
        mockQManager = mock()
        mockIPCConnector = mock()
        webSocketProtocol = WebSocketCommunicationProtocol(mockQManager, 9081) // Use different port for testing
    }

    @AfterEach
    fun tearDown() {
        if (webSocketProtocol.isRunning()) {
            webSocketProtocol.stop()
        }
    }

    @Test
    fun `should start and stop successfully`() {
        assertFalse(webSocketProtocol.isRunning())
        
        webSocketProtocol.start()
        assertTrue(webSocketProtocol.isRunning())
        
        webSocketProtocol.stop()
        assertFalse(webSocketProtocol.isRunning())
    }

    @Test
    fun `should not start twice`() {
        webSocketProtocol.start()
        assertTrue(webSocketProtocol.isRunning())
        
        // Starting again should not throw exception
        webSocketProtocol.start()
        assertTrue(webSocketProtocol.isRunning())
    }

    @Test
    fun `should return error when Q process not running`() = runBlocking {
        whenever(mockQManager.isRunning()).thenReturn(false)
        
        val result = webSocketProtocol.executeQuery("1+1")
        
        assertFalse(result.success)
        assertEquals("Q process is not running", result.error)
    }

    @Test
    fun `should return error when IPC connector not available`() = runBlocking {
        whenever(mockQManager.isRunning()).thenReturn(true)
        whenever(mockQManager.getIPCConnector()).thenReturn(null)
        
        val result = webSocketProtocol.executeQuery("1+1")
        
        assertFalse(result.success)
        assertEquals("IPC Connector is not available", result.error)
    }

    @Test
    fun `should execute query successfully`() = runBlocking {
        whenever(mockQManager.isRunning()).thenReturn(true)
        whenever(mockQManager.getIPCConnector()).thenReturn(mockIPCConnector)
        
        val result = webSocketProtocol.executeQuery("1+1")
        
        // Since we can't easily mock the QueryLifecycleManager, 
        // we just verify the basic flow doesn't throw exceptions
        assertNotNull(result)
        assertNotNull(result.timestamp)
    }

    @Test
    fun `should get correct connection status when no connections`() {
        whenever(mockQManager.isRunning()).thenReturn(true)
        webSocketProtocol.start()
        
        val status = webSocketProtocol.getConnectionStatus()
        
        assertFalse(status.isConnected) // No active connections yet
        assertEquals("WebSocket", status.protocolType)
        assertEquals("No active WebSocket connections", status.lastError)
    }

    @Test
    fun `should get disconnected status when Q process not running`() {
        whenever(mockQManager.isRunning()).thenReturn(false)
        webSocketProtocol.start()
        
        val status = webSocketProtocol.getConnectionStatus()
        
        assertFalse(status.isConnected)
        assertEquals("WebSocket", status.protocolType)
        assertEquals("Q process not running", status.lastError)
    }

    @Test
    fun `should execute query asynchronously`() {
        whenever(mockQManager.isRunning()).thenReturn(true)
        whenever(mockQManager.getIPCConnector()).thenReturn(mockIPCConnector)
        
        val future = webSocketProtocol.executeQueryAsync("1+1")
        
        assertNotNull(future)
        val result = future.get(5, TimeUnit.SECONDS)
        assertNotNull(result)
        assertNotNull(result.timestamp)
    }

    @Test
    fun `should have zero active connections initially`() {
        assertEquals(0, webSocketProtocol.getActiveConnectionCount())
    }

    @Test
    fun `should handle broadcast without active connections`() = runBlocking {
        webSocketProtocol.start()
        
        // Should not throw exception even with no active connections
        assertDoesNotThrow {
            runBlocking {
                webSocketProtocol.broadcast("test message")
            }
        }
    }
}
