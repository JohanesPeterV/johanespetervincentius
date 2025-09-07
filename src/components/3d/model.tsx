import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
type ModelProps = {
  path: string;
  position?: THREE.Vector3Like;
  acceleration?: THREE.Vector3Like;
  scale?: THREE.Vector3Like | number;
  rotation?: THREE.Vector3Like;
  rotateOnAxis?: THREE.Vector3Like;
  rotateOnWorldAxis?: THREE.Vector3Like;
};

export default function Model({
  path,
  position = new THREE.Vector3(0, 0, 0),
  acceleration = new THREE.Vector3(0, 0, 0),
  scale = new THREE.Vector3(1, 1, 1),
  rotation = new THREE.Vector3(0, 0, 0),
  rotateOnAxis = new THREE.Vector3(0, 0, 0),
  rotateOnWorldAxis = new THREE.Vector3(0, 0, 0),
}: ModelProps) {
  const { scene } = useGLTF(path);
  const modelRef = useRef<THREE.Group>(null);

  useEffect(() => {
    scene.position.set(position.x, position.y, position.z);
    if (typeof scale == 'number') {
      scene.scale.set(scale, scale, scale);
    } else {
      scene.scale.set(scale.x, scale.y, scale.z);
    }
    scene.rotation.set(rotation.x, rotation.y, rotation.z);
  }, [
    position.x,
    position.y,
    position.z,
    rotation.x,
    rotation.y,
    rotation.z,
    scale,
    scene,
  ]);

  useFrame(() => {
    if (!modelRef.current) return;
    modelRef.current.rotateOnAxis(
      new THREE.Vector3(rotateOnAxis.x, rotateOnAxis.y, rotateOnAxis.z),
      0.01,
    );
    modelRef.current.rotateOnWorldAxis(
      new THREE.Vector3(
        rotateOnWorldAxis.x,
        rotateOnWorldAxis.y,
        rotateOnWorldAxis.z,
      ),
      0.01,
    );
    scene.position.add(acceleration);
  });

  return <primitive object={scene} ref={modelRef} />;
}
