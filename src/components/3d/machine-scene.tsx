import { useDragLook } from '@/hooks/use-drag-look';
import AmbientEmbers from './ambient-embers';
import OrbitSystem from './orbit-system';

type MachineSceneParams = {
  accentColor: string;
};

export default function MachineScene({ accentColor }: MachineSceneParams) {
  useDragLook();

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
    </>
  );
}
