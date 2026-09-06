import type { DivePalette } from './dive-palette';

type OrbitalInstrumentParams = {
  palette: DivePalette;
};

export default function OrbitalInstrument({
  palette,
}: OrbitalInstrumentParams) {
  return (
    <group>
      <mesh rotation={[1.1, 0.25, -0.5]}>
        <torusGeometry args={[1.25, 0.009, 6, 120]} />
        <meshBasicMaterial
          color={palette.accent}
          transparent
          opacity={0.65}
          toneMapped={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.65, 48, 32]} />
        <meshStandardMaterial
          color={palette.highlight}
          emissive={palette.highlight}
          emissiveIntensity={0.2}
          metalness={0}
          roughness={0.6}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
