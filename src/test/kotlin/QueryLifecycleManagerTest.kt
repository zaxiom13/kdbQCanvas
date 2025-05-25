package org.example

// Removed unused import
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.*
import org.example.QIPC.IPCConnector
import org.example.QIPC.QueryLifecycleManager
import org.example.QIPC.QueryRequest
import java.io.IOException

@ExtendWith(MockitoExtension::class)
class QueryLifecycleManagerTest {

    @Mock
    private lateinit var mockIpcConnector: IPCConnector

    private lateinit var queryLifecycleManager: QueryLifecycleManager

    @BeforeEach
    fun setUp() {
        queryLifecycleManager = QueryLifecycleManager(mockIpcConnector)
    }

    @Test
    fun `executeQuery successful simple query`() {
        val request = QueryRequest("1+1")
        val qResult = 2L // Q returns Long for simple arithmetic
        whenever(mockIpcConnector.isConnected()).thenReturn(true)
        whenever(mockIpcConnector.sendRawQuery(request.query)).thenReturn(qResult)

        val response = queryLifecycleManager.executeQuery(request)

        assertTrue(response.success)
        assertEquals(qResult, response.data)
        assertEquals("Long", response.dataType)
        assertNull(response.error)
        verify(mockIpcConnector).sendRawQuery(request.query)
    }

    @Test
    fun `executeQuery successful array query`() {
        val request = QueryRequest("til 5")
        val qResult = longArrayOf(0, 1, 2, 3, 4)
        whenever(mockIpcConnector.isConnected()).thenReturn(true)
        whenever(mockIpcConnector.sendRawQuery(request.query)).thenReturn(qResult)

        val response = queryLifecycleManager.executeQuery(request)

        assertTrue(response.success)
        assertArrayEquals(qResult, response.data as LongArray)
        assertEquals("long[]", response.dataType)
        assertNull(response.error)
    }

    @Test
    fun `executeQuery handles KDB+ error`() {
        val request = QueryRequest("'error")
        val errorMessage = "error"

        // Setup the mock to throw a mock exception with behavior similar to c.KException
        whenever(mockIpcConnector.isConnected()).thenReturn(true)
        doThrow(object : RuntimeException(errorMessage) {
            // Anonymous class that mimics c.KException behavior
            override fun toString(): String = "c.KException: $message"
        }).whenever(mockIpcConnector).sendRawQuery(request.query)

        val response = queryLifecycleManager.executeQuery(request)

        assertFalse(response.success)
        assertNull(response.data)
        assertTrue(response.error?.contains(errorMessage) == true)
        assertEquals("UnexpectedError", response.dataType)
    }

    @Test
    fun `executeQuery handles KDB+ error for nonExistentTable`() {
        val request = QueryRequest("select from nonExistentTable")
        val errorMessage = "nonExistentTable"

        // Setup the mock to throw a mock exception with behavior similar to c.KException
        whenever(mockIpcConnector.isConnected()).thenReturn(true)
        doThrow(object : RuntimeException(errorMessage) {
            // Anonymous class that mimics c.KException behavior
            override fun toString(): String = "c.KException: $message"
        }).whenever(mockIpcConnector).sendRawQuery(request.query)

        val response = queryLifecycleManager.executeQuery(request)

        assertFalse(response.success)
        assertNull(response.data)
        assertTrue(response.error?.contains(errorMessage) == true)
        assertEquals("UnexpectedError", response.dataType)
    }

    @Test
    fun `executeQuery handles IOException during sendRawQuery`() {
        val request = QueryRequest("some query")
        val errorMessage = "Network error"
        whenever(mockIpcConnector.isConnected()).thenReturn(true)
        whenever(mockIpcConnector.sendRawQuery(request.query)).thenThrow(IOException(errorMessage))

        val response = queryLifecycleManager.executeQuery(request)

        assertFalse(response.success)
        assertNull(response.data)
        assertEquals("IO error executing query '${request.query}': $errorMessage", response.error)
        assertEquals("IOExecutionError", response.dataType)
    }

    @Test
    fun `executeQuery attempts to connect if not connected`() {
        val request = QueryRequest("1+1")
        val qResult = 2L
        whenever(mockIpcConnector.isConnected()).thenReturn(false).thenReturn(true)
        whenever(mockIpcConnector.sendRawQuery(request.query)).thenReturn(qResult)

        val response = queryLifecycleManager.executeQuery(request)

        assertTrue(response.success)
        assertEquals(qResult, response.data)
        verify(mockIpcConnector).connect() // Verify connect was called
        verify(mockIpcConnector).sendRawQuery(request.query)
    }

    @Test
    fun `executeQuery returns ConnectionError if connect fails`() {
        val request = QueryRequest("1+1")
        val connectErrorMessage = "Failed to open socket"
        whenever(mockIpcConnector.isConnected()).thenReturn(false)
        whenever(mockIpcConnector.connect()).thenThrow(IOException(connectErrorMessage))

        val response = queryLifecycleManager.executeQuery(request)

        assertFalse(response.success)
        assertNull(response.data)
        assertEquals("Connection failed before sending query '${request.query}': $connectErrorMessage", response.error)
        assertEquals("ConnectionError", response.dataType)
        verify(mockIpcConnector).connect() // Verify connect was attempted
        verify(mockIpcConnector, never()).sendRawQuery(any()) // Verify sendRawQuery was not called
    }
}

