package org.example.QIPC

/**
 * Serializes a QueryRequest into a format suitable for sending to the Q process.
 * For now, this is a simple pass-through of the query string.
 */
class QueryRequestSerializer {
    fun serialize(request: QueryRequest): String {
        // In a more complex scenario, this could involve formatting
        // or converting the request object into a specific string protocol.
        return request.query
    }
}

