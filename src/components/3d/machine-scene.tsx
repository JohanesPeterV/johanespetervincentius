import { useCameraIntro } from '@/hooks/use-camera-intro';
import { useDragLook } from '@/hooks/use-drag-look';
import { useWorldTransition } from '@/hooks/use-world-transition';
import BinaryField from './binary-field';
import CommStreams from './comm-streams';
import { ORBIT_CENTER } from './orbit';
import OrbitSystem from './orbit-system';
import TransitionVeil from './transition-veil';
import WorldTwo from './world-two';

type MachineSceneParams = {
  accentColor: string;
};

export default function MachineScene({ accentColor }: MachineSceneParams) {
  useDragLook();
  useCameraIntro();
  const { world1Ref, world2Ref } = useWorldTransition();

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
      <group ref={world1Ref}>
        <group position={[ORBIT_CENTER[0], ORBIT_CENTER[1], ORBIT_CENTER[2]]}>
          <BinaryField color={accentColor} count={6000} />
        </group>
        <CommStreams color={accentColor} />
        <OrbitSystem />
      </group>
      <group
        ref={world2Ref}
        position={[ORBIT_CENTER[0], ORBIT_CENTER[1], ORBIT_CENTER[2]]}
        visible={false}
      >
        <WorldTwo color={accentColor} />
      </group>
      <TransitionVeil />
    </>
  );
}
