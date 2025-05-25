package org.example.communication

import com.google.gson.Gson
import org.example.QProcessManager
import org.example.QIPC.QueryLifecycleManager
import org.example.QIPC.QueryRequest
import org.example.api.QueryResponseDto
import org.slf4j.LoggerFactory
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import io.ktor.http.*
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.ClosedReceiveChannelException
import java.time.Duration
import java.util.concurrent.CompletableFuture
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicLong

/**
 * WebSocket-based communication protocol for high-performance real-time queries.
 * Optimized for live mode with minimal latency.
 */
class WebSocketCommunicationProtocol(
    private val qManager: QProcessManager,
    private val port: Int = 8081
) : CommunicationProtocol {
    
    private val logger = LoggerFactory.getLogger(WebSocketCommunicationProtocol::class.java)
    private var server: NettyApplicationEngine? = null
    private var isRunning = false
    private val gson = Gson()
    
    // Connection management
    private val activeSessions = ConcurrentHashMap<String, DefaultWebSocketSession>()
    private val sessionIdCounter = AtomicLong(0)
    
    // Query response handling for async operations
    private val pendingQueries = ConcurrentHashMap<String, CompletableFuture<QueryResponseDto>>()
    
    override suspend fun executeQuery(query: String): QueryResponseDto {
        return withContext(Dispatchers.IO) {
            executeQueryDirect(query)
        }
    }
    
    override fun executeQueryAsync(query: String): CompletableFuture<QueryResponseDto> {
        return CompletableFuture.supplyAsync {
            executeQueryDirect(query)
        }
    }
    
    override fun start() {
        if (isRunning) {
            logger.warn("WebSocket protocol already running on port $port")
            return
        }
        
        logger.info("Starting WebSocket communication protocol on port $port")
        
        server = embeddedServer(Netty, port = port) {
            install(WebSockets) {
                pingPeriod = Duration.ofSeconds(15)
                timeout = Duration.ofSeconds(15)
                maxFrameSize = Long.MAX_VALUE
                masking = false
            }
            
            install(CORS) {
                allowMethod(HttpMethod.Options)
                allowMethod(HttpMethod.Get)
                allowHeader(HttpHeaders.ContentType)
                allowHeader(HttpHeaders.Authorization)
                anyHost() // For development only
            }
            
            routing {
                webSocket("/ws") {
                    val sessionId = sessionIdCounter.incrementAndGet().toString()
                    activeSessions[sessionId] = this
                    logger.info("WebSocket session $sessionId connected")
                    
                    try {
                        for (frame in incoming) {
                            when (frame) {
                                is Frame.Text -> {
                                    val message = frame.readText()
                                    handleWebSocketMessage(sessionId, message)
                                }
                                is Frame.Close -> {
                                    logger.info("WebSocket session $sessionId closed")
                                    break
                                }
                                else -> {
                                    logger.debug("Received non-text frame in session $sessionId")
                                }
                            }
                        }
                    } catch (e: ClosedReceiveChannelException) {
                        logger.info("WebSocket session $sessionId channel closed")
                    } catch (e: Exception) {
                        logger.error("Error in WebSocket session $sessionId", e)
                    } finally {
                        activeSessions.remove(sessionId)
                        logger.info("WebSocket session $sessionId removed")
                    }
                }
            }
        }.start(wait = false)
        
        isRunning = true
        logger.info("WebSocket communication protocol started on ws://localhost:$port/ws")
    }
    
    override fun stop() {
        if (!isRunning) {
            logger.warn("WebSocket protocol not running")
            return
        }
        
        logger.info("Stopping WebSocket communication protocol")
        
        // Close all active sessions
        activeSessions.values.forEach { session ->
            try {
                runBlocking {
                    session.close(CloseReason(CloseReason.Codes.GOING_AWAY, "Server shutting down"))
                }
            } catch (e: Exception) {
                logger.warn("Error closing WebSocket session", e)
            }
        }
        activeSessions.clear()
        
        server?.stop(1000, 2000)
        isRunning = false
        logger.info("WebSocket communication protocol stopped")
    }
    
    override fun isRunning(): Boolean = isRunning
    
    override fun getConnectionStatus(): ConnectionStatus {
        return ConnectionStatus(
            isConnected = isRunning && qManager.isRunning() && activeSessions.isNotEmpty(),
            protocolType = "WebSocket",
            lastError = when {
                !isRunning -> "WebSocket server not running"
                !qManager.isRunning() -> "Q process not running"
                activeSessions.isEmpty() -> "No active WebSocket connections"
                else -> null
            }
        )
    }
    
    private suspend fun handleWebSocketMessage(sessionId: String, message: String) {
        try {
            val request = gson.fromJson(message, WebSocketQueryRequest::class.java)
            logger.debug("WebSocket session $sessionId executing query: '${request.query}'")
            
            val queryResponse = executeQueryDirect(request.query)
            
            val response = WebSocketQueryResponse(
                id = request.id,
                success = queryResponse.success,
                data = queryResponse.data,
                error = queryResponse.error,
                dataType = queryResponse.dataType,
                arrayShape = queryResponse.arrayShape,
                errorDetails = queryResponse.errorDetails,
                timestamp = queryResponse.timestamp ?: System.currentTimeMillis()
            )
            
            val responseJson = gson.toJson(response)
            activeSessions[sessionId]?.send(Frame.Text(responseJson))
            
        } catch (e: Exception) {
            logger.error("Error handling WebSocket message from session $sessionId", e)
            val errorResponse = WebSocketQueryResponse(
                id = null,
                success = false,
                error = "Failed to process message: ${e.message}",
                dataType = "Error",
                timestamp = System.currentTimeMillis()
            )
            val responseJson = gson.toJson(errorResponse)
            activeSessions[sessionId]?.send(Frame.Text(responseJson))
        }
    }
    
    private fun executeQueryDirect(queryString: String): QueryResponseDto {
        logger.debug("WebSocket protocol executing query: '$queryString'")
        
        if (!qManager.isRunning()) {
            logger.warn("Query execution failed: Q process is not running")
            return QueryResponseDto(
                success = false,
                error = "Q process is not running",
                timestamp = System.currentTimeMillis()
            )
        }
        
        val ipcConnector = qManager.getIPCConnector()
        if (ipcConnector == null) {
            logger.warn("Query execution failed: IPC Connector is not available")
            return QueryResponseDto(
                success = false,
                error = "IPC Connector is not available",
                timestamp = System.currentTimeMillis()
            )
        }
        
        return try {
            val queryLifecycleManager = QueryLifecycleManager(ipcConnector)
            val request = QueryRequest(queryString)
            val response = queryLifecycleManager.executeQuery(request)
            
            QueryResponseDto(
                success = response.success,
                data = response.data,
                error = response.error,
                dataType = response.dataType,
                arrayShape = response.arrayShape,
                errorDetails = response.errorDetails,
                timestamp = response.timestamp
            )
        } catch (e: Exception) {
            logger.error("Query execution threw exception", e)
            QueryResponseDto(
                success = false,
                error = "Query execution failed: ${e.message}",
                timestamp = System.currentTimeMillis()
            )
        }
    }
    
    /**
     * Broadcast a message to all active WebSocket sessions
     */
    suspend fun broadcast(message: String) {
        activeSessions.values.forEach { session ->
            try {
                session.send(Frame.Text(message))
            } catch (e: Exception) {
                logger.warn("Failed to send broadcast message to session", e)
            }
        }
    }
    
    /**
     * Get the number of active WebSocket connections
     */
    fun getActiveConnectionCount(): Int = activeSessions.size
}

/**
 * WebSocket query request message format
 */
data class WebSocketQueryRequest(
    val id: String? = null,
    val query: String,
    val timestamp: Long = System.currentTimeMillis()
)

/**
 * WebSocket query response message format
 */
data class WebSocketQueryResponse(
    val id: String? = null,
    val success: Boolean,
    val data: Any? = null,
    val error: String? = null,
    val dataType: String? = null,
    val arrayShape: org.example.QIPC.ArrayShapeAnalyzer.ArrayShape? = null,
    val errorDetails: Any? = null,
    val timestamp: Long
)
