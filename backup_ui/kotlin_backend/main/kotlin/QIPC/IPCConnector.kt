package org.example.QIPC

import com.kx.c
import java.io.IOException

/**
 * Interface for IPC connector to Q process, allowing mocking in tests.
 */
interface IPCConnector {
    @Throws(IOException::class, c.KException::class)
    fun connect()
    fun disconnect()
    fun isConnected(): Boolean
    @Throws(IOException::class, c.KException::class)
    fun sendRawQuery(query: String): Any?
    fun ping(): Boolean
}