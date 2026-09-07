import { RoundedBox } from '@react-three/drei';

import type { DivePalette } from './dive-palette';

type ArtifactProps = { palette: DivePalette };
type PaintedBoxProps = {
  size: [number, number, number];
  color: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
};

const PaintedBox = ({ size, color, position, rotation }: PaintedBoxProps) => (
  <RoundedBox
    args={size}
    radius={Math.min(...size) * 0.18}
    smoothness={3}
    position={position}
    rotation={rotation}
  >
    <meshStandardMaterial color={color} roughness={0.48} metalness={0.08} />
  </RoundedBox>
);

export const GiftArtifact = ({ palette }: ArtifactProps) => (
  <group>
    <PaintedBox
      size={[1.8, 1.2, 1.35]}
      position={[0, -0.35, 0]}
      color={palette.accent}
    />
    <PaintedBox
      size={[0.2, 1.23, 1.38]}
      position={[0, -0.35, 0]}
      color={palette.highlight}
    />
    <PaintedBox
      size={[1.83, 1.23, 0.2]}
      position={[0, -0.35, 0]}
      color={palette.highlight}
    />
    <group position={[0.04, 0.52, -0.04]} rotation={[0.04, -0.06, -0.08]}>
      <PaintedBox size={[1.96, 0.25, 1.51]} color={palette.accent} />
      <PaintedBox size={[0.22, 0.27, 1.53]} color={palette.highlight} />
      <PaintedBox size={[1.98, 0.27, 0.22]} color={palette.highlight} />
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.3, 0.33, 0]}
          rotation={[0.2, side * 0.3, side * -0.3]}
          scale={[1, 0.6, 1]}
        >
          <torusGeometry args={[0.33, 0.055, 8, 28]} />
          <meshStandardMaterial color={palette.highlight} roughness={0.4} />
        </mesh>
      ))}
    </group>
    <group position={[1.04, 0.04, 0.55]} rotation={[0.08, -0.16, -0.3]}>
      <PaintedBox size={[0.36, 0.5, 0.08]} color={palette.foreground} />
      <mesh position={[0, 0.13, 0.055]}>
        <torusGeometry args={[0.045, 0.016, 6, 16]} />
        <meshStandardMaterial color={palette.accent} />
      </mesh>
      <PaintedBox
        size={[0.19, 0.025, 0.025]}
        position={[0, -0.06, 0.045]}
        color={palette.metal}
      />
    </group>
  </group>
);

export const OrderingArtifact = ({ palette }: ArtifactProps) => (
  <group>
    <PaintedBox
      size={[1.05, 0.13, 0.78]}
      position={[-0.45, -0.9, 0]}
      color={palette.metal}
    />
    <PaintedBox
      size={[0.2, 0.55, 0.25]}
      position={[-0.45, -0.58, -0.1]}
      rotation={[-0.2, 0, 0]}
      color={palette.metal}
    />
    <group position={[-0.45, 0.18, 0]} rotation={[-0.17, 0.08, 0]}>
      <PaintedBox size={[1.22, 1.48, 0.2]} color={palette.accent} />
      <PaintedBox
        size={[1.03, 1.22, 0.045]}
        position={[0, 0.03, 0.12]}
        color={palette.surface}
      />
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.27, 0.29, 0.16]}>
          <PaintedBox size={[0.32, 0.32, 0.035]} color={palette.foreground} />
          <PaintedBox size={[0.15, 0.15, 0.045]} color={palette.accent} />
        </group>
      ))}
      <PaintedBox
        size={[0.32, 0.32, 0.035]}
        position={[-0.27, -0.2, 0.16]}
        color={palette.foreground}
      />
      {[0, 1, 2].map((index) => (
        <PaintedBox
          key={index}
          size={[0.1, 0.1, 0.04]}
          position={[0.16 + (index % 2) * 0.15, -0.1 - index * 0.13, 0.16]}
          color={palette.highlight}
        />
      ))}
      <PaintedBox
        size={[0.6, 0.08, 0.045]}
        position={[0, -0.47, 0.16]}
        color={palette.highlight}
      />
    </group>
    <group position={[0.76, 0.34, 0.05]} rotation={[0.08, -0.14, -0.14]}>
      <PaintedBox size={[0.55, 0.91, 0.065]} color={palette.foreground} />
      {[0, 1, 2, 3].map((index) => (
        <PaintedBox
          key={index}
          size={[index === 3 ? 0.2 : 0.34, 0.035, 0.025]}
          position={[0, 0.24 - index * 0.15, 0.045]}
          color={palette.accent}
        />
      ))}
    </group>
    <group position={[0.78, -0.7, 0.38]}>
      <mesh>
        <cylinderGeometry args={[0.53, 0.43, 0.09, 32]} />
        <meshStandardMaterial color={palette.foreground} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.11, 0]} scale={[1, 0.34, 1]}>
        <sphereGeometry args={[0.34, 16, 12]} />
        <meshStandardMaterial color={palette.highlight} roughness={0.65} />
      </mesh>
      <mesh position={[0.2, 0.17, 0.09]} scale={[1, 0.7, 0.8]}>
        <icosahedronGeometry args={[0.19, 1]} />
        <meshStandardMaterial color={palette.accent} roughness={0.65} />
      </mesh>
    </group>
  </group>
);

export const ProduceArtifact = ({ palette }: ArtifactProps) => (
  <group>
    <PaintedBox
      size={[2.16, 0.16, 1.25]}
      position={[0, -0.83, 0]}
      color={palette.metal}
    />
    {[-1, 1].map((side) => (
      <group key={side}>
        {[-0.55, -0.25, 0.05].map((height) => (
          <PaintedBox
            key={height}
            size={[2.16, 0.2, 0.12]}
            position={[0, height, side * 0.61]}
            color={palette.accent}
          />
        ))}
        <PaintedBox
          size={[0.13, 1.02, 1.25]}
          position={[side * 1.03, -0.39, 0]}
          color={palette.accent}
        />
        <PaintedBox
          size={[0.22, 0.96, 0.16]}
          position={[side * 0.9, -0.38, 0.64]}
          color={palette.highlight}
        />
      </group>
    ))}
    {[-0.62, 0, 0.61].map((x, index) => (
      <group key={x} position={[x, 0.22 + (index % 2) * 0.22, 0]}>
        <mesh scale={[1, 1.05, 0.95]}>
          <icosahedronGeometry args={[0.46, 1]} />
          <meshStandardMaterial
            color={index === 1 ? palette.accent : palette.highlight}
            roughness={0.7}
            flatShading
          />
        </mesh>
        <mesh position={[0.03, 0.46, 0]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.035, 0.045, 0.19, 8]} />
          <meshStandardMaterial color={palette.metal} />
        </mesh>
        <mesh
          position={[0.17, 0.49, 0]}
          rotation={[0.1, 0, -0.8]}
          scale={[0.09, 0.27, 0.06]}
        >
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color={palette.accent} roughness={0.6} />
        </mesh>
      </group>
    ))}
    <PaintedBox
      size={[0.51, 0.32, 0.04]}
      position={[0, -0.3, 0.71]}
      color={palette.foreground}
    />
    <PaintedBox
      size={[0.28, 0.04, 0.025]}
      position={[0, -0.3, 0.74]}
      color={palette.accent}
    />
  </group>
);

export const SystemsArtifact = ({ palette }: ArtifactProps) => (
  <group>
    {[-0.64, -0.08, 0.48].map((height, index) => (
      <group key={height} position={[-0.56, height, 0]}>
        <PaintedBox
          size={[1.13, 0.43, 1.05]}
          color={index === 1 ? palette.highlight : palette.accent}
        />
        <PaintedBox
          size={[0.88, 0.24, 0.045]}
          position={[0, 0, 0.55]}
          color={palette.surface}
        />
        {[-0.27, -0.12, 0.03].map((x) => (
          <PaintedBox
            key={x}
            size={[0.045, 0.12, 0.025]}
            position={[x, 0, 0.58]}
            color={palette.metal}
          />
        ))}
        <mesh position={[0.29, 0, 0.58]}>
          <sphereGeometry args={[0.045, 8, 6]} />
          <meshStandardMaterial
            color={palette.highlight}
            emissive={palette.highlight}
            emissiveIntensity={0.25}
          />
        </mesh>
      </group>
    ))}
    <group position={[0.71, -0.08, 0.05]}>
      {[-0.5, 0, 0.5].map((height) => (
        <group key={height} position={[0, height, 0]}>
          <mesh>
            <cylinderGeometry args={[0.43, 0.43, 0.36, 32]} />
            <meshStandardMaterial
              color={palette.metal}
              roughness={0.4}
              metalness={0.25}
            />
          </mesh>
          <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.39, 0.035, 8, 32]} />
            <meshStandardMaterial color={palette.highlight} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
    <PaintedBox
      size={[0.91, 0.055, 0.055]}
      position={[0.29, 0.99, 0]}
      color={palette.highlight}
    />
    <PaintedBox
      size={[0.055, 0.37, 0.055]}
      position={[-0.16, 0.82, 0]}
      color={palette.highlight}
    />
    <PaintedBox
      size={[0.055, 0.3, 0.055]}
      position={[0.74, 0.84, 0]}
      color={palette.highlight}
    />
    {[-0.16, 0.74].map((x) => (
      <mesh key={x} position={[x, 0.99, 0]}>
        <icosahedronGeometry args={[0.12, 1]} />
        <meshStandardMaterial color={palette.foreground} roughness={0.4} />
      </mesh>
    ))}
  </group>
);
