'use client';

import { Html, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Component, Suspense, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { Group, Vector3 } from 'three';

import { Button } from '@/components/ui/button';
import { WORK_STONE, narrativeStoneY } from './descent';
import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import Space65Keyboard, { SPACE65_MODEL_URL } from './space65-keyboard';
import { getWorkLayout, workStoryPosition } from './work-story';
import { workSectionOpacity, workOverlayOpacity } from './hero-handoff';
import type { HeroHandoff } from './hero-handoff';

type WorkKeyboardSceneProps = {
  palette: DivePalette;
  progressRef: RefObject<number>;
  handoffRef: RefObject<HeroHandoff>;
  motionMode: MotionMode;
};

class KeyboardBoundary extends Component<
  { children: ReactNode; statusRef: RefObject<HTMLDivElement | null> },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error): { error: Error } {
    return { error };
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }
    return (
      <Html center ref={this.props.statusRef} style={{ visibility: 'hidden' }}>
        <div
          role="status"
          className="flex w-56 flex-col items-center gap-2 text-center text-foreground"
        >
          <p className="type-label">The keyboard could not load.</p>
          <p className="type-meta">{this.state.error.message}</p>
          <Button
            variant="outline"
            onClick={() => {
              useGLTF.clear(SPACE65_MODEL_URL);
              this.setState({ error: null });
            }}
          >
            Retry model
          </Button>
        </div>
      </Html>
    );
  }
}

export default function WorkKeyboardScene({
  palette,
  progressRef,
  handoffRef,
  motionMode,
}: WorkKeyboardSceneProps) {
  const groupRef = useRef<Group>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const [point] = useState(() => new Vector3());

  useFrame(({ camera, size, viewport }) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    const progress = progressRef.current;
    const opacity = workSectionOpacity(progress);
    group.visible = opacity >= 0.05;
    // REASON: Drei Html is a DOM portal and ignores parent group visibility;
    // loading/error controls must leave with the same chapter as the model.
    if (statusRef.current) {
      const statusOpacity = workOverlayOpacity(handoffRef.current);
      statusRef.current.style.opacity = String(statusOpacity);
      statusRef.current.style.visibility =
        statusOpacity >= 0.05 ? 'visible' : 'hidden';
      statusRef.current.inert = statusOpacity < 0.1;
    }
    const layout = getWorkLayout(size.width, size.height);
    // REASON: the model and editorial column need separate, predictable
    // screen space at every aspect ratio while retaining the journey's rise.
    point
      .set(
        (layout.modelX / size.width) * 2 - 1,
        1 - (layout.modelY / size.height) * 2,
        0.5,
      )
      .unproject(camera);
    point.sub(camera.position);
    point.multiplyScalar((WORK_STONE.z - camera.position.z) / point.z);
    point.add(camera.position);
    group.position.copy(point);
    group.position.y +=
      narrativeStoneY(progress, WORK_STONE.center) -
      narrativeStoneY(WORK_STONE.center, WORK_STONE.center);
    const worldWidth = viewport.getCurrentViewport(camera, point).width;
    group.scale.setScalar(
      (worldWidth * layout.modelWidth) / (size.width * 3.3),
    );
  }, -1);

  return (
    <group ref={groupRef} name="work-keyboard" visible={false}>
      <KeyboardBoundary statusRef={statusRef}>
        <Suspense
          fallback={
            <Html center ref={statusRef} style={{ visibility: 'hidden' }}>
              <p
                className="type-meta whitespace-nowrap text-muted-foreground"
                role="status"
              >
                Loading Space65...
              </p>
            </Html>
          }
        >
          <Space65Keyboard
            palette={palette}
            motionMode={motionMode}
            chapterRef={workStoryPosition}
          />
        </Suspense>
      </KeyboardBoundary>
    </group>
  );
}
