package org.example.QIPC

data class QueryRequest(
    val query: String,
    val id: String? = null // Optional ID for tracking
)

