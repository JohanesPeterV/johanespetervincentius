import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type LookAngles = {
  yaw: number;
  pitch: number;
};

type DragState = {
  active: boolean;
  x: number;
  y: number;
};

const SENSITIVITY = 0.0045;
// REASON: yaw is unclamped for full 360 first-person turning; only pitch is capped just shy of straight up/down to avoid flipping over
const MAX_PITCH = 1.45;
const LOOK_DAMP = 8;

export function useDragLook() {
  const targetRef = useRef<LookAngles>({ yaw: 0, pitch: 0 });
  const currentRef = useRef<LookAngles>({ yaw: 0, pitch: 0 });
  const dragRef = useRef<DragState>({ active: false, x: 0, y: 0 });

  // REASON: bridge drag gestures into the imperative R3F camera loop; listen on window so dragging anywhere on the screen turns the view, not just the strips beside the card
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent): void => {
      dragRef.current.active = true;
      dragRef.current.x = event.clientX;
      dragRef.current.y = event.clientY;
      document.body.style.cursor = 'grabbing';
    };

    const handlePointerMove = (event: PointerEvent): void => {
      if (!dragRef.current.active) {
        return;
      }

      const deltaX = event.clientX - dragRef.current.x;
      const deltaY = event.clientY - dragRef.current.y;
      dragRef.current.x = event.clientX;
      dragRef.current.y = event.clientY;

      targetRef.current.yaw -= deltaX * SENSITIVITY;
      targetRef.current.pitch = THREE.MathUtils.clamp(
        targetRef.current.pitch - deltaY * SENSITIVITY,
        -MAX_PITCH,
        MAX_PITCH,
      );
    };

    const handlePointerUp = (): void => {
      dragRef.current.active = false;
      document.body.style.cursor = '';
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  useFrame((state, delta) => {
    currentRef.current.yaw = THREE.MathUtils.damp(
      currentRef.current.yaw,
      targetRef.current.yaw,
      LOOK_DAMP,
      delta,
    );
    currentRef.current.pitch = THREE.MathUtils.damp(
      currentRef.current.pitch,
      targetRef.current.pitch,
      LOOK_DAMP,
      delta,
    );

    state.camera.rotation.order = 'YXZ';
    state.camera.rotation.y = currentRef.current.yaw;
    state.camera.rotation.x = currentRef.current.pitch;
  });
}
