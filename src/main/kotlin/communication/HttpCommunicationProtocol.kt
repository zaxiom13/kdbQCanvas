package org.example.communication

import org.example.QProcessManager
import org.example.QIPC.QueryLifecycleManager
import org.example.QIPC.QueryRequest
import org.example.api.QueryResponseDto
import org.slf4j.LoggerFactory
import io.ktor.serialization.gson.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.http.*
import org.example.api.routing.configureRouting
import java.util.concurrent.CompletableFuture
import kotlinx.coroutines.*

/**
 * HTTP-based communication protocol implementation
 * Uses existing Ktor server infrastructure for standard queries
 */
class HttpCommunicationProtocol(
    private val qManager: QProcessManager,
    private val port: Int = 8080
) : CommunicationProtocol {
    
    private val logger = LoggerFactory.getLogger(HttpCommunicationProtocol::class.java)
    private var server: NettyApplicationEngine? = null
    private var isRunning = false
    
    override suspend fun executeQuery(query: String): QueryResponseDto {
        return withContext(Dispatchers.IO) {
            executeQueryInternal(query)
        }
    }
    
    override fun executeQueryAsync(query: String): CompletableFuture<QueryResponseDto> {
        return CompletableFuture.supplyAsync {
            executeQueryInternal(query)
        }
    }
    
    override fun start() {
        if (isRunning) {
            logger.warn("HTTP protocol already running on port $port")
            return
        }
        
        logger.info("Starting HTTP communication protocol on port $port")
        
        server = embeddedServer(Netty, port = port) {
            install(ContentNegotiation) {
                gson {
                    setPrettyPrinting()
                }
            }
            
            install(CORS) {
                allowMethod(HttpMethod.Options)
                allowMethod(HttpMethod.Post)
                allowMethod(HttpMethod.Get)
                allowHeader(HttpHeaders.ContentType)
                allowHeader(HttpHeaders.Authorization)
                anyHost() // For development only
            }
            
            configureRouting(qManager, ::executeQueryInternal)
        }.start(wait = false)
        
        isRunning = true
        logger.info("HTTP communication protocol started on http://localhost:$port")
    }
    
    override fun stop() {
        if (!isRunning) {
            logger.warn("HTTP protocol not running")
            return
        }
        
        logger.info("Stopping HTTP communication protocol")
        server?.stop(1000, 2000)
        isRunning = false
        logger.info("HTTP communication protocol stopped")
    }
    
    override fun isRunning(): Boolean = isRunning
    
    override fun getConnectionStatus(): ConnectionStatus {
        return ConnectionStatus(
            isConnected = isRunning && qManager.isRunning(),
            protocolType = "HTTP",
            lastError = if (!qManager.isRunning()) "Q process not running" else null
        )
    }
    
    private fun executeQueryInternal(queryString: String): QueryResponseDto {
        logger.debug("HTTP protocol executing query: '$queryString'")
        
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
}
