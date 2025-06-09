# Refactored QQueryInterface Architecture

This document outlines the new modular architecture for the QQueryInterface component, designed to improve maintainability and reduce merge conflicts.

## Directory Structure

```
src/
├── components/
│   ├── QQueryInterface.jsx           # Main component (refactored)
│   ├── canvas/                       # Canvas-related components
│   │   ├── CanvasDisplay.jsx        # Canvas rendering logic
│   │   └── CanvasHeader.jsx         # Canvas header with controls
│   ├── editor/                       # Query editing components
│   │   ├── QueryEditor.jsx          # Main query input
│   │   └── PredefinedQueries.jsx    # Predefined query buttons
│   ├── history/                      # Query history components
│   │   └── QueryHistory.jsx         # Query history display
│   ├── result/                       # Result display components
│   │   └── ResultDisplay.jsx        # Query result formatting
│   ├── sections/                     # Layout section components
│   │   ├── CanvasSection.jsx        # Canvas section wrapper
│   │   ├── EditorSection.jsx        # Editor section wrapper
│   │   └── SidebarSection.jsx       # Sidebar section wrapper
│   ├── settings/                     # Settings components
│   │   ├── CanvasSizeControls.jsx   # Canvas size slider
│   │   ├── LiveModeControls.jsx     # Live mode toggle
│   │   └── SettingsPanel.jsx        # Settings panel wrapper
│   └── status/                       # Status components
│       └── ConnectionStatus.jsx     # Backend connection status
├── hooks/                            # Custom React hooks
│   ├── index.js                     # Hook exports
│   ├── useConnectionStatus.js       # Backend connection management
│   ├── useLiveMode.js              # Live mode functionality
│   ├── useMousePosition.js         # Mouse position tracking
│   ├── useQQueryInterface.js       # Main state management hook
│   └── useQueryExecution.js        # Query execution logic
├── utils/                           # Utility functions
│   ├── index.js                    # Utility exports
│   ├── arrayFormatters.js          # Array formatting and display
│   ├── debugUtils.js               # Debug utilities (existing)
│   └── queryUtils.js               # Query helper functions
└── data/                           # Static data
    ├── index.js                    # Data exports
    └── predefinedQueries.js        # Predefined query definitions
```

## Component Responsibilities

### Main Components

- **QQueryInterface.jsx**: Orchestrates all sections using the main state hook
- **useQQueryInterface.js**: Central state management combining all hooks

### Canvas Components

- **CanvasHeader.jsx**: Canvas title, live mode indicator, settings toggle
- **CanvasDisplay.jsx**: ArrayCanvas wrapper with placeholder state
- **CanvasSection.jsx**: Combines header, settings, and display

### Editor Components

- **QueryEditor.jsx**: Text area with execution button and keyboard shortcuts
- **PredefinedQueries.jsx**: Grid of example query buttons
- **EditorSection.jsx**: Combines editor and predefined queries

### Result Components

- **ResultDisplay.jsx**: Formatted query results with statistics
- **QueryHistory.jsx**: Clickable history of previous queries

### Settings Components

- **LiveModeControls.jsx**: Toggle for live mode with validation
- **CanvasSizeControls.jsx**: Slider for canvas size adjustment
- **SettingsPanel.jsx**: Collapsible settings container

### Status Components

- **ConnectionStatus.jsx**: Backend connection indicator

### Section Components

- **CanvasSection.jsx**: Main canvas area layout
- **EditorSection.jsx**: Query input area layout  
- **SidebarSection.jsx**: Results and status layout

## Custom Hooks

### State Management

- **useQQueryInterface**: Main hook combining all state and actions
- **useQueryExecution**: Query execution logic and result management
- **useConnectionStatus**: Backend connection monitoring
- **useMousePosition**: Global mouse position tracking
- **useLiveMode**: Live mode toggle and interval management

## Utilities

### Array Processing

- **arrayFormatters.js**: 
  - `formatArrayByShape()`: Reshape flat arrays to nested structure
  - `compactArrayString()`: Compact array display
  - `formatArrayWithBoxDrawing()`: ASCII art array display
  - `formatResult()`: Main result formatting function

### Query Processing

- **queryUtils.js**:
  - `containsMouseVariables()`: Check for mouseX/mouseY variables
  - `calculateArrayStats()`: Statistical analysis of arrays
  - `isFlatPrimitiveArray()`: Type checking utility

## Benefits of This Architecture

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be easily reused or swapped
3. **Testability**: Individual components can be unit tested
4. **Maintainability**: Changes are isolated to specific files
5. **Merge Conflict Reduction**: Smaller files mean fewer conflicts
6. **Code Organization**: Clear separation of concerns
7. **Performance**: Components can be individually optimized

## Migration Notes

- All functionality from the original QQueryInterface.jsx has been preserved
- State management is centralized in `useQQueryInterface` hook
- Import structure uses index.js files for cleaner imports
- Original component is backed up as QQueryInterface.jsx.backup

## Development Workflow

When making changes:

1. **UI Changes**: Modify specific component files
2. **State Changes**: Update relevant hooks
3. **Logic Changes**: Update utility functions
4. **New Features**: Create new components in appropriate directories

This structure makes it much easier to:
- Find specific functionality
- Make targeted changes
- Review pull requests
- Debug issues
- Add new features
