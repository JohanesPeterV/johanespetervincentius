import { useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
export default function Test() {
  const { scene } = useGLTF("/models/need_some_space/scene.gltf");
  return (
    <Canvas>
      <primitive object={scene} />
    </Canvas>
  );
}
