import React from 'react';

export function Atmosphere() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Top Left Emerald Glow */}
      <div className="absolute -top-32 -left-32 ambient-glow-1"></div>
      
      {/* Center Right Emerald Glow */}
      <div className="absolute top-1/3 -right-32 ambient-glow-2"></div>
      
      {/* Bottom Center Muted Glow */}
      <div className="absolute -bottom-48 left-1/3 w-96 h-96 bg-emerald-500/[0.04] rounded-full blur-[120px]"></div>
    </div>
  );
}
