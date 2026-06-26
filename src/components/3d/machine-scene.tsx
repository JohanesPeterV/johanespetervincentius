import { OrbitControls } from '@react-three/drei';
import AmbientEmbers from './ambient-embers';
import OrbitSystem from './orbit-system';

type MachineSceneParams = {
  accentColor: string;
};

export default function MachineScene({ accentColor }: MachineSceneParams) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <spotLight
        position={[4, 5, 4]}
        intensity={120}
        angle={0.6}
        penumbra={0.8}
        color={accentColor}
      />
      <pointLight position={[-4, 1, -3]} intensity={70} color={accentColor} />
      <pointLight position={[0, 2.5, 5]} intensity={25} color="#ffffff" />
      <AmbientEmbers color={accentColor} count={420} />
      <OrbitSystem />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.5}
        minPolarAngle={Math.PI / 2 - 0.5}
        maxPolarAngle={Math.PI / 2 + 0.5}
        minAzimuthAngle={-0.7}
        maxAzimuthAngle={0.7}
      />
    </>
  );
}
