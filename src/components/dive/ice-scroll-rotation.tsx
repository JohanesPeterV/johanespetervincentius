'use client';

import { Center } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { ReactNode, RefObject } from 'react';
import { Group, MathUtils } from 'three';

import { useMediaQuery } from '@/hooks/use-media-query';

type IceScrollRotationProps = {
  children: ReactNode;
  progressRef: RefObject<number>;
};

export const IceScrollRotation = ({
  children,
  progressRef,
}: IceScrollRotationProps) => {
  const groupRef = useRef<Group>(null);
  const { gl, invalidate } = useThree();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // REASON: the demand canvas must wake when chapter scrolling changes its
  // shared progress; it stops rendering again once the rotation settles.
  useEffect(() => {
    const chapter = gl.domElement.closest('[data-section-scroll]');
    const handleScroll = () => invalidate();
    chapter?.addEventListener('scroll', handleScroll, { passive: true });
    invalidate();
    return () => chapter?.removeEventListener('scroll', handleScroll);
  }, [gl, invalidate]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    const angle = reducedMotion ? 0 : progressRef.current * Math.PI * 2;
    group.rotation.y = reducedMotion
      ? angle
      : MathUtils.damp(group.rotation.y, angle, 12, Math.min(delta, 0.05));
    if (Math.abs(group.rotation.y - angle) > 0.001) {
      invalidate();
    }
  });

  return (
    <group ref={groupRef}>
      <Center>{children}</Center>
    </group>
  );
};
