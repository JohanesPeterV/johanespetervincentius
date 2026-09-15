'use client';

import { Center } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Group, MathUtils } from 'three';

import { useMediaQuery } from '@/hooks/use-media-query';

export const IceScrollRotation = ({ children }: { children: ReactNode }) => {
  const groupRef = useRef<Group>(null);
  const { gl, invalidate } = useThree();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // REASON: native scrolling and the journey's chapter translation both move
  // the exhibit through the viewport; wake its demand canvas for either input.
  useEffect(() => {
    const chapter = gl.domElement.closest('[data-section-scroll]');
    const handleScroll = () => invalidate();
    chapter?.addEventListener('scroll', handleScroll, { passive: true });
    const observer = new MutationObserver(handleScroll);
    if (chapter) {
      observer.observe(chapter, {
        attributes: true,
        attributeFilter: ['style'],
      });
    }
    invalidate();
    return () => {
      chapter?.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [gl, invalidate]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    const bounds = gl.domElement.getBoundingClientRect();
    const progress = MathUtils.clamp(
      (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height),
      0,
      1,
    );
    const angle = reducedMotion ? 0 : (progress - 0.5) * Math.PI * 2;
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
