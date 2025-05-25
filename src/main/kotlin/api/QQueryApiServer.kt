package org.example.api

import io.ktor.serialization.gson.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.http.*
import org.example.QProcessManager
import org.example.QIPC.QueryLifecycleManager
import org.example.QIPC.QueryRequest
import org.example.api.routing.configureRouting
import org.slf4j.LoggerFactory

class QQueryApiServer(private val qManager: QProcessManager, private val port: Int = 8080) {
    private val logger = LoggerFactory.getLogger(QQueryApiServer::class.java)
    private var server: NettyApplicationEngine? = null
    
    fun start() {
        logger.info("Starting API Server on port $port")
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
                anyHost() // For development only - should be restricted in production
            }
            
            configureRouting(qManager, ::executeQuery)
        }.start(wait = false)
        
        logger.info("API Server started on http://localhost:$port")
    }
    
    fun stop() {
        logger.info("Stopping API Server")
        server?.stop(1000, 2000)
        logger.info("API Server stopped")
    }
    
    private fun executeQuery(queryString: String): QueryResponseDto {
        logger.debug("Executing query: '$queryString'")
        
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
            logger.debug("Creating QueryLifecycleManager and executing query")
            val queryLifecycleManager = QueryLifecycleManager(ipcConnector)
            val request = QueryRequest(queryString)
            val response = queryLifecycleManager.executeQuery(request)
            
            logger.debug("Query result: success=${response.success}, dataType=${response.dataType}")
            if (!response.success) {
                logger.warn("Query error: ${response.error}")
            } else {
                logger.debug("Query data: ${response.data}")
            }
            
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
