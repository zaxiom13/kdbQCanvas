import React from 'react'
import QueryEditor from '../editor/QueryEditor'
import PredefinedQueries from '../editor/PredefinedQueries'

const EditorSection = ({ 
  query, 
  setQuery, 
  loading, 
  executeQuery, 
  isLiveMode,
  toggleLiveMode 
}) => {
  return (
    <div className="space-y-6">
      <QueryEditor 
        query={query}
        setQuery={setQuery}
        loading={loading}
        executeQuery={executeQuery}
        isLiveMode={isLiveMode}
        toggleLiveMode={toggleLiveMode}
      />
      
      <PredefinedQueries 
        setQuery={setQuery}
      />
    </div>
  )
}

export default EditorSection
