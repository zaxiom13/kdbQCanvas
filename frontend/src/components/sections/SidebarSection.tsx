import React from 'react'
import ResultDisplay from '../result/ResultDisplay'
import QueryHistory from '../history/QueryHistory'
import ConnectionStatus from '../status/ConnectionStatus'

const SidebarSection = ({ 
  result, 
  error, 
  history, 
  setQuery, 
  connectionStatus 
}) => {
  return (
    <div className="space-y-6">
      <ConnectionStatus 
        connectionStatus={connectionStatus}
      />
      
      <ResultDisplay 
        result={result}
        error={error}
      />
      
      <QueryHistory 
        history={history}
        setQuery={setQuery}
      />
    </div>
  )
}

export default SidebarSection
