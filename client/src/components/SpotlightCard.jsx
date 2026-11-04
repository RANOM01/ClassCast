import React, { useRef } from 'react';

export function SpotlightCard({
  children,
  className = '',
  shimmer = true,
  onClick,
}) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={`
        spotlight-card
        ${shimmer ? 'shimmer-card' : 'rounded-3xl border border-white/10'}
        bg-[rgba(255,255,255,0.02)]
        backdrop-blur-md
        transition-all duration-300
        ${onClick ? 'cursor-pointer hover:border-emerald-500/30' : ''}
        ${className}
      `}
    >
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
