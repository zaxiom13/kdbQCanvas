# kdbQCanvas

A Q/KDB+ query interface and visualization tool built with Kotlin backend and React frontend.

## Project Structure

- **Backend (Kotlin)**: API server for Q/KDB+ query execution and processing
- **Frontend (React)**: Interactive web interface for query editing and visualization

## Features

- Interactive Q query editor
- Real-time query execution with live mode
- Array visualization and canvas display
- Query history and debugging tools
- Error analysis and suggestions
- Mouse position tracking for interactive queries

## Tech Stack

### Backend
- Kotlin
- Ktor (web framework)
- Maven
- Q/KDB+ IPC connector

### Frontend
- React 18
- Vite
- Modern CSS

## Getting Started

### Prerequisites
- JDK 11 or higher
- Node.js 16 or higher
- Q/KDB+ instance

### Backend Setup
```bash
# Build the Kotlin backend
mvn clean compile

# Run the backend server
mvn exec:java -Dexec.mainClass="MainKt"
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Usage

1. Start the Q/KDB+ process
2. Run the Kotlin backend server (port 8080)
3. Start the React frontend (port 5173)
4. Open your browser and navigate to the frontend URL
5. Begin writing and executing Q queries

## Architecture

The application consists of:
- **QProcessManager**: Manages Q/KDB+ process lifecycle
- **QIPCConnector**: Handles IPC communication with Q
- **QErrorAnalyzer**: Provides intelligent error analysis
- **QueryLifecycleManager**: Manages query execution flow
- **React Frontend**: Provides the user interface

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).
