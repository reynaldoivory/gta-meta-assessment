// src/components/Confetti.jsx

import { useEffect, useRef } from 'react';

const secureRandom = () => {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.getRandomValues) {
    return 0.5;
  }

  const buffer = new Uint32Array(1);
  cryptoApi.getRandomValues(buffer);
  return buffer[0] / 4294967296;
};

const Confetti = ({ active, onComplete }: any) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confetti = [];
    const colors = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

    for (let i = 0; i < 150; i++) {
      confetti.push({
        x: secureRandom() * canvas.width,
        y: secureRandom() * canvas.height - canvas.height,
        r: secureRandom() * 6 + 4,
        d: secureRandom() * 10 + 5,
        color: colors[Math.floor(secureRandom() * colors.length)],
        tilt: secureRandom() * 10 - 10,
        tiltAngleIncremental: secureRandom() * 0.07 + 0.05,
        tiltAngle: 0,
      });
    }

    let animationFrame;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confetti.forEach((c, idx) => {
        ctx.beginPath();
        ctx.lineWidth = c.r / 2;
        ctx.strokeStyle = c.color;
        ctx.moveTo(c.x + c.tilt + c.r, c.y);
        ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r);
        ctx.stroke();

        c.tiltAngle += c.tiltAngleIncremental;
        c.y += (Math.cos(c.d) + 3 + c.r / 2) / 2;
        c.x += Math.sin(c.d);
        c.tilt = Math.sin(c.tiltAngle - idx / 3) * 15;

        if (c.y > canvas.height) {
          confetti.splice(idx, 1);
        }
      });

      if (confetti.length > 0) {
        animationFrame = requestAnimationFrame(draw);
      } else if (onComplete) {
        onComplete();
      }
    }

    draw();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default Confetti;
