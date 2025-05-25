package org.example

import org.example.QIPC.QueryLifecycleManager
import org.example.QIPC.QueryRequest
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.*

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class QueryLifecycleManagerIntegrationTest {
    private lateinit var qManager: QProcessManager
    private var lifecycleManager: QueryLifecycleManager? = null

    @BeforeAll
    fun setupQ() {
        qManager = QProcessManager(host = "localhost", port = 5000)
        qManager.start()
        // Wait for Q to be ready
        Thread.sleep(2000)
        val connector = qManager.getIPCConnector()
        assertNotNull(connector, "IPCConnector should not be null after Q start")
        lifecycleManager = QueryLifecycleManager(connector!!)
    }

    @AfterAll
    fun teardownQ() {
        qManager.stop()
    }

    @Test
    fun `integration - simple arithmetic query`() {
        val request = QueryRequest("1+1")
        val response = lifecycleManager!!.executeQuery(request)
        assertTrue(response.success)
        assertEquals(2L, response.data)
        assertEquals("Long", response.dataType)
        assertNull(response.error)
    }

    @Test
    fun `integration - til array query`() {
        val request = QueryRequest("til 5")
        val response = lifecycleManager!!.executeQuery(request)
        assertTrue(response.success)
        assertArrayEquals(longArrayOf(0,1,2,3,4), response.data as LongArray)
        assertEquals("long[]", response.dataType)
        assertNull(response.error)
    }

    @Test
    fun `integration - error query`() {
        val request = QueryRequest("'error")
        val response = lifecycleManager!!.executeQuery(request)
        assertFalse(response.success)
        assertNull(response.data)
        assertTrue(response.error?.contains("error") == true)
        assertEquals("KDBExecutionError", response.dataType)
    }

    @Test
    fun `integration - non-existent table query`() {
        val request = QueryRequest("select from nonExistentTable")
        val response = lifecycleManager!!.executeQuery(request)
        assertFalse(response.success)
        assertNull(response.data)
        assertTrue(response.error?.contains("nonExistentTable") == true)
        assertEquals("KDBExecutionError", response.dataType)
    }
}

