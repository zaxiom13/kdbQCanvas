package org.example.QIPC

import com.kx.c
import org.slf4j.LoggerFactory
import java.io.IOException

/**
 * Manages the lifecycle of a query to a Q process, including serialization,
 * sending the query, and deserializing the response.
 * Optimized for high-frequency live mode queries.
 */
class QueryLifecycleManager(private val ipcConnector: IPCConnector) {

    private val logger = LoggerFactory.getLogger(QueryLifecycleManager::class.java)
    
    // Use singleton instances to avoid object creation overhead
    companion object {
        private val serializer = QueryRequestSerializer()
        private val deserializer = QueryResponseDeserializer()
    }

    fun executeQuery(request: QueryRequest): QueryResponse {
        val isDebugMode = logger.isDebugEnabled
        
        if (isDebugMode) {
            logger.debug("Executing query: '${request.query}'")
        }
        
        // Fast path: if already connected, skip connection check overhead
        if (!ipcConnector.isConnected()) {
            try {
                if (isDebugMode) {
                    logger.info("Not connected. Attempting to connect to Q process...")
                }
                ipcConnector.connect()
                if (isDebugMode) {
                    logger.debug("Connection successful")
                }
            } catch (e: Exception) {
                logger.error("Connection failed before sending query", e)
                val errorDetails = ErrorDetails(
                    errorType = "CONNECTION_ERROR",
                    suggestion = "Failed to connect to Q process. Check if Q is running and accessible."
                )
                return QueryResponse(
                    data = null,
                    error = "Connection failed before sending query '${request.query}': ${e.message}",
                    dataType = "ConnectionError",
                    errorDetails = errorDetails
                )
            }
        }

        val serializedQuery: String
        try {
            if (isDebugMode) {
                logger.debug("Serializing query request")
            }
            serializedQuery = serializer.serialize(request)
        } catch (e: Exception) {
            logger.error("Serialization failed", e)
            val errorDetails = ErrorDetails(
                errorType = "SERIALIZATION_ERROR",
                suggestion = "Query could not be processed. Check for invalid characters or syntax."
            )
            return QueryResponse(
                data = null,
                error = "Serialization failed for query '${request.query}': ${e.message}",
                dataType = "SerializationError",
                errorDetails = errorDetails
            )
        }

        var rawResponse: Any?
        try {
            if (isDebugMode) {
                logger.debug("Sending query to Q process: '$serializedQuery'")
            }
            
            // Direct raw query execution - this is the hot path for live mode
            rawResponse = ipcConnector.sendRawQuery(serializedQuery)
            
            if (isDebugMode) {
                logger.debug("Received raw response: $rawResponse")
                logger.debug("Deserializing response")
            }
            
            val response = deserializer.deserialize(rawResponse, request)
            
            if (isDebugMode) {
                logger.debug("Deserialized response - success: ${response.success}, dataType: ${response.dataType}")
                
                if (response.success) {
                    logger.debug("Query executed successfully, data: ${response.data}")
                } else {
                    logger.warn("Query execution failed: ${response.error}")
                }
                
                // Special debugging for .z.t query only when debug enabled
                if (request.query.trim() == ".z.t") {
                    logger.info("Special debug for .z.t query - raw response type: ${rawResponse?.javaClass}")
                    logger.info("Special debug for .z.t query - raw response value: $rawResponse")
                }
            }
            
            return response
        } catch (e: c.KException) {
            // Specific KDB+ error during query execution
            logger.error("KDB+ error executing query '${request.query}'", e)
            val errorDetails = QErrorAnalyzer.analyzeError(e.message, request.query)
            return QueryResponse(
                data = null,
                error = "KDB+ error executing query '${request.query}': ${e.message}",
                dataType = "KDBExecutionError",
                errorDetails = errorDetails
            )
        } catch (e: IOException) {
            // IO error during query execution (e.g., network issue)
            logger.error("IO error executing query '${request.query}'", e)
            val errorDetails = ErrorDetails(
                errorType = "IO_ERROR",
                suggestion = "Network or connection issue. Check if Q process is running and accessible."
            )
            return QueryResponse(
                data = null,
                error = "IO error executing query '${request.query}': ${e.message}",
                dataType = "IOExecutionError",
                errorDetails = errorDetails
            )
        } catch (e: Exception) {
            // Catch-all for other errors during deserialization or unexpected issues
            logger.error("Unexpected error during query lifecycle for '${request.query}'", e)
            val errorDetails = QErrorAnalyzer.analyzeError(e.message, request.query)
            return QueryResponse(
                data = null,
                error = "Unexpected error during query lifecycle for '${request.query}': ${e.message}",
                dataType = "UnexpectedError",
                errorDetails = errorDetails
            )
        }
    }
    
    /**
     * Fast path for live mode queries - minimal logging and error handling overhead
     */
    fun executeQueryFastPath(request: QueryRequest): QueryResponse {
        return try {
            val serializedQuery = serializer.serialize(request)
            val rawResponse = ipcConnector.sendRawQuery(serializedQuery)
            deserializer.deserialize(rawResponse, request)
        } catch (e: c.KException) {
            val errorDetails = QErrorAnalyzer.analyzeError(e.message, request.query)
            QueryResponse(
                data = null,
                error = "KDB+ error: ${e.message}",
                dataType = "KDBExecutionError",
                errorDetails = errorDetails
            )
        } catch (e: Exception) {
            QueryResponse(
                data = null,
                error = "Query failed: ${e.message}",
                dataType = "UnexpectedError"
            )
        }
    }
}
