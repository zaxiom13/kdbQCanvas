import React from 'react'
import { formatResult } from '../../utils/arrayFormatters'
import { calculateArrayStats } from '../../utils/queryUtils'

const ResultDisplay = ({ result, error }) => {
  // Check if there's an error to display
  const hasError = error || (result && !result.success && result.error)
  
  if (hasError) {
    // Get error details from enhanced backend response or fallback to client-side parsing
    const errorMessage = error || result?.error || 'Unknown error occurred'
    const errorType = result?.dataType || 'General Error'
    const backendErrorDetails = result?.errorDetails
    
    // Capture error timestamp from result or create one (but don't update on re-renders)
    const errorTimestamp = result?.timestamp ? 
      new Date(result.timestamp).toLocaleTimeString() : 
      'Unknown time'

    // Use backend error details if available, otherwise parse locally
    const getErrorInfo = () => {
      if (backendErrorDetails) {
        return {
          type: formatErrorType(backendErrorDetails.errorType),
          details: errorMessage,
          suggestions: backendErrorDetails.suggestion ? [backendErrorDetails.suggestion] : [],
          errorCode: backendErrorDetails.errorCode,
          location: backendErrorDetails.location,
          relatedDocs: backendErrorDetails.relatedDocs
        }
      }
      
      // Fallback to client-side parsing for older responses
      return parseErrorMessage(errorMessage)
    }

    const formatErrorType = (errorType) => {
      const typeMap = {
        'SYNTAX_ERROR': 'Q SYNTAX ERROR',
        'TYPE_ERROR': 'DATA TYPE ERROR', 
        'UNDEFINED_VARIABLE': 'UNDEFINED VARIABLE',
        'DIMENSION_ERROR': 'ARRAY DIMENSION ERROR',
        'MEMORY_ERROR': 'MEMORY ERROR',
        'IO_ERROR': 'INPUT/OUTPUT ERROR',
        'CONNECTION_ERROR': 'CONNECTION ERROR',
        'PARSE_ERROR': 'PARSE ERROR',
        'NETWORK_ERROR': 'NETWORK ERROR',
        'SERIALIZATION_ERROR': 'SERIALIZATION ERROR',
        'GENERAL_ERROR': 'GENERAL ERROR'
      }
      return typeMap[errorType] || errorType.replace(/_/g, ' ')
    }

    // Fallback client-side parsing (for backwards compatibility)
    const parseErrorMessage = (message) => {
      if (!message) return { type: 'UNKNOWN ERROR', details: 'NO ERROR DETAILS AVAILABLE', suggestions: [] }
      
      if (message.includes('KDB+') || message.includes('Q KException')) {
        return {
          type: 'Q/KDB+ ERROR',
          details: message,
          suggestions: [
            'CHECK Q SYNTAX AND FUNCTION NAMES',
            'VERIFY VARIABLE NAMES AND TABLE REFS',
            'ENSURE PROPER DATA TYPES'
          ]
        }
      }
      
      if (message.includes('Connection failed') || message.includes('IO error')) {
        return {
          type: 'CONNECTION ERROR',
          details: message,
          suggestions: [
            'CHECK IF Q PROCESS IS RUNNING',
            'VERIFY BACKEND ON PORT 8080',
            'CHECK NETWORK CONNECTIVITY'
          ]
        }
      }
      
      if (message.includes('mouseX') || message.includes('mouseY')) {
        return {
          type: 'LIVE MODE ERROR',
          details: message,
          suggestions: [
            'ENABLE LIVE MODE FOR MOUSE QUERIES',
            'VERIFY MX,MY VARIABLE USAGE'
          ]
        }
      }

      return {
        type: 'ERROR',
        details: message,
        suggestions: ['CHECK QUERY SYNTAX', 'TRY SIMPLER EXPRESSION']
      }
    }

    const errorInfo = getErrorInfo()

    return (
      <div className="space-y-3">
        {/* Error Header */}
        <div className="text-xs font-mono text-console-accent flex items-center space-x-2">
          <span>►</span>
          <span>ERROR REPORT</span>
        </div>
        
        <div className="space-y-3">
          {/* Main Error Display */}
          <div className="border border-console-accent p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-console-accent">
                {errorInfo.type}
              </span>
              <div className="flex items-center space-x-2">
                {errorInfo.errorCode && (
                  <span className="text-console-warning bg-console-dark px-1 border border-console-warning">
                    {errorInfo.errorCode}
                  </span>
                )}
                <span className="text-console-dim">
                  {errorTimestamp}
                </span>
              </div>
            </div>
            
            {errorInfo.location && (
              <div className="text-xs font-mono text-console-warning">
                LOC: {errorInfo.location}
              </div>
            )}
            
            <div className="text-xs font-mono text-console-text bg-console-dark p-2 border border-console-border max-h-24 overflow-y-auto">
              {errorInfo.details}
            </div>
          </div>

          {/* Error Analysis */}
          <div className="grid grid-cols-1 gap-3 text-xs font-mono">
            {/* Suggestions */}
            {errorInfo.suggestions && errorInfo.suggestions.length > 0 && (
              <div className="border border-console-warning p-2">
                <div className="text-console-warning mb-1">SUGGESTIONS:</div>
                <div className="text-console-dim space-y-1">
                  {errorInfo.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start">
                      <span className="mr-1 text-console-warning">•</span>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documentation Link */}
            {errorInfo.relatedDocs && (
              <div className="border border-console-blue p-2">
                <div className="text-console-blue mb-1">DOCUMENTATION:</div>
                <a 
                  href={errorInfo.relatedDocs} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-console-neon hover:text-console-accent underline"
                >
                  VIEW Q DOCS →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="space-y-3">
        <div className="text-xs font-mono text-console-neon flex items-center space-x-2">
          <span>►</span>
          <span>OUTPUT BUFFER</span>
        </div>
        <div className="text-center py-8 text-console-dim">
          <div className="text-2xl mb-2 font-mono">[ EMPTY ]</div>
          <div className="text-xs font-mono">AWAITING QUERY EXECUTION</div>
        </div>
      </div>
    )
  }

  const stats = Array.isArray(result.data) ? calculateArrayStats(result.data) : null

  return (
    <div className="space-y-3">
      {/* Output Header */}
      <div className="text-xs font-mono text-console-neon flex items-center space-x-2">
        <span>►</span>
        <span>QUERY RESULT</span>
        {result.success && (
          <span className="text-console-neon">
            [OK]
          </span>
        )}
      </div>
      
      {/* Array Statistics */}
      {stats && (
        <div className="border border-console-blue p-2">
          <div className="text-xs font-mono text-console-blue mb-1">ARRAY STATS:</div>
          <div className="grid grid-cols-5 gap-2 text-xs font-mono text-console-dim">
            <div>MIN: {stats.min}</div>
            <div>MAX: {stats.max}</div>
            <div>AVG: {stats.avg}</div>
            <div>STD: {stats.stdDev}</div>
            <div>CNT: {stats.count}</div>
          </div>
        </div>
      )}

      {/* Result Data */}
      <div className="bg-console-dark border border-console-border p-3">
        <pre className="text-xs font-mono text-console-text whitespace-pre-wrap overflow-auto max-h-64 leading-relaxed">
          {formatResult(result.data, result.arrayShape, result)}
        </pre>
      </div>
    </div>
  )
}

export default ResultDisplay
