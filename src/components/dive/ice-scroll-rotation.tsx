'use client';

import { Center } from '@react-three/drei';
import type { OnCenterCallbackProps } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Group, MathUtils, PerspectiveCamera } from 'three';

import { useMediaQuery } from '@/hooks/use-media-query';

const distanceToFitSphere = (
  radius: number,
  camera: PerspectiveCamera,
): number => {
  const verticalHalfFov = MathUtils.degToRad(camera.fov / 2);
  const horizontalHalfFov = Math.atan(
    Math.tan(verticalHalfFov) * camera.aspect,
  );
  return radius / Math.sin(Math.min(verticalHalfFov, horizontalHalfFov));
};

export const IceScrollRotation = ({ children }: { children: ReactNode }) => {
  const groupRef = useRef<Group>(null);
  const scrollAngle = useRef(0);
  const [centeredExhibit, setCenteredExhibit] =
    useState<OnCenterCallbackProps | null>(null);
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

  useFrame(({ camera }, delta) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    // REASON: the ice turns a full circle, so frame its rotation-invariant
    // bounding sphere on the canvas's narrower axis to keep every angle whole.
    if (centeredExhibit && camera instanceof PerspectiveCamera) {
      camera.position.setLength(
        distanceToFitSphere(centeredExhibit.boundingSphere.radius, camera),
      );
    }
    const bounds = gl.domElement.getBoundingClientRect();
    const progress = MathUtils.clamp(
      (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height),
      0,
      1,
    );
    const targetScroll = reducedMotion ? 0 : (progress - 0.5) * Math.PI * 2;
    // REASON: an idle demand canvas reports the whole pause as its next delta;
    // capping it keeps the first turn after a pause animated instead of snapping.
    const step = Math.min(delta, 1 / 30);
    // REASON: wheel input moves the chapter in whole steps; easing the scroll
    // angle turns the ice through each step instead of jumping between poses.
    scrollAngle.current = MathUtils.damp(
      scrollAngle.current,
      targetScroll,
      10,
      step,
    );
    if (Math.abs(targetScroll - scrollAngle.current) > 0.001) {
      invalidate();
    }
    group.rotation.y = scrollAngle.current;
  });

  return (
    <group ref={groupRef}>
      {/* REASON: Center re-measures every vertex of the 858k-vertex model when
      onCentered changes identity; the state setter stays stable. */}
      <Center onCentered={setCenteredExhibit}>{children}</Center>
    </group>
  );
};
