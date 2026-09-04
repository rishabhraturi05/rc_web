"use client";
import React, { useRef, useEffect } from 'react';

export default function PixelCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Grid settings
    const spacing = 20; // denser space between pixels
    let cols = Math.floor(width / spacing);
    let rows = Math.floor(height / spacing);
    
    // Track pixel states (alpha/brightness)
    let pixels = [];
    
    // Mouse state
    let mouseX = -1000;
    let mouseY = -1000;
    const radius = 100; // Tighter interaction radius

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      cols = Math.floor(width / spacing);
      rows = Math.floor(height / spacing);
      // Reset pixels on massive resize to prevent memory leaks
      pixels = [];
    };

    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      // Clear canvas with deep black
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Hoist time calculation out of inner loop (was called 5000+ times/frame)
      const time = Date.now() * 0.001;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const index = i + j * cols;
          
          const px = i * spacing + spacing / 2;
          const py = j * spacing + spacing / 2;

          // Calculate distance to mouse
          const dx = mouseX - px;
          const dy = mouseY - py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // If within radius, boost brightness
          if (dist < radius) {
            const intensity = 1 - (dist / radius);
            pixels[index] = Math.max(pixels[index] || 0, intensity);
          }

          // Draw the pixel
          let alpha = pixels[index] || 0;
          
          // Draw a very faint baseline grid dot if alpha is low, applying a breathing effect
          if (alpha <= 0.05) {
             // Create a wave that moves diagonally across the screen
             const wave = Math.sin(time + (px * 0.005) + (py * 0.005));
             
             // Base alpha breathes between 0.05 and 0.25 (much brighter)
             const breathAlpha = 0.15 + (wave * 0.1); 
             ctx.fillStyle = `rgba(255, 255, 255, ${breathAlpha})`;
             
             // Base size breathes noticeably between 1.5 and 3.5 pixels
             const size = 2.5 + (wave * 1);
             ctx.fillRect(px - (size/2), py - (size/2), size, size);
          } else {
             // Draw the bright white interacting pixel
             ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`; // Dense white
             ctx.fillRect(px - 2, py - 2, 4, 4);
             
             // Add glow
             ctx.shadowBlur = 10;
             ctx.shadowColor = '#ffffff';
             ctx.fillRect(px - 2, py - 2, 4, 4);
             ctx.shadowBlur = 0; // reset for next operations
          }
          
          // Decay the pixel over time for trailing effect
          if (pixels[index] > 0) {
            pixels[index] -= 0.03; // Fade speed (higher = faster fade)
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        // Dither mask to gently fade the grid at the edges of the screen
        maskImage: 'radial-gradient(ellipse at 50% 50%, #000 0%, rgba(0,0,0,0.5) 60%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, #000 0%, rgba(0,0,0,0.5) 60%, transparent 100%)'
      }}
    />
  );
}
