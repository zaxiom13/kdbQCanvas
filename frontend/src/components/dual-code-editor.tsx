import { useEffect, useRef, useState } from 'react';
import * as monaco from 'monaco-editor';
import { AlertCircle, CheckCircle, Settings, Play } from 'lucide-react';

interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

interface DualCodeEditorProps {
  variablesCode: string;
  queryCode: string;
  onVariablesChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  onExecute: (variables: string, query: string) => void;
  isExecuting?: boolean;
  theme?: string;
}

export function DualCodeEditor({
  variablesCode,
  queryCode,
  onVariablesChange,
  onQueryChange,
  onExecute,
  isExecuting = false,
  theme = 'vs-dark'
}: DualCodeEditorProps) {
  const variablesEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const queryEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const variablesContainerRef = useRef<HTMLDivElement>(null);
  const queryContainerRef = useRef<HTMLDivElement>(null);
  
  const [variablesValidation, setVariablesValidation] = useState<ValidationResult>({ isValid: true, warnings: [], errors: [] });
  const [queryValidation, setQueryValidation] = useState<ValidationResult>({ isValid: true, warnings: [], errors: [] });
  const [isVariablesCollapsed, setIsVariablesCollapsed] = useState(false);

  // Validation functions
  const validateVariables = (code: string): ValidationResult => {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    if (!code.trim()) {
      return { isValid: true, warnings: [], errors: [] };
    }
    
    const lines = code.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if line ends with semicolon
      if (!line.endsWith(';')) {
        errors.push(`Line ${i + 1}: Variable declarations must end with semicolon (;)`);
      }
      
      // Check if line contains assignment (variable declaration)
      if (!line.includes(':') || line.indexOf(':') === line.length - 1) {
        warnings.push(`Line ${i + 1}: Expected variable assignment (varName:value;)`);
      }
      
      // Check for multiple statements on one line
      const statements = line.split(';').filter(s => s.trim().length > 0);
      if (statements.length > 1) {
        warnings.push(`Line ${i + 1}: Multiple statements on one line - consider separating`);
      }
      
      // Check for potential Q syntax issues
      if (line.includes('select') || line.includes('update') || line.includes('delete')) {
        warnings.push(`Line ${i + 1}: Query statements should be in the Query area, not Variables`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  };

  const validateQuery = (code: string): ValidationResult => {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    if (!code.trim()) {
      errors.push('Query cannot be empty');
      return { isValid: false, warnings, errors };
    }
    
    const trimmedCode = code.trim();
    
    // Check for multiple statements (should only return one output)
    const statements = trimmedCode.split(';').filter(s => s.trim().length > 0);
    if (statements.length > 1) {
      errors.push('Query must contain only one statement that returns a single output');
    }
    
    // Check if query ends with semicolon (it shouldn't for single queries)
    if (trimmedCode.endsWith(';')) {
      warnings.push('Query should not end with semicolon for single output');
    }
    
    // Check for variable assignments in query (should be in variables area)
    if (trimmedCode.includes(':') && !trimmedCode.includes('select') && !trimmedCode.includes('update')) {
      warnings.push('Variable assignments should be in the Variables area above');
    }
    
    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  };

  // Handle execute button click
  const handleExecute = () => {
    const varsValid = validateVariables(variablesCode);
    const queryValid = validateQuery(queryCode);
    
    setVariablesValidation(varsValid);
    setQueryValidation(queryValid);
    
    if (varsValid.isValid && queryValid.isValid) {
      onExecute(variablesCode, queryCode);
    }
  };

  // Initialize Monaco editors
  useEffect(() => {
    if (!variablesContainerRef.current || !queryContainerRef.current) return;

    // Register Q language
    monaco.languages.register({ 
      id: 'q',
      extensions: ['.q', '.k'],
      aliases: ['Q', 'q', 'KDB+', 'kdb+'],
      mimetypes: ['text/x-q']
    });
    
    // Q language syntax highlighting
    monaco.languages.setMonarchTokensProvider('q', {
      tokenizer: {
        root: [
          [/\/.*$/, 'comment'],
          [/\\.*$/, 'comment'],
          [/`[a-zA-Z_][a-zA-Z0-9_]*/, 'symbol'],
          [/[a-zA-Z_][a-zA-Z0-9_.]*:/, 'variable.name'],
          [/\b(?:select|update|delete|insert|exec|from|where|by|within|if|while|do|sum|avg|max|min|count|til|show)\b/, 'keyword'],
          [/\b\d+[wijbxhfemdnuvpt]?\b/, 'number'],
          [/\b\d*\.\d+[fe]?\b/, 'number.float'],
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@string_double'],
          [/'([^'\\]|\\.)*$/, 'string.invalid'],
          [/'/, 'string', '@string_single'],
          [/[+\-*%!&|^=<>~,#_$?@.]/, 'operator'],
          [/[\[\]{}()]/, '@brackets'],
          [/[;,]/, 'delimiter'],
          [/[ \t\r\n]+/, 'white'],
          [/[a-zA-Z_][a-zA-Z0-9_.]*/, 'identifier'],
        ],
        
        string_double: [
          [/[^\\"]+/, 'string'],
          [/"/, 'string', '@pop']
        ],
        
        string_single: [
          [/[^\\']+/, 'string'],
          [/'/, 'string', '@pop']
        ],
      },
    });

    monaco.languages.setLanguageConfiguration('q', {
      comments: { lineComment: '/' },
      brackets: [['{', '}'], ['[', ']'], ['(', ')']],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
    });

    // Create Variables Editor
    variablesEditorRef.current = monaco.editor.create(variablesContainerRef.current, {
      value: variablesCode || '',
      language: 'q',
      theme,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      lineNumbers: 'on',
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
      automaticLayout: true,
      tabSize: 2,
      wordWrap: 'on',
    });

    // Create Query Editor
    queryEditorRef.current = monaco.editor.create(queryContainerRef.current, {
      value: queryCode || '',
      language: 'q',
      theme,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      lineNumbers: 'on',
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
      automaticLayout: true,
      tabSize: 2,
      wordWrap: 'on',
    });

    // Listen for changes
    const variablesDisposable = variablesEditorRef.current.onDidChangeModelContent(() => {
      const newValue = variablesEditorRef.current?.getValue() || '';
      onVariablesChange(newValue);
      setVariablesValidation(validateVariables(newValue));
    });

    const queryDisposable = queryEditorRef.current.onDidChangeModelContent(() => {
      const newValue = queryEditorRef.current?.getValue() || '';
      onQueryChange(newValue);
      setQueryValidation(validateQuery(newValue));
    });

    // Add execute shortcut (Ctrl+Enter)
    variablesEditorRef.current.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, handleExecute);
    queryEditorRef.current.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, handleExecute);

    return () => {
      variablesDisposable?.dispose();
      queryDisposable?.dispose();
      variablesEditorRef.current?.dispose();
      queryEditorRef.current?.dispose();
    };
  }, []);

  // Update editor values when props change
  useEffect(() => {
    if (variablesEditorRef.current && variablesCode !== variablesEditorRef.current.getValue()) {
      const model = variablesEditorRef.current.getModel();
      if (model) {
        model.setValue(variablesCode || '');
      }
    }
  }, [variablesCode]);

  useEffect(() => {
    if (queryEditorRef.current && queryCode !== queryEditorRef.current.getValue()) {
      const model = queryEditorRef.current.getModel();
      if (model) {
        model.setValue(queryCode || '');
      }
    }
  }, [queryCode]);

  // Update theme when prop changes
  useEffect(() => {
    if (variablesEditorRef.current && queryEditorRef.current) {
      monaco.editor.setTheme(theme);
    }
  }, [theme]);

  // Validate on mount
  useEffect(() => {
    setVariablesValidation(validateVariables(variablesCode));
    setQueryValidation(validateQuery(queryCode));
  }, []);

  return (
    <div className="flex flex-col h-full border border-gray-700 rounded-md overflow-hidden">
      {/* Variables Section */}
      <div className={`flex flex-col transition-all duration-300 ${isVariablesCollapsed ? 'h-10' : 'h-64'}`}>
        <div className="bg-gray-800 px-3 py-2 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Settings className="text-blue-400" size={16} />
            <span className="text-gray-300 text-sm font-medium">Variables Declaration</span>
            <span className="text-xs text-gray-500">(all lines must end with ;)</span>
          </div>
          <button
            onClick={() => setIsVariablesCollapsed(!isVariablesCollapsed)}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            {isVariablesCollapsed ? '▼' : '▲'}
          </button>
        </div>
        
        {!isVariablesCollapsed && (
          <>
            <div className="px-3 py-2 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                {variablesValidation.isValid ? (
                  <CheckCircle className="text-green-500" size={16} />
                ) : (
                  <AlertCircle className="text-red-500" size={16} />
                )}
                <span className="text-gray-300 text-sm">Variables Status</span>
                {variablesValidation.errors.length > 0 && (
                  <span className="text-red-400 text-xs">{variablesValidation.errors.length} errors</span>
                )}
                {variablesValidation.warnings.length > 0 && (
                  <span className="text-yellow-400 text-xs">{variablesValidation.warnings.length} warnings</span>
                )}
              </div>
              
              {(variablesValidation.errors.length > 0 || variablesValidation.warnings.length > 0) && (
                <div className="mt-2 space-y-1">
                  {variablesValidation.errors.map((error, i) => (
                    <div key={i} className="text-red-400 text-xs flex items-start">
                      <AlertCircle size={12} className="mt-0.5 mr-1 flex-shrink-0" />
                      {error}
                    </div>
                  ))}
                  {variablesValidation.warnings.map((warning, i) => (
                    <div key={i} className="text-yellow-400 text-xs flex items-start">
                      <AlertCircle size={12} className="mt-0.5 mr-1 flex-shrink-0" />
                      {warning}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div ref={variablesContainerRef} className="flex-1 min-h-0" />
          </>
        )}
      </div>

      {/* Query Section */}
      <div className="flex flex-col flex-1">
        <div className="bg-gray-800 px-3 py-2 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Play className="text-green-400" size={16} />
            <span className="text-gray-300 text-sm font-medium">Query Execution</span>
            <span className="text-xs text-gray-500">(single output only)</span>
          </div>
          <button
            onClick={handleExecute}
            disabled={isExecuting || !variablesValidation.isValid || !queryValidation.isValid}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <Play size={12} />
            <span>{isExecuting ? 'Running...' : 'Execute'}</span>
          </button>
        </div>
        
        <div className="px-3 py-2 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            {queryValidation.isValid ? (
              <CheckCircle className="text-green-500" size={16} />
            ) : (
              <AlertCircle className="text-red-500" size={16} />
            )}
            <span className="text-gray-300 text-sm">Query Status</span>
            {queryValidation.errors.length > 0 && (
              <span className="text-red-400 text-xs">{queryValidation.errors.length} errors</span>
            )}
            {queryValidation.warnings.length > 0 && (
              <span className="text-yellow-400 text-xs">{queryValidation.warnings.length} warnings</span>
            )}
          </div>
          
          {(queryValidation.errors.length > 0 || queryValidation.warnings.length > 0) && (
            <div className="mt-2 space-y-1">
              {queryValidation.errors.map((error, i) => (
                <div key={i} className="text-red-400 text-xs flex items-start">
                  <AlertCircle size={12} className="mt-0.5 mr-1 flex-shrink-0" />
                  {error}
                </div>
              ))}
              {queryValidation.warnings.map((warning, i) => (
                <div key={i} className="text-yellow-400 text-xs flex items-start">
                  <AlertCircle size={12} className="mt-0.5 mr-1 flex-shrink-0" />
                  {warning}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div ref={queryContainerRef} className="flex-1 min-h-0" />
      </div>
    </div>
  );
} 