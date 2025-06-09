import { HelpCircle } from 'lucide-react';
import type { StatusMessage } from '@shared/schema';

interface StatusBarProps {
  isConnected: boolean;
  executionTime?: number;
  memoryUsage?: string;
  onHelpClick: () => void;
}

export function StatusBar({ isConnected, executionTime, memoryUsage, onHelpClick }: StatusBarProps) {
  return (
    <footer className="bg-gray-800 text-gray-300 px-4 py-2 text-xs flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{isConnected ? 'Connected to Q Engine' : 'Disconnected'}</span>
        </div>
        <span>•</span>
        <span>Execution: {executionTime || 0}ms</span>
        <span>•</span>
        <span>Memory: {memoryUsage || '0MB'}</span>
      </div>
      <div className="flex items-center space-x-4">
        <span>q/kdb+ v4.0 (mock)</span>
        <span>•</span>
        <button 
          onClick={onHelpClick}
          className="hover:text-white transition-colors flex items-center space-x-1"
        >
          <HelpCircle size={12} />
          <span>Help</span>
        </button>
      </div>
    </footer>
  );
}
