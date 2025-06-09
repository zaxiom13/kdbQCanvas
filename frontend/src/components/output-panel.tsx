import { useState } from 'react';
import { X, Clock, Play } from 'lucide-react';

// Use the actual backend response format instead of ExecutionResultMessage
interface QueryResult {
  success: boolean;
  data?: any;
  error?: string;
  dataType?: string;
  arrayShape?: any;
  errorDetails?: any;
  timestamp?: number;
  executionTime?: number;
  channel?: string;
}

interface QueryHistoryItem {
  query: string;
  result: {
    success: boolean;
    data?: any;
    error?: string;
    dataType?: string;
    executionTime?: number;
  };
  timestamp: string;
  channel?: string;
  isLiveMode?: boolean;
  executionCount?: number;
}

interface OutputPanelProps {
  results: QueryResult[];
  history: QueryHistoryItem[];
  isVisible: boolean;
  onClose: () => void;
  onQuerySelect?: (query: string) => void;
}

export function OutputPanel({ results, history, isVisible, onClose, onQuerySelect }: OutputPanelProps) {
  const [activeTab, setActiveTab] = useState<'output' | 'variables' | 'history' | 'help'>('output');

  // Debug logging
  console.log('OutputPanel render:', { 
    isVisible, 
    resultsLength: results.length, 
    results: results.map(r => ({ 
      success: r.success, 
      dataType: r.dataType, 
      hasData: !!r.data, 
      hasError: !!r.error 
    }))
  });

  if (!isVisible) return null;

  const renderResultData = (result: QueryResult) => {
    if (!result.success) {
      return (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <div className="text-red-800 text-xs font-medium">Error</div>
          <div className="text-red-700 text-xs mt-1">{result.error}</div>
          {result.errorDetails && (
            <div className="text-red-600 text-xs mt-2">
              <div><strong>Type:</strong> {result.errorDetails.errorType}</div>
              {result.errorDetails.suggestion && (
                <div><strong>Suggestion:</strong> {result.errorDetails.suggestion}</div>
              )}
            </div>
          )}
        </div>
      );
    }

    // Handle successful results
    const data = result.data;
    const dataType = result.dataType;

    // Display the raw data based on its type
    if (data === null || data === undefined) {
      return (
        <div className="text-gray-600 text-sm font-mono">
          null
        </div>
      );
    }

    // Handle different data types
    if (Array.isArray(data)) {
      // If it's a table-like structure with columns and rows
      if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
        return (
          <div className="overflow-x-auto">
            <table className="text-xs w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  {Object.keys(data[0]).map((col: string, i: number) => (
                    <th key={i} className="text-left py-2 px-2 font-medium text-gray-700">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row: any, i: number) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                    {Object.values(row).map((cell: any, j: number) => (
                      <td key={j} className="py-1 px-2 text-gray-900">
                        {String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      } else {
        // Simple array display
        return (
          <div className="text-gray-900 font-mono text-sm">
            [{data.map(item => JSON.stringify(item)).join(', ')}]
          </div>
        );
      }
    } else if (typeof data === 'object' && data !== null) {
      // Object display
      return (
        <div className="text-gray-900 font-mono text-sm whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </div>
      );
    } else {
      // Primitive value display
      return (
        <div className="text-gray-900 font-mono text-sm">
          {String(data)}
        </div>
      );
    }
  };

  return (
    <div className="w-96 border-l border-gray-200 flex flex-col bg-white">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('output')}
              className={`px-3 py-1 text-xs rounded border ${
                activeTab === 'output'
                  ? 'bg-white text-gray-700 border-gray-300'
                  : 'text-gray-500 hover:bg-gray-100 border-transparent'
              }`}
            >
              Output
            </button>
            <button
              onClick={() => setActiveTab('variables')}
              className={`px-3 py-1 text-xs rounded border ${
                activeTab === 'variables'
                  ? 'bg-white text-gray-700 border-gray-300'
                  : 'text-gray-500 hover:bg-gray-100 border-transparent'
              }`}
            >
              Variables
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1 text-xs rounded border ${
                activeTab === 'history'
                  ? 'bg-white text-gray-700 border-gray-300'
                  : 'text-gray-500 hover:bg-gray-100 border-transparent'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab('help')}
              className={`px-3 py-1 text-xs rounded border ${
                activeTab === 'help'
                  ? 'bg-white text-gray-700 border-gray-300'
                  : 'text-gray-500 hover:bg-gray-100 border-transparent'
              }`}
            >
              Help
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {activeTab === 'output' && (
          <div className="space-y-3">
            {results.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No output yet. Run some Q code to see results.
              </div>
            ) : (
              results.slice(-10).map((result, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded">
                  <div className="mb-2">
                    {renderResultData(result)}
                  </div>
                  <div className="text-xs text-gray-500 mt-2 flex justify-between">
                    <span>
                      {result.success ? 'Success' : 'Error'} • 
                      Type: {result.dataType || 'unknown'} •
                      Channel: {result.channel || 'standard'}
                    </span>
                    {result.executionTime && (
                      <span>
                        {result.executionTime}ms
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'variables' && (
          <div className="text-center text-gray-500 py-8">
            Variable inspection coming soon...
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                <Clock size={32} className="mx-auto mb-2 opacity-50" />
                <div className="text-sm">No queries yet</div>
                <div className="text-xs">Execute some Q code to build history</div>
              </div>
            ) : (
              history.slice().reverse().map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 hover:bg-gray-100 p-3 rounded cursor-pointer transition-colors group"
                  onClick={() => onQuerySelect && onQuerySelect(item.query)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        item.result.success ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-xs font-mono text-gray-600">
                        {new Date(item.timestamp).toLocaleTimeString('en-US', { 
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                      {item.channel && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          item.channel === 'fast' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {item.channel === 'fast' ? 'WS' : 'HTTP'}
                        </span>
                      )}
                      {item.isLiveMode && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 animate-pulse">
                          LIVE
                        </span>
                      )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play size={12} className="text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="text-sm font-mono text-gray-800 mb-2 overflow-hidden">
                    <div className="truncate">{item.query}</div>
                    {item.query.length > 50 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Click to rerun this query
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {item.result.success ? 'Success' : 'Error'}
                      {item.result.dataType && ` • ${item.result.dataType}`}
                    </span>
                    {item.result.executionTime && (
                      <span>{item.result.executionTime}ms</span>
                    )}
                  </div>
                  
                  {!item.result.success && item.result.error && (
                    <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                      {item.result.error}
                    </div>
                  )}
                </div>
              ))
            )}
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="text-xs text-gray-500 flex items-center justify-between">
                <span>Total: {history.length}</span>
                <span>
                  ✓ {history.filter(h => h.result.success).length} | 
                  ✗ {history.filter(h => !h.result.success).length}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'help' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Q Language Basics</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div><code className="bg-gray-100 px-1 rounded">1 2 3</code> - Create a list</div>
                <div><code className="bg-gray-100 px-1 rounded">sum 1 2 3</code> - Sum function</div>
                <div><code className="bg-gray-100 px-1 rounded">avg 1 2 3</code> - Average function</div>
                <div><code className="bg-gray-100 px-1 rounded">x:5</code> - Variable assignment</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Tables</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div><code className="bg-gray-100 px-1 rounded">t:([]a:1 2;b:3 4)</code> - Create table</div>
                <div><code className="bg-gray-100 px-1 rounded">select from t</code> - Query table</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
