import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ZoomIn, ZoomOut, X, Eye, Sparkles } from 'lucide-react';
import { Coordinates } from '../../types';

interface MagnifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  cursorPos: Coordinates;
}

export const MagnifierModal: React.FC<MagnifierModalProps> = ({
  isOpen,
  onClose,
  cursorPos,
}) => {
  const [zoomLevel, setZoomLevel] = useState(2);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') setZoomLevel((z) => Math.min(5, z + 0.5));
      if (e.key === '-' || e.key === '_') setZoomLevel((z) => Math.max(1.5, z - 0.5));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="magnifier-overlay"
      className="fixed inset-0 z-50 pointer-events-none select-none"
    >
      {/* Top Banner guide */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-700 text-white shadow-2xl backdrop-blur-md pointer-events-auto flex items-center gap-3">
        <ZoomIn className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-semibold">Lupa aktywna wokół kursora (Powiększenie: {zoomLevel}x)</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomLevel((z) => Math.max(1.5, z - 0.5))}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono"
            title="Pomniejsz (-)"
          >
            -
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.min(5, z + 0.5))}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono"
            title="Powiększ (+)"
          >
            +
          </button>
          <button
            onClick={onClose}
            className="ml-2 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Circular Zoom Lens */}
      <motion.div
        className="absolute rounded-full border-4 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] pointer-events-none overflow-hidden bg-slate-900/40 backdrop-blur-[0.5px]"
        style={{
          width: 180,
          height: 180,
          left: cursorPos.x - 90,
          top: cursorPos.y - 90,
        }}
        animate={{
          scale: [1, 1.02, 1],
        }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-full h-full flex items-center justify-center relative">
          <div className="w-2 h-2 rounded-full bg-cyan-400/80 ring-4 ring-cyan-400/20" />
          <div className="absolute top-2 px-2 py-0.5 rounded-full bg-slate-950/80 text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
            {zoomLevel}x ZOOM
          </div>
        </div>
      </motion.div>
    </div>
  );
};
