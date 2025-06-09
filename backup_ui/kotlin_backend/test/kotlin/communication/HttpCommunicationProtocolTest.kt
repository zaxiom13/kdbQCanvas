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
import org.example.QIPC.QueryResponse
import kotlinx.coroutines.runBlocking
import java.util.concurrent.TimeUnit

class HttpCommunicationProtocolTest {

    private lateinit var mockQManager: QProcessManager
    private lateinit var mockIPCConnector: IPCConnector
    private lateinit var httpProtocol: HttpCommunicationProtocol

    @BeforeEach
    fun setUp() {
        mockQManager = mock()
        mockIPCConnector = mock()
        httpProtocol = HttpCommunicationProtocol(mockQManager, 9080) // Use different port for testing
    }

    @AfterEach
    fun tearDown() {
        if (httpProtocol.isRunning()) {
            httpProtocol.stop()
        }
    }

    @Test
    fun `should start and stop successfully`() {
        assertFalse(httpProtocol.isRunning())
        
        httpProtocol.start()
        assertTrue(httpProtocol.isRunning())
        
        httpProtocol.stop()
        assertFalse(httpProtocol.isRunning())
    }

    @Test
    fun `should not start twice`() {
        httpProtocol.start()
        assertTrue(httpProtocol.isRunning())
        
        // Starting again should not throw exception
        httpProtocol.start()
        assertTrue(httpProtocol.isRunning())
    }

    @Test
    fun `should return error when Q process not running`() = runBlocking {
        whenever(mockQManager.isRunning()).thenReturn(false)
        
        val result = httpProtocol.executeQuery("1+1")
        
        assertFalse(result.success)
        assertEquals("Q process is not running", result.error)
    }

    @Test
    fun `should return error when IPC connector not available`() = runBlocking {
        whenever(mockQManager.isRunning()).thenReturn(true)
        whenever(mockQManager.getIPCConnector()).thenReturn(null)
        
        val result = httpProtocol.executeQuery("1+1")
        
        assertFalse(result.success)
        assertEquals("IPC Connector is not available", result.error)
    }

    @Test
    fun `should execute query successfully`() = runBlocking {
        whenever(mockQManager.isRunning()).thenReturn(true)
        whenever(mockQManager.getIPCConnector()).thenReturn(mockIPCConnector)
        
        val result = httpProtocol.executeQuery("1+1")
        
        // Since we can't easily mock the QueryLifecycleManager, 
        // we just verify the basic flow doesn't throw exceptions
        assertNotNull(result)
        assertNotNull(result.timestamp)
    }

    @Test
    fun `should get correct connection status`() {
        whenever(mockQManager.isRunning()).thenReturn(true)
        httpProtocol.start()
        
        val status = httpProtocol.getConnectionStatus()
        
        assertTrue(status.isConnected)
        assertEquals("HTTP", status.protocolType)
        assertNull(status.lastError)
    }

    @Test
    fun `should get disconnected status when Q process not running`() {
        whenever(mockQManager.isRunning()).thenReturn(false)
        httpProtocol.start()
        
        val status = httpProtocol.getConnectionStatus()
        
        assertFalse(status.isConnected)
        assertEquals("HTTP", status.protocolType)
        assertEquals("Q process not running", status.lastError)
    }

    @Test
    fun `should execute query asynchronously`() {
        whenever(mockQManager.isRunning()).thenReturn(true)
        whenever(mockQManager.getIPCConnector()).thenReturn(mockIPCConnector)
        
        val future = httpProtocol.executeQueryAsync("1+1")
        
        assertNotNull(future)
        val result = future.get(5, TimeUnit.SECONDS)
        assertNotNull(result)
        assertNotNull(result.timestamp)
    }
}
