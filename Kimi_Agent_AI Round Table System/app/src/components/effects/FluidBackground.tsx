import { useRef, useEffect } from 'react';

interface FluidParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  life: number;
  maxLife: number;
  hue: number;
}

export default function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0 });
  const particlesRef = useRef<FluidParticle[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const mouse = mouseRef.current;
    const onMove = (e: MouseEvent) => {
      mouse.px = mouse.x;
      mouse.py = mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.vx = mouse.x - mouse.px;
      mouse.vy = mouse.y - mouse.py;
    };
    window.addEventListener('mousemove', onMove);

    // Initialize particles
    const particles = particlesRef.current;
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.1,
        life: Math.random() * 1000,
        maxLife: 1000 + Math.random() * 2000,
        hue: 190 + Math.random() * 30,
      });
    }

    const animate = (time: number) => {
      // Fade trail
      ctx.fillStyle = 'rgba(5, 5, 16, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw base gradient
      const gradient = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.5, 0,
        canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.7
      );
      gradient.addColorStop(0, 'rgba(10, 14, 39, 0.015)');
      gradient.addColorStop(1, 'rgba(5, 5, 16, 0.01)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Mouse influence
      const mouseSpeed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);
      
      // Spawn trail particles near mouse
      if (mouseSpeed > 2 && time % 3 === 0) {
        for (let i = 0; i < 2; i++) {
          particles.push({
            x: mouse.x + (Math.random() - 0.5) * 30,
            y: mouse.y + (Math.random() - 0.5) * 30,
            vx: mouse.vx * 0.1 + (Math.random() - 0.5) * 2,
            vy: mouse.vy * 0.1 + (Math.random() - 0.5) * 2,
            radius: Math.random() * 3 + 2,
            opacity: 0.4,
            life: 0,
            maxLife: 200 + Math.random() * 300,
            hue: 185 + Math.random() * 40,
          });
        }
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        // Mouse attraction
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 1) {
          const force = (200 - dist) / 200 * 0.02;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Swirl effect
        const swirlX = p.x - canvas.width * 0.5;
        const swirlY = p.y - canvas.height * 0.5;
        const swirlDist = Math.sqrt(swirlX * swirlX + swirlY * swirlY);
        if (swirlDist > 1) {
          p.vx += (-swirlY / swirlDist) * 0.01;
          p.vy += (swirlX / swirlDist) * 0.01;
        }

        // Damping
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Position update
        p.x += p.vx;
        p.y += p.vy;

        // Life-based opacity
        const lifeRatio = p.life / p.maxLife;
        let alpha = p.opacity;
        if (lifeRatio < 0.1) alpha *= lifeRatio / 0.1;
        else if (lifeRatio > 0.8) alpha *= (1 - lifeRatio) / 0.2;

        // Draw particle with glow
        if (alpha > 0.01) {
          ctx.save();
          ctx.globalAlpha = alpha;
          
          // Outer glow
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 4);
          glow.addColorStop(0, `hsla(${p.hue}, 80%, 70%, ${alpha})`);
          glow.addColorStop(0.5, `hsla(${p.hue}, 60%, 50%, ${alpha * 0.3})`);
          glow.addColorStop(1, `hsla(${p.hue}, 40%, 30%, 0)`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
          ctx.fill();

          // Core
          ctx.fillStyle = `hsla(${p.hue}, 90%, 85%, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }

        // Remove dead particles
        if (p.life >= p.maxLife || p.x < -50 || p.x > canvas.width + 50 || p.y < -50 || p.y > canvas.height + 50) {
          particles.splice(i, 1);
        }
      }

      // Connect nearby particles
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.globalAlpha = (1 - dist / 100) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // Replenish particles
      while (particles.length < 60) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * Math.min(canvas.width, canvas.height) * 0.4;
        particles.push({
          x: canvas.width * 0.5 + Math.cos(angle) * dist,
          y: canvas.height * 0.5 + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.2 + 0.05,
          life: 0,
          maxLife: 500 + Math.random() * 1500,
          hue: 185 + Math.random() * 35,
        });
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0, background: '#050510' }}
    />
  );
}
