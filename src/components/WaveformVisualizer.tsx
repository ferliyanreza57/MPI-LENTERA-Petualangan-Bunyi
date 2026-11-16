import React, { useEffect, useRef } from 'react';
import { getWaveformData } from '../utils/audioEngine';

interface WaveformVisualizerProps {
  label?: string;
  accentColor?: string;
  height?: number;
  simAmplitude?: number;
  simFrequency?: number;
  simulateAlways?: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  label = 'Osiloskop Gelombang Bunyi',
  accentColor = '#38bdf8',
  height = 68,
  simAmplitude = 0.55,
  simFrequency = 3.2,
  simulateAlways = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let rafId = 0;
    const buffer = new Uint8Array(512);
    let phase = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;
      const active = getWaveformData(buffer);

      ctx.clearRect(0, 0, W, H);

      // Subtle oscilloscope grid
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx <= W; gx += 48) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, H);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = active || simulateAlways ? accentColor : 'rgba(148, 163, 184, 0.5)';
      ctx.lineWidth = 2.6;

      if (active) {
        const slice = W / buffer.length;
        for (let i = 0; i < buffer.length; i++) {
          const v = (buffer[i] - 128) / 128;
          const x = i * slice;
          const y = H / 2 + v * (H * 0.42);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else if (simulateAlways) {
        phase += 0.12;
        for (let x = 0; x <= W; x += 3) {
          const norm = x / W;
          const env = Math.sin(norm * Math.PI);
          const y = H / 2 + Math.sin(norm * Math.PI * 2 * simFrequency - phase) * (H * 0.36 * simAmplitude * (0.45 + 0.55 * env));
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else {
        // Gentle idle resting line
        phase += 0.04;
        for (let x = 0; x <= W; x += 6) {
          const y = H / 2 + Math.sin((x / W) * Math.PI * 4 + phase) * 2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [accentColor, simAmplitude, simFrequency, simulateAlways]);

  return (
    <div className="bg-slate-950 border-2 border-amber-700/80 rounded-2xl px-3 py-1.5 flex items-center gap-3 shadow-inner">
      <div className="shrink-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">{label}</div>
        <div className="text-[10px] font-data text-slate-300">Gelombang real-time</div>
      </div>
      <canvas ref={canvasRef} width={480} height={height} className="w-full h-12 sm:h-14 rounded-lg" />
    </div>
  );
};
