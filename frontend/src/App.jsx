import QQueryInterface from './components/QQueryInterface'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-4 px-2 font-sans">
      <div className="w-full max-w-none">
        <header className="text-center mb-6">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Q Canvas
          </h1>
          <p className="text-2xl text-gray-700 mb-2">
            Creative Coding with KDB+/Q
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Transform data into visual art. Write Q expressions to generate arrays, matrices, and animations that come alive on the canvas.
          </p>
        </header>
        <main>
          <QQueryInterface />
        </main>
        <footer className="text-center mt-8 pt-6 border-t border-gray-300">
          <p className="text-sm text-gray-500">
            &copy; 2025 Q Canvas - Where Data Meets Art
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
