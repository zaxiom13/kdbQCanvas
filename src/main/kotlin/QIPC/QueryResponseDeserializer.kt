package org.example.QIPC

import com.kx.c // Added import for c.KException
import org.slf4j.LoggerFactory

/**
 * Deserializes the raw response from the Q process into a QueryResponse object.
 */
class QueryResponseDeserializer {
    private val logger = LoggerFactory.getLogger(QueryResponseDeserializer::class.java)
    private val arrayShapeAnalyzer = ArrayShapeAnalyzer()
    
    fun deserialize(qResponse: Any?, request: QueryRequest): QueryResponse {
        logger.debug("Deserializing Q response for query: '${request.query}'")
        logger.debug("Response type: ${qResponse?.javaClass?.name ?: "null"}")
        
        // Special handling for .z.t query
        if (request.query.trim() == ".z.t") {
            logger.info("Special handling for .z.t time query")
            logger.info("Raw response: $qResponse")
            logger.info("Response type: ${qResponse?.javaClass?.name ?: "null"}")
        }
        
        return when (qResponse) {
            null -> {
                logger.warn("Query '${request.query}' returned null")
                QueryResponse(data = null, error = "Query '${request.query}' returned null.", dataType = "Null")
            }
            is c.KException -> {
                logger.error("Q KException for query '${request.query}': ${qResponse.message}")
                val errorDetails = QErrorAnalyzer.analyzeError(qResponse.message, request.query)
                QueryResponse(
                    data = null, 
                    error = "Q KException for query '${request.query}': ${qResponse.message}", 
                    dataType = "QException",
                    errorDetails = errorDetails
                )
            }
            is Exception -> {
                logger.error("General Exception for query '${request.query}': ${qResponse.message}")
                val errorDetails = QErrorAnalyzer.analyzeError(qResponse.message, request.query)
                QueryResponse(
                    data = null, 
                    error = "General Exception for query '${request.query}': ${qResponse.message}", 
                    dataType = "Exception",
                    errorDetails = errorDetails
                )
            }
            // Array handling with shape analysis
            is Array<*>, is LongArray, is IntArray, is DoubleArray, is ShortArray, is BooleanArray, is CharArray -> {
                val shape = arrayShapeAnalyzer.analyzeShape(qResponse)
                logger.debug("Array shape analysis: $shape")
                QueryResponse(
                    data = qResponse,
                    dataType = qResponse.javaClass.simpleName,
                    arrayShape = shape
                )
            }
            // Special handling for KDB+ specific time types
            is com.kx.c.Timespan -> {
                logger.debug("Processing c.Timespan response: $qResponse")
                QueryResponse(data = qResponse.toString(), dataType = "Time")
            }
            is com.kx.c.Month -> {
                logger.debug("Processing c.Month response: $qResponse")
                QueryResponse(data = qResponse.toString(), dataType = "Month")
            }
            is com.kx.c.Minute -> {
                logger.debug("Processing c.Minute response: $qResponse")
                QueryResponse(data = qResponse.toString(), dataType = "Minute")
            }
            is com.kx.c.Second -> {
                logger.debug("Processing c.Second response: $qResponse")
                QueryResponse(data = qResponse.toString(), dataType = "Second")
            }
            is java.sql.Time -> {
                logger.debug("Processing java.sql.Time response: $qResponse")
                QueryResponse(data = qResponse.toString(), dataType = "SQLTime")
            }
            is Long -> {
                logger.debug("Processing Long response: $qResponse")
                // If this is for .z.t, it might be a time value in milliseconds or nanoseconds
                if (request.query.trim() == ".z.t") {
                    // Try to convert long to a time representation if it's a .z.t query
                    val timeStr = formatTimeValue(qResponse)
                    QueryResponse(data = timeStr, dataType = "Time")
                } else {
                    QueryResponse(data = qResponse, dataType = "Long")
                }
            }
            is Int -> {
                logger.debug("Processing Int response: $qResponse")
                QueryResponse(data = qResponse, dataType = "Int")
            }
            is Double -> {
                logger.debug("Processing Double response: $qResponse")
                QueryResponse(data = qResponse, dataType = "Double")
            }
            else -> {
                logger.debug("Processing generic response of type: ${qResponse.javaClass.name}")
                QueryResponse(data = qResponse.toString(), dataType = qResponse.javaClass.simpleName)
            }
        }
    }
    
    /**
     * Formats a time value (from .z.t) to a more readable string
     */
    private fun formatTimeValue(timeValue: Long): String {
        // KDB+ timespan in nanoseconds since midnight, convert to a readable format
        try {
            logger.debug("Formatting time value: $timeValue")
            
            // KDB+ time can be represented in different ways
            // 1. If it's around current time of day in milliseconds (reasonable value < 86400000)
            if (timeValue < 86400000) {
                // Likely milliseconds since midnight
                val hours = timeValue / 3600000
                val minutes = (timeValue % 3600000) / 60000
                val seconds = (timeValue % 60000) / 1000
                val millis = timeValue % 1000
                
                logger.debug("Interpreting as milliseconds since midnight: $hours:$minutes:$seconds.$millis")
                return String.format("%02d:%02d:%02d.%03d", 
                    hours, minutes, seconds, millis)
            } 
            // 2. If it's a very large number, it might be in nanoseconds
            else {
                // Convert nanoseconds to a more reasonable unit (milliseconds)
                val milliseconds = timeValue / 1_000_000
                val seconds = milliseconds / 1000
                val minutes = seconds / 60
                val hours = minutes / 60
                
                val remainingMinutes = minutes % 60
                val remainingSeconds = seconds % 60
                val remainingMillis = milliseconds % 1000
                
                logger.debug("Interpreting as nanoseconds: $hours:$remainingMinutes:$remainingSeconds.$remainingMillis")
                return String.format("%02d:%02d:%02d.%03d", 
                    hours, remainingMinutes, remainingSeconds, remainingMillis)
            }
        } catch (e: Exception) {
            logger.error("Failed to format time value: $timeValue", e)
            return timeValue.toString()
        }
    }
}
