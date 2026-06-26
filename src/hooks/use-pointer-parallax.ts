import { useEffect, useRef } from 'react';

type PointerOffset = {
  x: number;
  y: number;
};

export function usePointerParallax() {
  const pointerRef = useRef<PointerOffset>({ x: 0, y: 0 });

  // REASON: feed global pointer movement into the imperative R3F useFrame camera loop; it cannot arrive through React props
  useEffect(() => {
    const handlePointerMove = (event: PointerEvent): void => {
      pointerRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  return pointerRef;
}
