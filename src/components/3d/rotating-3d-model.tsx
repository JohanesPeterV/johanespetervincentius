import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";

import * as THREE from "three";

export type Rotating3dModelProps = {
  path: string;
  position?: THREE.Vector3Like;
};

export default function Rotating3dModel({
  path,
  position = new THREE.Vector3(-10, 0, 0),
}: Rotating3dModelProps) {
  const { scene } = useGLTF(path);
  const modelRef = useRef<THREE.Group>(null);
  const { size, camera } = useThree();
  useEffect(() => {
    scene.scale.set(0.7, 0.7, 0.7);

    scene.rotation.y = Math.PI / 2;

    scene.position.set(position.x, position.y, position.z);
  }, [scene]);

  useFrame((_, delta) => {
    if (!modelRef || !modelRef.current) {
      return;
    }
    modelRef.current.position.x += delta;

    const getMaxLengthOfModel = () => {
      if (!modelRef.current) return 0;
      const box = new THREE.Box3().setFromObject(modelRef.current);
      const modelSize = box.getSize(new THREE.Vector3());
      return Math.max(modelSize.x, modelSize.y, modelSize.z);
    };
    const maxLengthOfModel = getMaxLengthOfModel();

    const getScreenEdges = (): {
      screenLeftEdge: number;
      screenRightEdge: number;
    } => {
      if (!modelRef.current)
        return {
          screenLeftEdge: 0,
          screenRightEdge: 0,
        };
      modelRef.current.rotation.z += delta;
      const aspect = size.width / size.height;
      const frustumHeight =
        2 *
        Math.tan(
          (camera as THREE.PerspectiveCamera).fov * 0.5 * (Math.PI / 180)
        ) *
        camera.position.z;
      const frustumWidth = frustumHeight * aspect;
      const screenRightEdge = frustumWidth / 2;
      const screenLeftEdge = -screenRightEdge;
      return { screenLeftEdge, screenRightEdge };
    };
    const { screenLeftEdge, screenRightEdge } = getScreenEdges();
    if (modelRef.current.position.x > screenRightEdge + maxLengthOfModel) {
      modelRef.current.position.x = screenLeftEdge - maxLengthOfModel;
    }
  });

  return <primitive object={scene} ref={modelRef} />;
}
