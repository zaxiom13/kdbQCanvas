import QQueryInterface from './components/QQueryInterface'
import './App.css'

function App() {
  return (
    <div className="crt-container min-h-screen">
      {/* Console Boot Screen Header */}
      <div className="terminal-window mx-4 mt-4 mb-6">
        <div className="terminal-header">
          <div className="terminal-dots">
            <div className="terminal-dot red"></div>
            <div className="terminal-dot yellow"></div>
            <div className="terminal-dot green"></div>
          </div>
          <div className="text-xs font-mono">QCANVAS-OS v2.1.0</div>
        </div>
        
        <div className="p-6 text-center">
          <div className="mb-4">
            <pre className="text-sm neon-text leading-tight">
{`
  ██████  ██████  █████  ███    ██ ██    ██  █████  ███████ 
 ██    ██ ██      ██   ██ ████   ██ ██    ██ ██   ██ ██      
 ██    ██ ██      ███████ ██ ██  ██ ██    ██ ███████ ███████ 
 ██ ▄▄ ██ ██      ██   ██ ██  ██ ██  ██  ██  ██   ██      ██ 
  ██████  ██████  ██   ██ ██   ████   ████   ██   ██ ███████ 
     ▀▀                                                     
`}
            </pre>
          </div>
          
          <div className="space-y-2 text-xs font-mono">
            <div className="neon-accent">► KDB+/Q FANTASY CONSOLE ◄</div>
            <div className="text-console-dim">Transform data into pixel art • Real-time canvas rendering</div>
            <div className="text-console-warning">DUAL-BAND COMMUNICATION PROTOCOL ENABLED</div>
          </div>
          
          <div className="mt-4 text-xs font-mono text-console-dim">
            <div>MEMORY: 64K • DISPLAY: 128x128 • SOUND: 4 CHANNELS</div>
            <div className="mt-1">READY.</div>
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <main className="px-4 pb-4">
        <QQueryInterface />
      </main>

      {/* Console Footer */}
      <div className="text-center p-4 text-xs font-mono text-console-dim border-t border-console-border mt-8">
        <div className="flex justify-center items-center space-x-4">
          <span>QCANVAS-OS</span>
          <span>•</span>
          <span>BUILD 2025.01</span>
          <span>•</span>
          <span className="neon-text">SYSTEM READY</span>
        </div>
      </div>
    </div>
  )
}

export default App
