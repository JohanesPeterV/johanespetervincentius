import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";

import * as THREE from "three";

export type Rotating3dModelProps = {
  path: string;
  position?: THREE.Vector3Like;
  appearsRandomly?: boolean
};

export default function Rotating3dModel({
  path,
  position = new THREE.Vector3(-10, 0, 0),
}: Rotating3dModelProps) {
  const { scene } = useGLTF(path);
  const modelRef = useRef<THREE.Group>(null);
  useEffect(() => {
    scene.scale.set(0.7, 0.7, 0.7);

    scene.rotation.y = Math.PI / 2;

    scene.position.set(position.x, position.y, position.z);
  }, [scene, position]);

  useFrame((_, delta) => {
    if (!modelRef || !modelRef.current) {
      return;
    }
    modelRef.current.position.x += delta;

    // modelRef.current.rotation.x += delta;
    // modelRef.current.rotation.y += delta;
    // modelRef.current.rotation.z += delta;
     modelRef.current.rotateOnWorldAxis(new THREE.Vector3(0, 0, -1), 0.01)
  });

  return <primitive object={scene} ref={modelRef} />;
}
