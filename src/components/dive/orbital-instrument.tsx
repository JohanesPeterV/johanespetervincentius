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
        <meshBasicMaterial color={palette.accent} transparent opacity={0.2} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.65, 48, 32]} />
        <meshStandardMaterial
          color={palette.celestial}
          emissive={palette.accent}
          emissiveIntensity={0.12}
          metalness={0.05}
          roughness={0.85}
        />
      </mesh>
    </group>
  );
}
