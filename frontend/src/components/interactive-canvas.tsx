import { useRef, useEffect, useState } from 'react';
import { BarChart3, MousePointer, Image, Maximize2, Download } from 'lucide-react';

interface InteractiveCanvasProps {
  visualizations?: Array<{
    type: 'table' | 'chart' | 'text' | 'error';
    data: any;
  }>;
}

export function InteractiveCanvas({ visualizations = [] }: InteractiveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<'chart' | 'interactive' | 'visual'>('chart');
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Find chart visualizations
    const chartViz = visualizations.find(v => v.type === 'chart');
    
    if (chartViz && mode === 'chart') {
      drawChart(ctx, chartViz.data, canvas.width, canvas.height);
    } else if (mode === 'interactive') {
      drawInteractiveElements(ctx, canvas.width, canvas.height, mousePos);
    } else {
      drawDefault(ctx, canvas.width, canvas.height);
    }
  }, [visualizations, mode, mousePos]);

  const drawChart = (ctx: CanvasRenderingContext2D, data: any, width: number, height: number) => {
    const { values, labels } = data;
    if (!values || values.length === 0) return;

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = chartWidth / values.length;
    const maxValue = Math.max(...values);

    // Draw bars
    values.forEach((value: number, i: number) => {
      const barHeight = (value / maxValue) * chartHeight;
      const x = padding + i * barWidth + barWidth * 0.1;
      const y = height - padding - barHeight;
      const barActualWidth = barWidth * 0.8;

      ctx.fillStyle = '#2563eb';
      ctx.fillRect(x, y, barActualWidth, barHeight);

      // Draw value labels
      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        value.toString(),
        x + barActualWidth / 2,
        y - 5
      );

      // Draw x-axis labels
      if (labels && labels[i]) {
        ctx.fillText(
          labels[i].toString(),
          x + barActualWidth / 2,
          height - padding + 20
        );
      }
    });
  };

  const drawInteractiveElements = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    mouse: { x: number; y: number }
  ) => {
    // Draw interactive grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    for (let x = 0; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw mouse cursor effect
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2);
    ctx.fill();

    // Draw coordinates
    ctx.fillStyle = '#374151';
    ctx.font = '14px monospace';
    ctx.fillText(`x: ${mouse.x}, y: ${mouse.y}`, 10, 20);
  };

  const drawDefault = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw placeholder content
    ctx.strokeStyle = '#d1d5db';
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(20, 20, width - 40, height - 40);

    ctx.fillStyle = '#6b7280';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Interactive visualization will render here',
      width / 2,
      height / 2 - 10
    );
    ctx.fillText(
      'Mouse events: click, hover, drag',
      width / 2,
      height / 2 + 10
    );
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    setMousePos({
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top)
    });
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'q-visualization.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="font-medium text-sm text-gray-900">Interactive Canvas</h3>
            <div className="flex space-x-1">
              <button
                onClick={() => setMode('chart')}
                className={`px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50 ${
                  mode === 'chart' ? 'bg-white text-gray-800' : 'bg-white text-gray-600'
                }`}
              >
                <BarChart3 size={12} className="mr-1 inline" />
                Chart
              </button>
              <button
                onClick={() => setMode('interactive')}
                className={`px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50 ${
                  mode === 'interactive' ? 'bg-white text-gray-800' : 'bg-white text-gray-600'
                }`}
              >
                <MousePointer size={12} className="mr-1 inline" />
                Interactive
              </button>
              <button
                onClick={() => setMode('visual')}
                className={`px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50 ${
                  mode === 'visual' ? 'bg-white text-gray-800' : 'bg-white text-gray-600'
                }`}
              >
                <Image size={12} className="mr-1 inline" />
                Visual
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-gray-600">
              <Maximize2 size={14} />
            </button>
            <button onClick={handleExport} className="text-gray-400 hover:text-gray-600">
              <Download size={14} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="h-64 p-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair"
          onMouseMove={handleMouseMove}
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>
    </div>
  );
}
