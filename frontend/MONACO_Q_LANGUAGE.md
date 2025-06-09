# Monaco Editor Q Language Support

This document describes the Monaco Editor integration with Q/KDB+ language support in the kdbQCanvas application.

## Features

### 1. Enhanced Syntax Highlighting
- **Comments**: Line comments with `/` and `\`
- **Keywords**: Full Q language keyword support including:
  - Control structures: `select`, `update`, `delete`, `insert`, `exec`, `from`, `where`, `by`, `within`, `if`, `while`, `do`
  - Functions: `sum`, `avg`, `max`, `min`, `count`, `first`, `last`, `til`, `show`, `flip`, etc.
  - Data types: `boolean`, `byte`, `short`, `int`, `long`, `real`, `float`, `char`, `symbol`, `timestamp`, etc.
- **Symbols**: Backtick notation (`symbol`) highlighting
- **Numbers**: Support for Q number formats including typed literals (e.g., `100i`, `3.14f`, `2023.01.01`)
- **Strings**: Double and single quoted strings with escape sequences
- **Operators**: All Q operators with proper highlighting
- **Variables**: Assignment highlighting for variable definitions

### 2. Auto-completion
- **Keyword completion**: All Q keywords available via Ctrl+Space
- **Snippet templates**: Pre-built templates for common Q patterns:
  - `select` -> `select ${1:columns} from ${2:table}`
  - `update` -> `update ${1:column}:${2:value} from ${3:table}`
  - `table` -> `([] ${1:col1}:${2:data1}; ${3:col2}:${4:data2})`

### 3. Hover Documentation
Hover over Q functions to see inline documentation:
- `select`: Extract data from tables with optional filtering and grouping
- `sum`: Sum of numeric values
- `avg`: Average of numeric values
- `count`: Count number of items
- `til`: Generate range from 0 to n-1
- `show`: Display value and return it
- `flip`: Transpose matrix or convert between column and row format
- `each`: Apply function to each element
- `over`: Accumulate function over list
- `scan`: Progressive accumulation of function over list

### 4. Editor Configuration
- **Font**: JetBrains Mono, Fira Code, Consolas fallback
- **Theme**: Dark theme optimized for Q code
- **Auto-formatting**: Format on paste and type
- **Bracket matching**: Colored bracket pairs
- **Word wrap**: Enabled with 120 character limit
- **Tab settings**: 2 spaces, no hard tabs

### 5. Keyboard Shortcuts
- **Ctrl+Enter**: Execute current Q code
- **Ctrl+Space**: Trigger auto-completion
- **Tab**: Accept suggestion and snippet navigation

## Language Registration

The Q language is registered with Monaco Editor with:
- **Language ID**: `q`
- **File extensions**: `.q`, `.k`
- **Aliases**: `Q`, `q`, `KDB+`, `kdb+`
- **MIME types**: `text/x-q`

## Code Structure

### Main Editor Component
Location: `frontend/src/components/code-editor.tsx`

Key features:
- Language registration and configuration
- Syntax highlighting with Monarch tokenizer
- Auto-completion provider
- Hover provider for documentation
- Custom key binding for execution

### Integration Points
1. **Console Component**: `frontend/src/pages/Console.tsx`
   - Handles Ctrl+Enter execution shortcut
   - Manages editor state and code execution

2. **Q Language Keywords**: Comprehensive list of Q/KDB+ functions and operators

3. **TypeScript Support**: Full TypeScript integration with proper typing

## Testing

### Development Testing
1. Start the frontend development server: `npm run dev`
2. Navigate to the console page
3. Test features:
   - Type Q keywords and verify syntax highlighting
   - Use Ctrl+Space for auto-completion
   - Hover over functions for documentation
   - Use Ctrl+Enter to execute code

### Standalone Testing
Open `frontend/src/test/q-language-test.html` in a browser to test Monaco Editor Q language support independently.

Test samples included:
- Basic operations
- Table operations  
- Select queries
- Functions and operators
- Date/time operations
- Advanced features

## Customization

### Adding New Keywords
Add to the `Q_KEYWORDS` array in `code-editor.tsx`:
```typescript
const Q_KEYWORDS = [
  // ... existing keywords
  'newKeyword',
  'anotherFunction'
];
```

### Adding Hover Documentation
Add to the `qDocs` object in the hover provider:
```typescript
const qDocs: Record<string, string> = {
  // ... existing docs
  'newFunction': 'Description of the new function'
};
```

### Modifying Syntax Highlighting
Update the Monarch tokenizer rules in the `setMonarchTokensProvider` call.

## Performance

The Monaco Editor is configured for optimal performance with Q code:
- Minimap disabled for cleaner interface
- Automatic layout for responsive design
- Efficient tokenization for Q syntax
- Lightweight completion suggestions

## Browser Compatibility

Tested and working in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

Potential improvements:
1. **Error detection**: Real-time Q syntax error highlighting
2. **Function signatures**: Parameter hints for Q functions
3. **Symbol resolution**: Go-to-definition for variables and functions
4. **Code formatting**: Automatic Q code formatting
5. **Refactoring**: Basic refactoring support for Q code
6. **Themes**: Additional color themes optimized for Q
7. **Extensions**: Plugin system for custom Q language features 