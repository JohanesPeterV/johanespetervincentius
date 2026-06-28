'use client';

import WorldTwo from '@/components/3d/world-two';
import { useConfig } from '@/hooks/use-config';
import { getFluidThemeColors } from '@/lib/theme-colors';
import { Canvas } from '@react-three/fiber';
import { useTheme } from 'next-themes';

const SKY_COLOR = '#0b0f17';

export default function WorldTwoBackground() {
  const { resolvedTheme } = useTheme();
  const [{ theme }] = useConfig();
  const { fluidColor } = getFluidThemeColors(theme, resolvedTheme);

  return (
    <div className="world-two-wipe fixed inset-0 z-[5]">
      <Canvas
        camera={{ fov: 42, near: 0.1, far: 100, position: [0, 0, 6] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={[SKY_COLOR]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[3, 4, 5]} intensity={45} color={fluidColor} />
        <pointLight position={[-3, -2, -2]} intensity={20} color="#ffffff" />
        <WorldTwo color={fluidColor} />
      </Canvas>
    </div>
  );
}
