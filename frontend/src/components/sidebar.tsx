import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { CodeExample } from '@shared/schema';
import { getDifficultyColor, getDifficultyLabel, formatCode } from '@/lib/examples';

interface SidebarProps {
  onExampleSelect: (example: CodeExample) => void;
}

export function Sidebar({ onExampleSelect }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'examples' | 'tutorials' | 'reference'>('examples');

  const { data: examples = [], isLoading } = useQuery({
    queryKey: ['/api/examples'],
  });

  const { data: categoryExamples = [] } = useQuery({
    queryKey: ['/api/examples', activeTab],
  });

  const displayExamples = activeTab === 'examples' 
    ? examples.filter((e: CodeExample) => e.category === 'examples')
    : categoryExamples;

  if (isLoading) {
    return (
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-3"></div>
            <div className="flex space-x-1">
              <div className="h-8 bg-gray-300 rounded flex-1"></div>
              <div className="h-8 bg-gray-300 rounded flex-1"></div>
              <div className="h-8 bg-gray-300 rounded flex-1"></div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Learning Path</h2>
          <button className="text-xs text-blue-600 hover:text-blue-700">View All</button>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('examples')}
            className={`px-3 py-1.5 text-xs rounded-md ${
              activeTab === 'examples'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Examples
          </button>
          <button
            onClick={() => setActiveTab('tutorials')}
            className={`px-3 py-1.5 text-xs rounded-md ${
              activeTab === 'tutorials'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tutorials
          </button>
          <button
            onClick={() => setActiveTab('reference')}
            className={`px-3 py-1.5 text-xs rounded-md ${
              activeTab === 'reference'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Reference
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {displayExamples.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            No {activeTab} available
          </div>
        ) : (
          displayExamples.map((example: CodeExample) => (
            <div
              key={example.id}
              className="mb-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => onExampleSelect(example)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm text-gray-900">{example.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded ${getDifficultyColor(example.difficulty)}`}>
                  {getDifficultyLabel(example.difficulty)}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-2">{example.description}</p>
              <code className="text-xs font-mono text-gray-700 bg-white px-2 py-1 rounded">
                {formatCode(example.code)}
              </code>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
