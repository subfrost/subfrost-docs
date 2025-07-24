{
  /*
    Chadson v69.1.0
    File: src/components/CanvasLogoLarge.tsx
    Purpose: Renders a large, animated, canvas-based version of the SUBFROST logo for the splash screen.
    Project: SUBFROST Documentation
    Date: 2025-07-16
    Task: Create a large canvas logo for the splash screen.
  */
}
import React, { useRef, useEffect } from 'react';

const CanvasLogoLarge = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const size = 75; // The size of the splash screen logo
    canvas.width = size;
    canvas.height = size;

    const drawSnowflake = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        // Main branches
        ctx.moveTo(x, y);
        ctx.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));

        // Smaller branches
        ctx.moveTo(x + radius * 0.6 * Math.cos(angle), y + radius * 0.6 * Math.sin(angle));
        ctx.lineTo(
          x + radius * 0.6 * Math.cos(angle) + (radius * 0.3 * Math.cos(angle + Math.PI / 4)),
          y + radius * 0.6 * Math.sin(angle) + (radius * 0.3 * Math.sin(angle + Math.PI / 4))
        );
        ctx.moveTo(x + radius * 0.6 * Math.cos(angle), y + radius * 0.6 * Math.sin(angle));
        ctx.lineTo(
          x + radius * 0.6 * Math.cos(angle) + (radius * 0.3 * Math.cos(angle - Math.PI / 4)),
          y + radius * 0.6 * Math.sin(angle) + (radius * 0.3 * Math.sin(angle - Math.PI / 4))
        );
      }
      ctx.strokeStyle = '#1E3A8A';
      ctx.lineWidth = 2; // Thicker lines for a larger logo
      ctx.stroke();
    };

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.save();
      
      // Simple animation: pulsing
      const scale = 1 + Math.sin(frame * 0.05) * 0.05;
      ctx.translate(size / 2, size / 2);
      ctx.scale(scale, scale);
      ctx.translate(-size / 2, -size / 2);


      drawSnowflake(ctx, size / 2, size / 2, size * 0.45);

      ctx.restore();
      frame++;
      requestAnimationFrame(draw);
    };

    draw();
  }, []);

  return <canvas ref={canvasRef} />;
};

export default CanvasLogoLarge;