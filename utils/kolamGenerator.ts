import { KolamType } from '../types';

/**
 * Procedural Kolam Generator
 * Supports multiple styles: Lissajous (Freeform), Pulli (Geometric), Kambi (Loops), Diya (Lamp).
 */

const random = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

// --- DIYA (LAMP) GENERATOR ---

export const generateDiyaPath = (size: number): string => {
    // Generates a stylized continuous line drawing of a Kuthu Vilakku (Traditional Lamp)
    // The path flows from base -> stem -> bowl -> flame -> back
    
    // Normalized coordinates (0-100 scale)
    // Center x = 50
    // Base y = 90
    // Bowl y = 45
    // Flame tip y = 10
    
    // Start at bottom of stem (above base)
    let p = `M 50,80`;
    
    // 1. Draw Base (Two loops)
    // Left Base Loop
    p += ` C 30,80 20,95 50,95`; 
    // Right Base Loop
    p += ` C 80,95 70,80 50,80`;
    
    // 2. Stem Up
    p += ` L 50,50`;
    
    // 3. Bowl (Agals) and Flame
    // Left Bowl Loop (Out and In)
    p += ` C 20,50 20,30 50,30`;
    
    // Flame (Up to tip and down)
    p += ` C 40,20 50,5 50,5`; // Left side of flame
    p += ` C 50,5 60,20 50,30`; // Right side of flame
    
    // Right Bowl Loop
    p += ` C 80,30 80,50 50,50`;
    
    // 4. Stem Down to close
    p += ` L 50,80 Z`;
    
    return p;
};

export const generateDiyaDots = (seed: number): {cx: number, cy: number}[] => {
    // Places dots specifically for the lamp anatomy
    return [
        { cx: 50, cy: 95 }, // Base Center
        { cx: 50, cy: 65 }, // Stem Center
        { cx: 50, cy: 20 }, // Flame Center
        { cx: 30, cy: 40 }, // Left Bowl
        { cx: 70, cy: 40 }, // Right Bowl
    ];
};


// --- MOTIF GENERATORS ---

const generateLissajousMotif = (seed: number, size: number): string => {
  const center = size / 2;
  const scale = size * 0.4;
  
  const r1 = random(seed);
  const r2 = random(seed + 1);
  const r3 = random(seed + 2);

  const a = 1 + Math.floor(r1 * 4); 
  const b = 1 + Math.floor(r2 * 4); 
  const delta = (Math.PI / 2) * Math.floor(r3 * 2); 
  
  let path = `M `;
  const steps = 100;
  
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * (2 * Math.PI);
    const x = center + scale * Math.sin(a * t + delta);
    const y = center + scale * Math.sin(b * t);
    
    if (i === 0) path += `${x.toFixed(1)} ${y.toFixed(1)}`;
    else path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  
  path += " Z";
  return path;
};

const generatePulliMotif = (seed: number, size: number): string => {
    const gridSize = size;
    const step = size / 4;
    const center = size / 2;
    
    let path = "";
    const r = random(seed);
    
    if (r < 0.33) {
        path = `M ${center},${step} L ${center + step},${center} L ${center},${size - step} L ${center - step},${center} Z`;
        path += ` M ${center},${0} L ${size},${center} L ${center},${size} L ${0},${center} Z`;
    } else if (r < 0.66) {
        path = `M ${center},${step} L ${center + step},${step} L ${center + step},${center} L ${step},${center} Z`; 
        path += ` M ${center},0 L ${size},${center} L ${center},${size} L 0,${center} Z`; 
    } else {
        path = `M ${step},${step} L ${size-step},${step} L ${size-step},${size-step} L ${step},${size-step} Z`;
        path += ` M ${center},0 L ${size},${center} L ${center},${size} L 0,${center} Z`;
    }
    
    return path;
};

const generateKambiMotif = (seed: number, size: number): string => {
    const center = size / 2;
    const r = size * 0.35;
    
    let path = `M ${center},${center - r}`;
    path += ` C ${center + r},${center - r} ${center + r},${center} ${center},${center}`; 
    path += ` C ${center + r},${center + r} ${center},${center + r} ${center},${center}`; 
    path += ` C ${center - r},${center + r} ${center - r},${center} ${center},${center}`; 
    path += ` C ${center - r},${center - r} ${center},${center - r} ${center},${center - r}`; 
    
    if (random(seed) > 0.5) {
        path += ` M ${center},${center - r*1.2} A ${r*1.2} ${r*1.2} 0 1 1 ${center - 0.1},${center - r*1.2}`;
    }

    return path;
};

// Main Motif Function
export const generateKolamMotifPath = (type: KolamType, seed: number, size: number = 100): string => {
    switch (type) {
        case 'pulli': return generatePulliMotif(seed, size);
        case 'kambi': return generateKambiMotif(seed, size);
        case 'lissajous': 
        default: return generateLissajousMotif(seed, size);
    }
};

// Generates dots for the motif
export const generateKolamDots = (type: KolamType, seed: number): {cx: number, cy: number}[] => {
    const dots = [];
    
    if (type === 'lissajous') {
        for(let x=0; x<3; x++) {
            for(let y=0; y<3; y++) {
                dots.push({ cx: 10 + x*40, cy: 10 + y*40 });
            }
        }
    } else {
        const center = 50;
        const step = 25;
        dots.push({ cx: center, cy: center });
        dots.push({ cx: center - step, cy: center - step });
        dots.push({ cx: center + step, cy: center - step });
        dots.push({ cx: center - step, cy: center + step });
        dots.push({ cx: center + step, cy: center + step });
        
        if (type === 'pulli') {
            dots.push({ cx: center, cy: center - step*1.5 });
            dots.push({ cx: center, cy: center + step*1.5 });
            dots.push({ cx: center - step*1.5, cy: center });
            dots.push({ cx: center + step*1.5, cy: center });
        }
    }
    return dots;
};

// --- BORDER GENERATORS ---

export const generateBorderPath = (width: number, height: number, seed: number, type: KolamType): { path: string, dots: {x: number, y: number}[] } => {
   const loopSize = 25;
   const padding = 10;
   
   let path = `M ${padding},${padding} `;
   const dots: {x: number, y: number}[] = [];
   
   const addSegment = (x1: number, y1: number, x2: number, y2: number, dotX: number, dotY: number) => {
       dots.push({ x: dotX, y: dotY });
       
       if (type === 'pulli') {
           // Zig Zag / Straight Geometric
           path += `L ${dotX},${dotY} L ${x2},${y2} `;
       } else {
           // Curved Loop (Kambi/Lissajous)
           // Not strictly used now as user enforced Pulli, but kept for robustness
       }
   };

   // Logic simplified to focus on Pulli as requested, but keeping structure generic
   if (type === 'pulli') {
       // Top
       for (let x = padding; x < width - padding - loopSize; x += loopSize) {
           addSegment(x, padding, x + loopSize, padding, x + loopSize/2, padding + loopSize/2);
       }
       path += `L ${width - padding},${padding} `;
       // Right
       for (let y = padding; y < height - padding - loopSize; y += loopSize) {
           addSegment(width - padding, y, width - padding, y + loopSize, width - padding - loopSize/2, y + loopSize/2);
       }
       path += `L ${width - padding},${height - padding} `;
       // Bottom
       for (let x = width - padding; x > padding + loopSize; x -= loopSize) {
           addSegment(x, height - padding, x - loopSize, height - padding, x - loopSize/2, height - padding - loopSize/2);
       }
       path += `L ${padding},${height - padding} `;
       // Left
       for (let y = height - padding; y > padding + loopSize; y -= loopSize) {
           addSegment(padding, y, padding, y - loopSize, padding + loopSize/2, y - loopSize/2);
       }
   } else {
       // Fallback/Kambi logic
       for (let x = padding; x < width - padding - loopSize; x += loopSize) {
          dots.push({ x: x + loopSize/2, y: padding });
          path += `Q ${x + loopSize/2},${padding - loopSize} ${x + loopSize},${padding} `;
       }
       path += `L ${width - padding},${padding} `;
       for (let y = padding; y < height - padding - loopSize; y += loopSize) {
           dots.push({ x: width - padding, y: y + loopSize/2 });
           path += `Q ${width - padding + loopSize},${y + loopSize/2} ${width - padding},${y + loopSize} `;
       }
       path += `L ${width - padding},${height - padding} `;
       for (let x = width - padding; x > padding + loopSize; x -= loopSize) {
           dots.push({ x: x - loopSize/2, y: height - padding });
           path += `Q ${x - loopSize/2},${height - padding + loopSize} ${x - loopSize},${height - padding} `;
       }
       path += `L ${padding},${height - padding} `;
       for (let y = height - padding; y > padding + loopSize; y -= loopSize) {
           dots.push({ x: padding, y: y - loopSize/2 });
           path += `Q ${padding - loopSize},${y - loopSize/2} ${padding},${y - loopSize} `;
       }
   }
   
   path += "Z";
   return { path, dots };
};
