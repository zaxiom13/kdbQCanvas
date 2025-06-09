import { useState, useRef, useEffect } from 'react';
import { Play, Settings, BookOpen, Lightbulb, BarChart3, Terminal } from 'lucide-react';
import { DualCodeEditor } from '../components/dual-code-editor';
import { LearningExamples, type LearningExample } from '../components/LearningExamples';
import { OutputPanel } from '../components/output-panel';
import { StatusBar } from '../components/status-bar';
import { InteractiveCanvas } from '../components/interactive-canvas';
// @ts-ignore - JS hook will be fixed later
import { useQQueryInterface } from '../hooks/useQQueryInterface';

export default function Console() {
  const canvasRef = useRef(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentLesson, setCurrentLesson] = useState('basics');
  
  // Separate state for variables and query
  const [variablesCode, setVariablesCode] = useState('');
  const [queryCode, setQueryCode] = useState('');
  
  const {
    query: code,
    setQuery: setCode,
    loading: isExecuting,
    error,
    setError,
    result,
    history,
    connectionStatus,
    isLiveMode,
    mousePos,
    showSettings,
    setShowSettings,
    canvasSize,
    setCanvasSize,
    liveModeForever,
    setLiveModeForever,
    channelStatus,
    communicationManager,
    executeQuery,
    toggleLiveMode
  } = useQQueryInterface(canvasRef);

  const [outputVisible, setOutputVisible] = useState(true);
  const [executionTime, setExecutionTime] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState('0MB');

  // Connection status derived from channel status
  const isConnected = channelStatus.standard || channelStatus.fast;

  const handleRunCode = () => {
    if (!queryCode.trim()) return;
    // Combine variables and query for execution
    const fullCode = variablesCode ? `${variablesCode}\n${queryCode}` : queryCode;
    setCode(fullCode);
    executeQuery();
  };

  const handleHistoryQuerySelect = (query: string) => {
    // Split the query into variable declarations and actual query
    const lines = query.split('\n');
    const variableLines: string[] = [];
    const queryLines: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (trimmedLine === '' || trimmedLine.startsWith('/')) {
        continue;
      }
      
      // If line ends with semicolon, it's a variable declaration
      if (trimmedLine.endsWith(';')) {
        variableLines.push(line);
      } else {
        // Otherwise, it's part of the query
        queryLines.push(line);
      }
    }
    
    // Set the separated code in their respective editors
    setVariablesCode(variableLines.join('\n'));
    setQueryCode(queryLines.join('\n'));
    setCode(query); // Keep the original full query for backwards compatibility
  };

  const handleDualExecute = (variables: string, query: string) => {
    // Combine variables and query for execution
    const fullCode = variables ? `${variables}\n${query}` : query;
    setCode(fullCode);
    executeQuery();
  };

  const handleExampleSelect = (example: LearningExample) => {
    // Parse example code to separate variables and query
    const lines = example.code.split('\n');
    const variableLines: string[] = [];
    const queryLines: string[] = [];
    
    let inVariables = true;
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine === '' || trimmedLine.startsWith('/')) {
        continue; // Skip empty lines and comments
      }
      
      // If line ends with semicolon and contains assignment, it's a variable
      if (trimmedLine.endsWith(';') && trimmedLine.includes(':')) {
        variableLines.push(line);
      } else {
        inVariables = false;
        queryLines.push(line);
      }
    }
    
    setVariablesCode(variableLines.join('\n'));
    setQueryCode(queryLines.join('\n'));
    setCurrentLesson(example.category);
  };

  // Handle Ctrl+Enter keyboard shortcut from Monaco editor
  useEffect(() => {
    const handleExecuteShortcut = (event: CustomEvent) => {
      handleDualExecute(variablesCode, queryCode);
    };

    window.addEventListener('q-execute', handleExecuteShortcut as EventListener);
    
    return () => {
      window.removeEventListener('q-execute', handleExecuteShortcut as EventListener);
    };
  }, [variablesCode, queryCode]);

  // Debug logging for result changes
  useEffect(() => {
    console.log('Console result changed:', result);
  }, [result]);

  // Get visualizations from result
  const getLatestVisualizations = () => {
    if (!result || !(result as any).success) return [];
    
    // Convert Q result to visualizations
    const visualizations = [];
    
    if ((result as any).dataType === 'table' && (result as any).data) {
      visualizations.push({
        type: 'table' as const,
        data: (result as any).data
      });
    }
    
    if (Array.isArray((result as any).data) && (result as any).data.length > 0) {
      // Create chart visualization for numeric arrays
      const numericData = (result as any).data.filter((x: any) => typeof x === 'number');
      if (numericData.length > 0) {
        visualizations.push({
          type: 'chart' as const,
          data: {
            values: numericData,
            labels: numericData.map((_: any, i: number) => `Item ${i + 1}`)
          }
        });
      }
    }
    
    return visualizations;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <BookOpen className="text-white" size={16} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Q/KDB+ Learning Platform</h1>
            <p className="text-xs text-gray-500">Interactive Array Programming Tutorial</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className={`w-2 h-2 rounded-full ${channelStatus.standard ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div className={`w-2 h-2 rounded-full ${channelStatus.fast ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            </div>
            <span className="text-xs text-gray-600">
              {isConnected ? 'Backend Connected' : 'Backend Disconnected'}
            </span>
            {isLiveMode && (
              <span className="text-xs text-orange-600 animate-pulse font-semibold">
                LIVE MODE
              </span>
            )}
          </div>
          <button
            onClick={() => setShowTutorial(true)}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-1"
          >
            <Lightbulb size={12} />
            <span>Tutorial</span>
          </button>
          <button
            onClick={toggleLiveMode}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center space-x-1 ${
              isLiveMode 
                ? 'bg-orange-600 text-white hover:bg-orange-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <Terminal size={12} />
            <span>{isLiveMode ? 'Stop Live' : 'Live Mode'}</span>
          </button>
          <button
            onClick={() => handleDualExecute(variablesCode, queryCode)}
            disabled={isExecuting}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={12} />
            <span>{isExecuting ? 'Running...' : 'Run Code'}</span>
          </button>

          <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Learning Examples Sidebar */}
        <LearningExamples onExampleSelect={handleExampleSelect} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Code Editor */}
          <div className="flex-1 flex">
            <div className="flex-1 flex flex-col">
              <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-gray-300 text-sm font-mono">lesson_{currentLesson}.q</span>
                  {isLiveMode && <span className="text-orange-400 text-xs animate-pulse">● LIVE</span>}
                </div>
                <div className="flex items-center space-x-2 text-gray-400 text-xs">
                  <span>q/kdb+</span>
                  {result && (result as any).executionTime && (
                    <span>{(result as any).executionTime}ms</span>
                  )}
                </div>
              </div>
              
              <DualCodeEditor
                variablesCode={variablesCode}
                queryCode={queryCode}
                onVariablesChange={setVariablesCode}
                onQueryChange={setQueryCode}
                onExecute={handleDualExecute}
                isExecuting={isExecuting}
                theme="vs-dark"
              />
            </div>

            {/* Output Panel */}
            <OutputPanel
              results={result ? [result] : []}
              history={history}
              isVisible={outputVisible}
              onClose={() => setOutputVisible(false)}
              onQuerySelect={handleHistoryQuerySelect}
            />
          </div>

          {/* Interactive Canvas */}
          <InteractiveCanvas 
            visualizations={getLatestVisualizations()}
          />

          {/* Learning Progress Panel */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">
                  Current Lesson: <span className="font-semibold text-blue-600">{currentLesson}</span>
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-500">
                    Queries: {history.length} • 
                    Channel: {result ? (result as any).channel || 'standard' : 'none'}
                  </span>
                </div>
                {mousePos && (
                  <span className="text-gray-500 font-mono text-xs">
                    mouseX:{mousePos.x} mouseY:{mousePos.y}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setOutputVisible(!outputVisible)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {outputVisible ? 'Hide Output' : 'Show Output'}
                </button>

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Canvas Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        isConnected={isConnected}
        executionTime={(result as any)?.executionTime || 0}
        memoryUsage={memoryUsage}
        onHelpClick={() => setShowTutorial(true)}
      />

      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Lightbulb className="mr-2" size={20} />
              Q/KDB+ Learning Guide
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold">Getting Started:</h3>
                <p>1. Choose a lesson from the sidebar</p>
                <p>2. Read the code examples and comments</p>
                <p>3. Click "Run Code" to execute and see results</p>
                <p>4. Experiment by modifying the code</p>
              </div>
              <div>
                <h3 className="font-semibold">Q/KDB+ Basics:</h3>
                <p>• Q is an array programming language</p>
                <p>• Operations work on entire arrays at once</p>
                <p>• Tables are first-class data structures</p>
                <p>• Syntax is concise and expressive</p>
              </div>
              <div>
                <h3 className="font-semibold">Dual-Band Connection:</h3>
                <p>• Green dot = HTTP connection (standard queries)</p>
                <p>• Blue dot = WebSocket connection (fast/live queries)</p>
                <p>• Live Mode uses fast channel for real-time interaction</p>
                <p>• Mouse coordinates auto-update in live mode</p>
              </div>
              <div>
                <h3 className="font-semibold">Interactive Features:</h3>
                <p>• Canvas shows visualizations of Q data</p>
                <p>• Mouse position available as mouseX/mouseY variables</p>
                <p>• Charts auto-generate from numeric Q results</p>
                <p>• Export visualizations as PNG images</p>
              </div>
            </div>
            <button
              onClick={() => setShowTutorial(false)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 