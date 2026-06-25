'use client';

import { useConfig } from '@/hooks/use-config';
import { getFluidThemeColors } from '@/lib/theme-colors';
import { useTheme } from 'next-themes';
import { ReactNode, useEffect, useRef } from 'react';

type CardGenesisParams = {
  children: ReactNode;
};

type Particle = {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  delay: number;
};

const CELL = 9;
const ASSEMBLE_MS = 1500;
const STAGGER_MS = 700;
const HARDEN_DELAY = 1100;
const HARDEN_MS = 900;
const TOTAL_MS = ASSEMBLE_MS + HARDEN_DELAY + HARDEN_MS;
const CARD_RGB = [20, 18, 24];

const easeOut = (value: number): number => {
  return 1 - Math.pow(1 - value, 3);
};

const clamp01 = (value: number): number => {
  return Math.min(Math.max(value, 0), 1);
};

const hexToRgb = (hex: string): number[] => {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
};

const buildParticles = (width: number, height: number): Particle[] => {
  const particles: Particle[] = [];
  const cols = Math.ceil(width / CELL);
  const rows = Math.ceil(height / CELL);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      particles.push({
        startX: (Math.random() - 0.5) * width * 3 + width / 2,
        startY: (Math.random() - 0.5) * height * 3 + height / 2,
        targetX: col * CELL + CELL / 2,
        targetY: row * CELL + CELL / 2,
        delay: Math.random() * STAGGER_MS,
      });
    }
  }

  return particles;
};

export default function CardGenesis({ children }: CardGenesisParams) {
  const { resolvedTheme } = useTheme();
  const [{ theme }] = useConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { fluidColor } = getFluidThemeColors(theme, resolvedTheme);

  // REASON: bridge to imperative 2D canvas requestAnimationFrame loop and resize subscription that cannot be expressed through React props
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const accent = hexToRgb(fluidColor);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];
    let cssWidth = 0;
    let cssHeight = 0;
    let raf = 0;
    let start = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      cssWidth = rect.width;
      cssHeight = rect.height;
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      particles = buildParticles(cssWidth, cssHeight);
    };

    const draw = (now: number) => {
      if (start === 0) {
        start = now;
      }

      const elapsed = now - start;
      const harden = easeOut(clamp01((elapsed - HARDEN_DELAY) / HARDEN_MS));
      const red = Math.round(accent[0] + (CARD_RGB[0] - accent[0]) * harden);
      const green = Math.round(accent[1] + (CARD_RGB[1] - accent[1]) * harden);
      const blue = Math.round(accent[2] + (CARD_RGB[2] - accent[2]) * harden);
      const radius = 0.6 + harden * CELL * 0.72;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;

      for (const particle of particles) {
        const assemble = easeOut(
          clamp01((elapsed - particle.delay) / ASSEMBLE_MS),
        );
        const x =
          particle.startX + (particle.targetX - particle.startX) * assemble;
        const y =
          particle.startY + (particle.targetY - particle.startY) * assemble;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (elapsed < TOTAL_MS) {
        raf = requestAnimationFrame(draw);
        return;
      }

      ctx.fillRect(0, 0, cssWidth, cssHeight);
    };

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [fluidColor]);

  return (
    <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/10">
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <div className="card-text relative flex flex-col items-center gap-8 p-8">
        {children}
      </div>
    </div>
  );
}
