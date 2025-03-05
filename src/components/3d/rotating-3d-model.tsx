import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type Rotating3dModelProps = {
  path: string;
  position?: THREE.Vector3Like;
  chanceOfAppearing?: number 
};

export default function Rotating3dModel({
  path,
  position = new THREE.Vector3(-10, 0, 0),
  chanceOfAppearing ,
}: Rotating3dModelProps) {
  const { scene } = useGLTF(path);
  const modelRef = useRef<THREE.Group>(null);
  const [isVisible, setIsVisible] = useState(false); 

  useEffect(() => {
    if (chanceOfAppearing ) {
      const interval = setInterval(() => {
        if (Math.random() < chanceOfAppearing) {
          setIsVisible(true);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [chanceOfAppearing]);

  useEffect(() => {
    scene.scale.set(0.7, 0.7, 0.7);
    scene.rotation.y = Math.PI / 2;
    scene.position.set(position.x, position.y, position.z);
  }, [scene, position]);

  useFrame((_, delta) => {
    if (!modelRef.current || !isVisible) return;
    modelRef.current.position.x += delta;
    modelRef.current.rotateOnWorldAxis(new THREE.Vector3(0, 0, -1), 0.01);
  });

  return isVisible ? <primitive object={scene} ref={modelRef} /> : null;
}
