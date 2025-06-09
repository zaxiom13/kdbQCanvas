package org.example.QIPC

object QErrorAnalyzer {
    
    fun analyzeError(errorMessage: String?, query: String): ErrorDetails {
        if (errorMessage == null) {
            return ErrorDetails(
                errorType = "UNKNOWN_ERROR",
                suggestion = "Check query syntax and try again"
            )
        }
        
        val message = errorMessage.lowercase()
        
        // Analyze different types of Q errors
        return when {
            // Syntax errors
            message.contains("syntax") || message.contains("rank") -> {
                ErrorDetails(
                    errorType = "SYNTAX_ERROR",
                    errorCode = extractErrorCode(errorMessage),
                    suggestion = "Check for missing parentheses, brackets, or semicolons. Verify operator usage.",
                    relatedDocs = "https://code.kx.com/q/basics/syntax/"
                )
            }
            
            // Type errors
            message.contains("type") || message.contains("domain") -> {
                ErrorDetails(
                    errorType = "TYPE_ERROR", 
                    errorCode = extractErrorCode(errorMessage),
                    suggestion = "Check data types are compatible. Ensure numeric operations use numeric data.",
                    relatedDocs = "https://code.kx.com/q/basics/datatypes/"
                )
            }
            
            // Undefined variables/functions
            message.contains("value") || message.contains("'") -> {
                val undefinedVar = extractUndefinedVariable(errorMessage, query)
                ErrorDetails(
                    errorType = "UNDEFINED_VARIABLE",
                    errorCode = extractErrorCode(errorMessage),
                    location = undefinedVar,
                    suggestion = if (undefinedVar != null) "Variable '$undefinedVar' is not defined. Check spelling or define it first." 
                               else "Referenced variable or function is not defined.",
                    relatedDocs = "https://code.kx.com/q/ref/"
                )
            }
            
            // Length/dimension errors
            message.contains("length") || message.contains("conformable") -> {
                ErrorDetails(
                    errorType = "DIMENSION_ERROR",
                    errorCode = extractErrorCode(errorMessage),
                    suggestion = "Arrays must have compatible dimensions for the operation. Check array shapes.",
                    relatedDocs = "https://code.kx.com/q/basics/math/"
                )
            }
            
            // Memory errors
            message.contains("wsfull") || message.contains("memory") -> {
                ErrorDetails(
                    errorType = "MEMORY_ERROR",
                    errorCode = extractErrorCode(errorMessage),
                    suggestion = "Insufficient memory. Try reducing data size or use more efficient operations.",
                    relatedDocs = "https://code.kx.com/q/kb/memory/"
                )
            }
            
            // File/IO errors
            message.contains("file") || message.contains("io") -> {
                ErrorDetails(
                    errorType = "IO_ERROR",
                    errorCode = extractErrorCode(errorMessage),
                    suggestion = "Check file paths, permissions, and ensure files exist.",
                    relatedDocs = "https://code.kx.com/q/ref/file/"
                )
            }
            
            // Connection errors
            message.contains("connection") || message.contains("connect") -> {
                ErrorDetails(
                    errorType = "CONNECTION_ERROR",
                    suggestion = "Check if Q process is running and connection parameters are correct."
                )
            }
            
            // Parse errors
            message.contains("parse") -> {
                ErrorDetails(
                    errorType = "PARSE_ERROR",
                    errorCode = extractErrorCode(errorMessage),
                    suggestion = "Invalid Q expression syntax. Check brackets, parentheses, and operators.",
                    relatedDocs = "https://code.kx.com/q/basics/syntax/"
                )
            }
            
            // Network/socket errors
            message.contains("socket") || message.contains("network") -> {
                ErrorDetails(
                    errorType = "NETWORK_ERROR",
                    suggestion = "Network connection issue. Check if backend server is running on port 8080."
                )
            }
            
            // Default case
            else -> {
                ErrorDetails(
                    errorType = "GENERAL_ERROR",
                    errorCode = extractErrorCode(errorMessage),
                    suggestion = getGeneralSuggestion(query),
                    relatedDocs = "https://code.kx.com/q/"
                )
            }
        }
    }
    
    private fun extractErrorCode(errorMessage: String): String? {
        // Try to extract Q error codes (often single letters like 'type, 'rank, etc.)
        val codeRegex = "'\\w+".toRegex()
        return codeRegex.find(errorMessage)?.value
    }
    
    private fun extractUndefinedVariable(errorMessage: String, query: String): String? {
        // Try to extract the undefined variable name from error message
        val varRegex = "'([a-zA-Z_][a-zA-Z0-9_]*)".toRegex()
        val match = varRegex.find(errorMessage)
        return match?.groupValues?.get(1)
    }
    
    private fun getGeneralSuggestion(query: String): String {
        return when {
            query.contains("mouseX") || query.contains("mouseY") -> 
                "For mouse-dependent queries, enable Live Mode to define mouseX and mouseY variables."
            query.length > 100 -> 
                "Complex query detected. Try breaking it into smaller parts for easier debugging."
            query.contains("til") && query.contains("#") -> 
                "Check array dimensions and reshaping syntax: rows cols # data"
            else -> 
                "Check Q syntax, function names, and variable definitions."
        }
    }
}
