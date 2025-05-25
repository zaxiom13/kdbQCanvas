package org.example.QIPC

import com.kx.c
import org.slf4j.LoggerFactory
import java.io.IOException

open class QIPCConnector(private val host: String, private val port: Int) : IPCConnector {
    private val logger = LoggerFactory.getLogger(QIPCConnector::class.java)
    private var connection: c? = null

    @Throws(IOException::class, c.KException::class)
    override fun connect() {
        if (connection == null) {
            logger.info("Connecting to Q process on $host:$port")
            connection = c(host, port)
            logger.info("Successfully connected to Q process on $host:$port")
        } else {
            logger.debug("Already connected to Q process")
        }
    }

    override fun disconnect() {
        try {
            logger.info("Disconnecting from Q process")
            connection?.close()
            logger.info("KDB+ connection closed")
        } catch (e: IOException) {
            logger.error("Error closing KDB+ connection", e)
        } finally {
            connection = null
        }
    }

    override fun isConnected(): Boolean {
        val connected = connection != null && connection!!.s.isBound
        logger.debug("IPC connection status: $connected")
        return connected
    }

    @Throws(IOException::class, c.KException::class)
    override fun sendRawQuery(query: String): Any? {
        if (!isConnected()) {
            logger.info("Not connected. Attempting to connect before sending raw query...")
            connect()
            if (!isConnected()) {
                logger.error("Failed to connect to Q process to send raw query.")
                throw IOException("Failed to connect to Q process to send raw query.")
            }
        }
        
        logger.debug("Sending raw query to Q: '$query'")
        val response = connection?.k(query.toCharArray())
        logger.debug("Received raw response type: ${response?.javaClass}")
        
        // Special debug for .z.t query
        if (query.trim() == ".z.t") {
            logger.info("Special debug for .z.t query - raw response: $response")
            logger.info("Special debug for .z.t query - raw response type: ${response?.javaClass}")
            
            // Add more detailed inspection for time value
            when (response) {
                is java.sql.Time -> logger.info("Response is java.sql.Time: $response")
                is Long -> logger.info("Response is Long: $response")
                is Int -> logger.info("Response is Int: $response")
                is Double -> logger.info("Response is Double: $response")
                is com.kx.c.Timespan -> logger.info("Response is c.Timespan: $response")
                is com.kx.c.Month -> logger.info("Response is c.Month: $response")
                is com.kx.c.Minute -> logger.info("Response is c.Minute: $response")
                is com.kx.c.Second -> logger.info("Response is c.Second: $response")
                else -> logger.info("Response is of type: ${response?.javaClass?.name}")
            }
        }
        
        return response
    }

    override fun ping(): Boolean {
        logger.debug("Pinging Q process")
        if (!isConnected()) {
            logger.debug("Not connected, ping failed")
            return false
        }
        
        return try {
            connection?.k("".toCharArray()) // Send an empty query as a ping
            logger.debug("Ping successful")
            true
        } catch (e: Exception) {
            logger.error("Ping failed", e)
            false
        }
    }
}

