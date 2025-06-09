package org.example.api.routing

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.example.QProcessManager
import org.example.api.QueryRequestDto
import org.example.api.QueryResponseDto
import org.example.util.formatTimeAsMs
import org.example.util.formatTimeAsNs
import org.slf4j.LoggerFactory
import io.ktor.server.routing.Route

private val logger = LoggerFactory.getLogger("ApiRouting")

fun Route.apiRoutes(qManager: QProcessManager, executeQueryFunc: (String) -> QueryResponseDto) {
    route("/api") {
        post("/query") {
            try {
                val requestDto = call.receive<QueryRequestDto>()
                logger.debug("Received query request: ${requestDto.query}")
                val response = executeQueryFunc(requestDto.query)
                logger.debug("Query executed, success: ${response.success}, dataType: ${response.dataType}, arrayShape: ${response.arrayShape}")
                call.respond(HttpStatusCode.OK, response)
            } catch (e: Exception) {
                logger.error("Failed to process request", e)
                val errorResponse = QueryResponseDto(
                    success = false,
                    error = "Failed to process request: ${e.message}"
                )
                call.respond(HttpStatusCode.BadRequest, errorResponse)
            }
        }

        get("/debug/time") {
            logger.info("Time debug endpoint called")
            try {
                if (!qManager.isRunning()) {
                    call.respond(HttpStatusCode.ServiceUnavailable, mapOf(
                        "error" to "Q process is not running"
                    ))
                    return@get
                }

                val ipcConnector = qManager.getIPCConnector()
                if (ipcConnector == null) {
                    call.respond(HttpStatusCode.ServiceUnavailable, mapOf(
                        "error" to "IPC Connector is not available"
                    ))
                    return@get
                }

                val rawTimeResponse = ipcConnector.sendRawQuery(".z.t")
                val asMillis = if (rawTimeResponse is Long) formatTimeAsMs(rawTimeResponse) else null
                val asNanos = if (rawTimeResponse is Long) formatTimeAsNs(rawTimeResponse) else null

                val timeDebug = mapOf(
                    "rawResponse" to rawTimeResponse,
                    "responseType" to (rawTimeResponse?.javaClass?.name ?: "null"),
                    "toString" to (rawTimeResponse?.toString() ?: "null"),
                    "currentSystemTime" to System.currentTimeMillis(),
                    "formattedSystemTime" to java.time.LocalTime.now().toString(),
                    "asMilliseconds" to asMillis,
                    "asNanoseconds" to asNanos,
                    "systemTimeMillis" to System.currentTimeMillis() % 86400000
                )
                call.respond(HttpStatusCode.OK, timeDebug)
            } catch (e: Exception) {
                logger.error("Error in time debug endpoint", e)
                call.respond(HttpStatusCode.InternalServerError, mapOf(
                    "error" to "Error processing time debug: ${e.message}"
                ))
            }
        }

        get("/health") {
            logger.debug("Health check requested")
            val isRunning = qManager.isRunning()
            logger.debug("Q process status: $isRunning")

            val healthStatus = mapOf(
                "status" to "ok",
                "qProcessRunning" to isRunning,
                "timestamp" to System.currentTimeMillis()
            )
            call.respond(HttpStatusCode.OK, healthStatus)
        }
    }
}

fun Application.configureRouting(qManager: QProcessManager, executeQueryFunc: (String) -> QueryResponseDto) {
    routing {
        apiRoutes(qManager, executeQueryFunc)
    }
}
