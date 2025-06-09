import { useState } from 'react';

export interface LearningExample {
  id: string;
  title: string;
  description: string;
  code: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

const learningExamples: LearningExample[] = [
  {
    id: 'basics-1',
    title: 'Basic Arithmetic',
    description: 'Simple arithmetic operations in Q',
    difficulty: 'beginner',
    category: 'basics',
    code: `// Basic arithmetic in Q
1 + 2
3 * 4
10 % 3
2 xexp 8  // 2 to the power of 8`
  },
  {
    id: 'basics-2',
    title: 'Working with Lists',
    description: 'Creating and manipulating lists',
    difficulty: 'beginner',
    category: 'basics',
    code: `numbers: 1 2 3 4 5;
names: \`alice\`bob\`charlie;
sum numbers`
  },
  {
    id: 'basics-3',
    title: 'Array Operations',
    description: 'Array manipulation and functions',
    difficulty: 'beginner',
    category: 'basics',
    code: `data: 1 2 3 4 5 6 7 8 9 10;
asc data`
  },
  {
    id: 'tables-1',
    title: 'Simple Table',
    description: 'Creating your first table',
    difficulty: 'beginner',
    category: 'tables',
    code: `trades:([] symbol:\`AAPL\`GOOGL\`MSFT\`TSLA; price:150.5 2800.0 300.0 900.0; quantity:100 50 200 75);
trades`
  },
  {
    id: 'tables-2',
    title: 'Table Queries',
    description: 'Selecting and filtering table data',
    difficulty: 'intermediate',
    category: 'tables',
    code: `trades:([] symbol:\`AAPL\`GOOGL\`MSFT\`TSLA; price:150.5 2800.0 300.0 900.0; quantity:100 50 200 75);
select from trades where price > 500`
  },
  {
    id: 'aggregation-1',
    title: 'Aggregations',
    description: 'Grouping and aggregating data',
    difficulty: 'intermediate',
    category: 'aggregation',
    code: `// Sample sales data
sales:([]
  region:\`North\`South\`North\`East\`South\`West;
  product:\`A\`B\`A\`C\`B\`A;
  amount:100 150 120 90 200 80)

// Aggregate by region
select total:sum amount by region from sales

// Multiple aggregations
select total:sum amount, avg_amount:avg amount by region from sales`
  },
  {
    id: 'timeseries-1',
    title: 'Time Series',
    description: 'Working with time-based data',
    difficulty: 'advanced',
    category: 'timeseries',
    code: `// Create time series data
times: 2024.01.01 + til 10
prices: 100 + 10 * sin 0.1 * til 10

// Time series table
ts:([]time:times; price:prices)

// Time-based operations
select from ts where time > 2024.01.05`
  }
];

interface LearningExamplesProps {
  onExampleSelect: (example: LearningExample) => void;
}

export function LearningExamples({ onExampleSelect }: LearningExamplesProps) {
  const [activeTab, setActiveTab] = useState<string>('basics');

  const filteredExamples = learningExamples.filter(example => 
    example.category === activeTab
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = ['basics', 'tables', 'aggregation', 'timeseries'];

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Q/KDB+ Learning</h2>
        </div>
        <div className="flex flex-wrap gap-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`px-3 py-1.5 text-xs rounded-md capitalize ${
                activeTab === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {filteredExamples.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            No examples in {activeTab}
          </div>
        ) : (
          filteredExamples.map((example) => (
            <div
              key={example.id}
              className="mb-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => onExampleSelect(example)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm text-gray-900">{example.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded ${getDifficultyColor(example.difficulty)}`}>
                  {example.difficulty}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-2">{example.description}</p>
              <code className="text-xs font-mono text-gray-700 bg-white px-2 py-1 rounded block">
                {example.code.split('\n')[0]}...
              </code>
            </div>
          ))
        )}
      </div>
    </aside>
  );
} 