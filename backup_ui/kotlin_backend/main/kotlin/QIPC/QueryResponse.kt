package org.example.QIPC

data class QueryResponse(
    val data: Any?,
    val error: String? = null,
    val dataType: String? = null, // e.g., "LongArray", "IntArray", "Symbol", "QError", etc.
    val success: Boolean = error == null,
    val arrayShape: ArrayShapeAnalyzer.ArrayShape? = null, // Shape information for array responses
    val errorDetails: ErrorDetails? = null, // Additional error context
    val timestamp: Long = System.currentTimeMillis() // When the response was created
)

data class ErrorDetails(
    val errorType: String, // e.g., "SYNTAX_ERROR", "TYPE_ERROR", "UNDEFINED_VARIABLE", etc.
    val errorCode: String? = null, // Q-specific error code if available
    val location: String? = null, // Location in query where error occurred
    val suggestion: String? = null, // Specific suggestion for this error
    val relatedDocs: String? = null // Link to relevant documentation
)

