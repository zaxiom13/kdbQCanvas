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
        'SYNTAX_ERROR': 'Q Syntax Error',
        'TYPE_ERROR': 'Data Type Error', 
        'UNDEFINED_VARIABLE': 'Undefined Variable',
        'DIMENSION_ERROR': 'Array Dimension Error',
        'MEMORY_ERROR': 'Memory Error',
        'IO_ERROR': 'Input/Output Error',
        'CONNECTION_ERROR': 'Connection Error',
        'PARSE_ERROR': 'Parse Error',
        'NETWORK_ERROR': 'Network Error',
        'SERIALIZATION_ERROR': 'Serialization Error',
        'GENERAL_ERROR': 'General Error'
      }
      return typeMap[errorType] || errorType.replace(/_/g, ' ')
    }

    // Fallback client-side parsing (for backwards compatibility)
    const parseErrorMessage = (message) => {
      if (!message) return { type: 'Unknown Error', details: 'No error details available', suggestions: [] }
      
      if (message.includes('KDB+') || message.includes('Q KException')) {
        return {
          type: 'Q/KDB+ Error',
          details: message,
          suggestions: [
            'Check Q syntax and function names',
            'Verify variable names and table references',
            'Ensure proper data types and dimensions'
          ]
        }
      }
      
      if (message.includes('Connection failed') || message.includes('IO error')) {
        return {
          type: 'Connection Error',
          details: message,
          suggestions: [
            'Check if the Q process is running',
            'Verify backend server is accessible on port 8080',
            'Check network connectivity'
          ]
        }
      }
      
      if (message.includes('mouseX') || message.includes('mouseY')) {
        return {
          type: 'Live Mode Error',
          details: message,
          suggestions: [
            'Enable live mode for mouse-dependent queries',
            'Ensure mouseX and mouseY variables are used correctly'
          ]
        }
      }

      return {
        type: 'Error',
        details: message,
        suggestions: ['Check query syntax', 'Try a simpler expression']
      }
    }

    const errorInfo = getErrorInfo()

    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
          <span className="text-2xl mr-2">❌</span>
          Query Execution Error
        </h3>
        
        <div className="space-y-4">
          {/* Error Type and Main Details */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-red-800">
                {errorInfo.type}
              </span>
              <div className="flex items-center space-x-2">
                {errorInfo.errorCode && (
                  <span className="text-xs text-red-600 bg-red-200 px-2 py-1 rounded font-mono">
                    {errorInfo.errorCode}
                  </span>
                )}
                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                  {errorType}
                </span>
              </div>
            </div>
            
            {errorInfo.location && (
              <div className="text-sm text-red-700 mb-2">
                <strong>Location:</strong> {errorInfo.location}
              </div>
            )}
            
            <div className="text-sm text-red-600 font-mono bg-red-100 p-3 rounded border max-h-32 overflow-y-auto">
              {errorInfo.details}
            </div>
          </div>

          {/* Horizontal Layout for Help Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Suggestions */}
            {errorInfo.suggestions && errorInfo.suggestions.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
                  <span className="mr-1">💡</span>
                  Suggestions
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {errorInfo.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-yellow-500 flex-shrink-0">•</span>
                      <span className="break-words">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Documentation Link */}
            {errorInfo.relatedDocs && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                  <span className="mr-1">📚</span>
                  Documentation
                </h4>
                <a 
                  href={errorInfo.relatedDocs} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-700 hover:text-blue-900 underline block"
                >
                  View Q Documentation →
                </a>
                <p className="text-xs text-blue-600 mt-2">
                  External reference for this error type
                </p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                <span className="mr-1">🔧</span>
                Quick Actions
              </h4>
              <div className="text-sm text-green-700 space-y-1">
                <div>• Try predefined queries</div>
                <div>• Check Q syntax</div>
                <div>• Use Ctrl+Enter to execute</div>
                {result && !result.success && (
                  <div>• Check browser console</div>
                )}
              </div>
            </div>
          </div>

          {/* Error Timestamp */}
          <div className="text-xs text-gray-500 text-center border-t pt-2">
            Error occurred at {errorTimestamp}
          </div>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">📊</span>
          Result Output
        </h3>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-500">Execute a Q expression to see results here</p>
        </div>
      </div>
    )
  }

  const stats = Array.isArray(result.data) ? calculateArrayStats(result.data) : null

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <span className="text-2xl mr-2">📊</span>
        Result Output
        {result.success && (
          <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
            Success
          </span>
        )}
      </h3>
      
      {stats && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Array Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            <div>
              <span className="text-blue-600 font-medium">Min:</span>
              <span className="ml-1">{stats.min}</span>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Max:</span>
              <span className="ml-1">{stats.max}</span>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Avg:</span>
              <span className="ml-1">{stats.avg}</span>
            </div>
            <div>
              <span className="text-blue-600 font-medium">StdDev:</span>
              <span className="ml-1">{stats.stdDev}</span>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Count:</span>
              <span className="ml-1">{stats.count}</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4 border">
        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono overflow-auto max-h-96">
          {formatResult(result.data, result.arrayShape, result)}
        </pre>
      </div>
    </div>
  )
}

export default ResultDisplay
