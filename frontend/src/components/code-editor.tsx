import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

// Q language keywords and built-in functions
const Q_KEYWORDS = [
  // Control structures
  'if', 'while', 'do', 'select', 'update', 'delete', 'insert', 'exec', 'from', 'where', 'by', 'within',
  // Data types
  'boolean', 'byte', 'short', 'int', 'long', 'real', 'float', 'char', 'symbol', 'timestamp', 'month', 
  'date', 'datetime', 'timespan', 'minute', 'second', 'time',
  // Built-in functions
  'sum', 'avg', 'max', 'min', 'count', 'first', 'last', 'dev', 'var', 'med', 'til', 'type', 'string',
  'distinct', 'group', 'ungroup', 'flip', 'raze', 'enlist', 'reverse', 'rotate', 'sort', 'desc', 'asc',
  'value', 'eval', 'parse', 'show', 'save', 'load', 'get', 'set', 'views', 'tables', 'cols', 'meta',
  'key', 'keys', 'xkey', 'fkey', 'attr', 'iasc', 'idesc', 'rank', 'cross', 'union', 'inter', 'except',
  'lj', 'ij', 'pj', 'uj', 'aj', 'asof', 'wj', 'ej', 'fby', 'xbar', 'wavg', 'wsum', 'wdev', 'wvar',
  'cor', 'cov', 'abs', 'sqrt', 'exp', 'log', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'floor', 'ceiling',
  'signum', 'reciprocal', 'neg', 'null', 'fills', 'deltas', 'ratios', 'differ', 'prev', 'next',
  'rand', 'deal', 'roll', 'each', 'over', 'scan', 'prior', 'peach'
];

const Q_OPERATORS = [
  '+', '-', '*', '%', '!', '&', '|', '^', '=', '<>', '<', '>', '<=', '>=', '~', ',', '#', '_', '$', '?', '@', '.'
];

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  theme?: string;
  height?: string;
  readOnly?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  language = 'q',
  theme = 'vs-dark',
  height = '400px',
  readOnly = false
}: CodeEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Register Q language
      monaco.languages.register({ 
        id: 'q',
        extensions: ['.q', '.k'],
        aliases: ['Q', 'q', 'KDB+', 'kdb+'],
        mimetypes: ['text/x-q']
      });
      
      // Enhanced Q language syntax highlighting
      monaco.languages.setMonarchTokensProvider('q', {
        keywords: Q_KEYWORDS.join('|'),
        operators: Q_OPERATORS,
        symbols: /[=><!~?:&|+\-*\/\^%]+/,
        escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
        
        tokenizer: {
          root: [
            // Comments
            [/\/.*$/, 'comment'],
            [/\\.*$/, 'comment'],
            
            // Symbols (backtick notation)
            [/`[a-zA-Z_][a-zA-Z0-9_]*/, 'symbol'],
            [/`/, 'symbol'],
            
            // Variables with assignment
            [/[a-zA-Z_][a-zA-Z0-9_.]*:/, 'variable.name'],
            
            // Keywords
            [/\b(?:select|update|delete|insert|exec|from|where|by|within|if|while|do)\b/, 'keyword.control'],
            [/\b(@keywords)\b/, 'keyword'],
            
            // Functions
            [/\b[a-zA-Z_][a-zA-Z0-9_]*(?=\[)/, 'function'],
            
            // Numbers
            [/\b\d+[wijbxhfemdnuvpt]?\b/, 'number.int'],
            [/\b\d*\.\d+[fe]?\b/, 'number.float'],
            [/\b0x[0-9a-fA-F]+\b/, 'number.hex'],
            [/\b\d{4}\.\d{2}\.\d{2}[DT]?\d*:\d*:\d*(\.\d*)?/, 'number.date'],
            
            // Strings
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/"/, 'string', '@string_double'],
            
            // Characters
            [/'([^'\\]|\\.)*$/, 'string.invalid'],
            [/'/, 'string', '@string_single'],
            
            // Operators
            [/@symbols/, {
              cases: {
                '@operators': 'operator',
                '@default': ''
              }
            }],
            
            // Brackets and delimiters
            [/[\[\]{}()]/, '@brackets'],
            [/[;,]/, 'delimiter'],
            
            // Whitespace
            { include: '@whitespace' },
            
            // Identifiers
            [/[a-zA-Z_][a-zA-Z0-9_.]*/, 'identifier'],
          ],
          
          string_double: [
            [/[^\\"]+/, 'string'],
            [/@escapes/, 'string.escape'],
            [/\\./, 'string.escape.invalid'],
            [/"/, 'string', '@pop']
          ],
          
          string_single: [
            [/[^\\']+/, 'string'],
            [/@escapes/, 'string.escape'],
            [/\\./, 'string.escape.invalid'],
            [/'/, 'string', '@pop']
          ],
          
          whitespace: [
            [/[ \t\r\n]+/, 'white'],
            [/\/.*$/, 'comment'],
            [/\\.*$/, 'comment'],
          ],
        },
      });

      // Q language configuration for auto-completion and formatting
      monaco.languages.setLanguageConfiguration('q', {
        comments: {
          lineComment: '/'
        },
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')'],
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" },
        ],
        surroundingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" },
        ],
        folding: {
          markers: {
            start: new RegExp('^\\s*//\\s*#?region\\b'),
            end: new RegExp('^\\s*//\\s*#?endregion\\b')
          }
        }
      });

      // Auto-completion provider for Q language
      monaco.languages.registerCompletionItemProvider('q', {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          };

          const suggestions = [
            // Keywords
            ...Q_KEYWORDS.map(keyword => ({
              label: keyword,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: keyword,
              range: range,
              documentation: `Q keyword: ${keyword}`
            })),
            
            // Common Q expressions
            {
              label: 'select',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'select ${1:columns} from ${2:table}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range: range,
              documentation: 'Select statement template'
            },
            {
              label: 'update',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'update ${1:column}:${2:value} from ${3:table}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range: range,
              documentation: 'Update statement template'
            },
            {
              label: 'table',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: '([] ${1:col1}:${2:data1}; ${3:col2}:${4:data2})',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range: range,
              documentation: 'Table constructor template'
            }
          ];

          return { suggestions };
        }
      });

      // Hover provider for Q language
      monaco.languages.registerHoverProvider('q', {
        provideHover: (model, position) => {
          const word = model.getWordAtPosition(position);
          if (!word) return;
          
          const qDocs: Record<string, string> = {
            'select': 'Extract data from tables with optional filtering and grouping',
            'sum': 'Sum of numeric values',
            'avg': 'Average of numeric values',
            'count': 'Count number of items',
            'til': 'Generate range from 0 to n-1',
            'show': 'Display value and return it',
            'flip': 'Transpose matrix or convert between column and row format',
            'each': 'Apply function to each element',
            'over': 'Accumulate function over list',
            'scan': 'Progressive accumulation of function over list'
          };
          
          if (word.word in qDocs) {
            return {
              range: new monaco.Range(
                position.lineNumber,
                word.startColumn,
                position.lineNumber,
                word.endColumn
              ),
              contents: [
                { value: `**${word.word}**` },
                { value: qDocs[word.word] }
              ]
            };
          }
        }
      });

      // Create editor with enhanced settings
      editorRef.current = monaco.editor.create(containerRef.current, {
        value: value || '',
        language: 'q',
        theme,
        readOnly,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        glyphMargin: false,
        folding: true,
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 3,
        fontSize: 14,
        fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
        automaticLayout: true,
        tabSize: 2,
        insertSpaces: true,
        detectIndentation: false,
        formatOnPaste: true,
        formatOnType: true,
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: 'on',
        wordWrap: 'on',
        wordWrapColumn: 120,
        // Enhanced editing features
        quickSuggestions: {
          other: true,
          comments: false,
          strings: false
        },
        parameterHints: {
          enabled: true
        },
        suggestSelection: 'first',
        tabCompletion: 'on',
        // Custom Q-specific settings
        bracketPairColorization: {
          enabled: true
        }
      });

      // Listen for changes
      const disposable = editorRef.current.onDidChangeModelContent(() => {
        const newValue = editorRef.current?.getValue() || '';
        if (onChange) {
          onChange(newValue);
        }
      });

      // Custom key bindings for Q-specific actions
      editorRef.current.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        // Trigger execution when Ctrl+Enter is pressed
        const executeEvent = new CustomEvent('q-execute', {
          detail: { code: editorRef.current?.getValue() }
        });
        window.dispatchEvent(executeEvent);
      });

      return () => {
        disposable?.dispose();
        editorRef.current?.dispose();
      };
    }
  }, []);

  // Update editor value when prop changes
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      const model = editorRef.current.getModel();
      if (model) {
        model.setValue(value || '');
      }
    }
  }, [value]);

  // Update theme when prop changes
  useEffect(() => {
    if (editorRef.current) {
      monaco.editor.setTheme(theme);
    }
  }, [theme]);

  return (
    <div 
      ref={containerRef} 
      style={{ height }} 
      className="border border-gray-700 rounded-md overflow-hidden"
    />
  );
}
