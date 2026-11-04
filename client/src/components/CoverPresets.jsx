import React from 'react';

export const COVER_PRESETS = [
  {
    id: 'preset-cyber-grid',
    name: 'Cybernetic Grid',
    category: 'Systems & Architecture',
    previewColor: '#10B981',
  },
  {
    id: 'preset-neon-matrix',
    name: 'Neon Matrix',
    category: 'Graphics & Shaders',
    previewColor: '#06B6D4',
  },
  {
    id: 'preset-quantum-orb',
    name: 'Quantum Horizon',
    category: 'Advanced Computing',
    previewColor: '#8B5CF6',
  },
  {
    id: 'preset-minimal-code',
    name: 'Monochrome Monolith',
    category: 'Foundations & Algorithms',
    previewColor: '#EBEBEB',
  },
  {
    id: 'preset-neural-lattice',
    name: 'Neural Lattice',
    category: 'Machine Intelligence',
    previewColor: '#10B981',
  },
  {
    id: 'preset-amber-flare',
    name: 'Solar Obsidian',
    category: 'Security & Protocol',
    previewColor: '#F59E0B',
  },
];

export function CourseCoverImage({ presetId, className = 'w-full h-48', title = '' }) {
  switch (presetId) {
    case 'preset-neon-matrix':
      return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-[#02130e] via-[#041a14] to-[#010806] flex items-center justify-center ${className}`}>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d415_1px,transparent_1px),linear-gradient(to_bottom,#06b6d415_1px,transparent_1px)] bg-[size:16px_24px]"></div>
          <div className="absolute w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 text-center px-4">
            <div className="inline-block px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 tech-label mb-2">
              GLSL // WEBGL 2.0
            </div>
            {title && <div className="text-white/90 text-sm font-semibold truncate max-w-[260px] mx-auto">{title}</div>}
          </div>
        </div>
      );

    case 'preset-quantum-orb':
      return (
        <div className={`relative overflow-hidden bg-gradient-to-tr from-[#08020e] via-[#10061d] to-[#050109] flex items-center justify-center ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.15),transparent_60%)]"></div>
          <div className="w-24 h-24 rounded-full border border-purple-500/30 animate-pulseGlow flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border border-purple-400/50 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 blur-sm"></div>
            </div>
          </div>
          <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center text-[10px] tech-label text-purple-400/80">
            <span>STATEVECTOR</span>
            <span>ψ = α|0⟩ + β|1⟩</span>
          </div>
        </div>
      );

    case 'preset-minimal-code':
      return (
        <div className={`relative overflow-hidden bg-gradient-to-b from-[#111113] via-[#09090b] to-[#050505] flex items-center justify-center ${className}`}>
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/10"></div>
          <div className="text-zinc-600 font-mono text-2xl select-none tracking-widest flex items-center gap-3">
            <span>&lt;</span>
            <span className="text-emerald-400/80 font-bold">ClassCast</span>
            <span>/&gt;</span>
          </div>
          <div className="absolute bottom-3 left-4 text-[9px] tech-label text-zinc-500">
            MONOLITH CORE // SPEC-01
          </div>
        </div>
      );

    case 'preset-neural-lattice':
      return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-[#03150d] via-[#020b06] to-[#010503] flex items-center justify-center ${className}`}>
          <div className="absolute inset-0 opacity-25">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="lattice" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 40 M 0 0 L 40 40" fill="none" stroke="#10B981" strokeWidth="0.5" />
                  <circle cx="20" cy="20" r="1.5" fill="#10B981" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#lattice)" />
            </svg>
          </div>
          <div className="relative z-10 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 tech-label">
            NEURAL // LATTICE
          </div>
        </div>
      );

    case 'preset-amber-flare':
      return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-[#1c0f02] via-[#0f0701] to-[#050200] flex items-center justify-center ${className}`}>
          <div className="absolute w-44 h-44 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 text-center">
            <div className="text-amber-400 tech-label mb-1">PROTOCOL // CIPHER</div>
            <div className="text-xs text-amber-200/60 font-mono">256-BIT ASYMETRIC</div>
          </div>
        </div>
      );

    case 'preset-cyber-grid':
    default:
      return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-[#041a12] via-[#020d09] to-[#010503] flex items-center justify-center ${className}`}>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          <div className="absolute w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl"></div>
          <div className="relative z-10 text-center px-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 tech-label mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              DISTRIBUTED SYSTEMS
            </div>
            {title && <div className="text-white text-sm font-medium truncate max-w-[260px] mx-auto">{title}</div>}
          </div>
        </div>
      );
  }
}
