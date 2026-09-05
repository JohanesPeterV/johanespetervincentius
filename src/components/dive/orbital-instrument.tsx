import type { DivePalette } from './dive-palette';

type OrbitalInstrumentParams = {
  palette: DivePalette;
};

export default function OrbitalInstrument({
  palette,
}: OrbitalInstrumentParams) {
  return (
    <group>
      <mesh rotation={[0.7, -0.35, 0.2]}>
        <torusGeometry args={[1.2, 0.045, 12, 100]} />
        <meshStandardMaterial
          color={palette.metal}
          metalness={0.65}
          roughness={0.24}
        />
      </mesh>
      <mesh rotation={[-0.5, 0.8, 0]}>
        <torusGeometry args={[1.02, 0.018, 8, 100]} />
        <meshStandardMaterial
          color={palette.accent}
          emissive={palette.accent}
          emissiveIntensity={0.65}
          metalness={0.35}
          roughness={0.3}
        />
      </mesh>
      <mesh rotation={[0.2, 0.25, -0.7]}>
        <torusGeometry args={[1.48, 0.009, 6, 120]} />
        <meshBasicMaterial color={palette.metal} transparent opacity={0.35} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.38, 40, 24]} />
        <meshStandardMaterial
          color={palette.metal}
          metalness={0.55}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[1.15, 0.32, 0.18]}>
        <sphereGeometry args={[0.09, 16, 12]} />
        <meshStandardMaterial
          color={palette.accent}
          emissive={palette.accent}
          emissiveIntensity={1.4}
        />
      </mesh>
    </group>
  );
}
