{
  /*
    Chadson v69.1.0
    File: src/components/CanvasLogo.tsx
    Purpose: Renders an animated, canvas-based version of the SUBFROST logo.
    Project: SUBFROST Documentation
    Date: 2025-07-16
    Task: Update canvas logo to draw a detailed snowflake and add padding.
  */
}
import React, { useRef, useEffect } from 'react';

const CanvasLogo = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const size = 32; // The size of the navbar logo
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
      ctx.strokeStyle = `rgba(30, 58, 138, 0.9)`;
      ctx.lineWidth = 1;
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

  return <canvas ref={canvasRef} style={{ verticalAlign: 'middle', paddingRight: '10px' }} />;
};

export default CanvasLogo;