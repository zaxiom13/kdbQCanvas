package org.example.QIPC

import com.kx.c
import org.slf4j.LoggerFactory
import java.io.IOException

open class QIPCConnector(private val host: String, private val port: Int) : IPCConnector {
    private val logger = LoggerFactory.getLogger(QIPCConnector::class.java)
    private var connection: c? = null
    private val isDebugMode = logger.isDebugEnabled
    
    // Performance optimization: cache connection status to avoid socket checks
    @Volatile
    private var cachedConnectionStatus = false
    private var lastConnectionCheckTime = 0L
    private val connectionCheckIntervalMs = 1000L // Check actual connection every 1 second max

    @Throws(IOException::class, c.KException::class)
    override fun connect() {
        if (connection == null) {
            if (isDebugMode) {
                logger.info("Connecting to Q process on $host:$port")
            }
            connection = c(host, port)
            cachedConnectionStatus = true
            lastConnectionCheckTime = System.currentTimeMillis()
            if (isDebugMode) {
                logger.info("Successfully connected to Q process on $host:$port")
            }
        } else {
            if (isDebugMode) {
                logger.debug("Already connected to Q process")
            }
        }
    }

    override fun disconnect() {
        try {
            if (isDebugMode) {
                logger.info("Disconnecting from Q process")
            }
            connection?.close()
            if (isDebugMode) {
                logger.info("KDB+ connection closed")
            }
        } catch (e: IOException) {
            logger.error("Error closing KDB+ connection", e)
        } finally {
            connection = null
            cachedConnectionStatus = false
            lastConnectionCheckTime = 0L
        }
    }

    override fun isConnected(): Boolean {
        val currentTime = System.currentTimeMillis()
        
        // Use cached status for recent checks to avoid expensive socket operations
        if (cachedConnectionStatus && (currentTime - lastConnectionCheckTime) < connectionCheckIntervalMs) {
            return true
        }
        
        // Perform actual connection check
        val actuallyConnected = connection != null && connection!!.s.isBound
        cachedConnectionStatus = actuallyConnected
        lastConnectionCheckTime = currentTime
        
        if (isDebugMode) {
            logger.debug("IPC connection status: $actuallyConnected")
        }
        
        return actuallyConnected
    }

    @Throws(IOException::class, c.KException::class)
    override fun sendRawQuery(query: String): Any? {
        // Fast path: if cached status shows connected, try query directly
        if (cachedConnectionStatus) {
            try {
                if (isDebugMode) {
                    logger.debug("Sending raw query to Q: '$query'")
                }
                val response = connection?.k(query.toCharArray())
                
                if (isDebugMode) {
                    logger.debug("Received raw response type: ${response?.javaClass}")
                    
                    // Special debug for .z.t query only when debug enabled
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
                }
                
                return response
            } catch (e: IOException) {
                // Connection might have been lost, invalidate cache and reconnect
                cachedConnectionStatus = false
                lastConnectionCheckTime = 0L
                logger.warn("Connection lost during query execution, attempting to reconnect")
            }
        }
        
        // Fallback: check connection and reconnect if necessary
        if (!isConnected()) {
            if (isDebugMode) {
                logger.info("Not connected. Attempting to connect before sending raw query...")
            }
            connect()
            if (!isConnected()) {
                logger.error("Failed to connect to Q process to send raw query.")
                throw IOException("Failed to connect to Q process to send raw query.")
            }
        }
        
        if (isDebugMode) {
            logger.debug("Sending raw query to Q: '$query'")
        }
        val response = connection?.k(query.toCharArray())
        if (isDebugMode) {
            logger.debug("Received raw response type: ${response?.javaClass}")
        }
        
        return response
    }

    override fun ping(): Boolean {
        if (isDebugMode) {
            logger.debug("Pinging Q process")
        }
        
        // Use cached status for recent pings to reduce overhead
        val currentTime = System.currentTimeMillis()
        if (cachedConnectionStatus && (currentTime - lastConnectionCheckTime) < connectionCheckIntervalMs) {
            if (isDebugMode) {
                logger.debug("Ping successful (cached)")
            }
            return true
        }
        
        if (!isConnected()) {
            if (isDebugMode) {
                logger.debug("Not connected, ping failed")
            }
            return false
        }
        
        return try {
            connection?.k("".toCharArray()) // Send an empty query as a ping
            cachedConnectionStatus = true
            lastConnectionCheckTime = currentTime
            if (isDebugMode) {
                logger.debug("Ping successful")
            }
            true
        } catch (e: Exception) {
            cachedConnectionStatus = false
            lastConnectionCheckTime = 0L
            logger.error("Ping failed", e)
            false
        }
    }
}

