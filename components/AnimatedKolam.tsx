import React, { useMemo } from 'react';
import { generateKolamMotifPath, generateBorderPath, generateKolamDots, generateDiyaPath, generateDiyaDots } from '../utils/kolamGenerator';
import { KolamType } from '../types';

interface AnimatedKolamMotifProps {
  size?: number;
  seed?: number;
  className?: string;
  color?: string;
  type?: KolamType;
  loading?: boolean;
}

export const AnimatedKolamMotif: React.FC<AnimatedKolamMotifProps> = ({ 
  size = 64, 
  seed = Math.random(), 
  className = "",
  color = "currentColor",
  type = 'lissajous',
  loading = false
}) => {
  const path = useMemo(() => {
    if (loading) return generateDiyaPath(100);
    return generateKolamMotifPath(type as KolamType, seed, 100);
  }, [seed, type, loading]);

  const dots = useMemo(() => {
    if (loading) return generateDiyaDots(seed);
    return generateKolamDots(type as KolamType, seed);
  }, [seed, type, loading]);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* Dots (Static) */}
        <g className="animate-fade-in-dots fill-amber-500">
           {dots.map((d, i) => (
               <circle key={i} cx={d.cx} cy={d.cy} r={loading ? "4" : "3"} className={loading ? "opacity-100" : "opacity-80"} />
           ))}
        </g>
        
        {/* Animated Path */}
        <path 
          d={path} 
          fill="none" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round"
          strokeLinejoin="round"
          className={loading ? "animate-draw-loop" : "animate-draw"}
        />
      </svg>
    </div>
  );
};

interface AnimatedBorderProps {
  className?: string;
  seed?: number;
  children: React.ReactNode;
  type?: KolamType;
}

export const AnimatedBorder: React.FC<AnimatedBorderProps> = ({ 
    className, 
    seed = Math.random(), 
    children,
    type = 'lissajous'
}) => {
  const w = 400; 
  const h = 200; 
  
  const { path, dots } = useMemo(() => generateBorderPath(w, h, seed, type as KolamType), [seed, type]);

  return (
    <div className={`relative ${className}`}>
        {/* The Border Layer */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-sm">
             <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-full opacity-80 overflow-visible">
                 {/* Border Dots */}
                 <g className="animate-fade-in-dots fill-amber-500">
                    {dots.map((d, i) => (
                        <circle key={i} cx={d.x} cy={d.y} r="2.5" className="opacity-70" />
                    ))}
                 </g>

                 {/* Border Line */}
                 <path 
                    d={path} 
                    fill="none" 
                    stroke="#b45309" // Amber-700
                    strokeWidth="1.5" 
                    vectorEffect="non-scaling-stroke"
                    className="animate-draw-long"
                 />
             </svg>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
            {children}
        </div>
    </div>
  );
};
