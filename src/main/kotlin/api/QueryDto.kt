package org.example.api

import org.example.QIPC.ArrayShapeAnalyzer
import org.example.QIPC.ErrorDetails

data class QueryRequestDto(
    val query: String
)

data class QueryResponseDto(
    val success: Boolean,
    val data: Any? = null,
    val error: String? = null,
    val dataType: String? = null,
    val arrayShape: ArrayShapeAnalyzer.ArrayShape? = null,
    val errorDetails: ErrorDetails? = null,
    val timestamp: Long? = null
)
