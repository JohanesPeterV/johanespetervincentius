'use client';

import { Html, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useAtomValue } from 'jotai';
import { Component, Suspense, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Group, Vector3 } from 'three';

import { Button } from '@/components/ui/button';
import { WORK_STONE, narrativeStoneY } from './descent';
import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import Space65Keyboard from './space65-keyboard';
import { getWorkLayout, workChapterAtom } from './work-story';

type WorkKeyboardSceneProps = {
  palette: DivePalette;
  progressRef: React.RefObject<number>;
  motionMode: MotionMode;
};

class KeyboardBoundary extends Component<
  { children: ReactNode },
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
      <Html center>
        <div
          role="status"
          className="flex w-56 flex-col items-center gap-2 text-center text-foreground"
        >
          <p className="type-label">The keyboard could not load.</p>
          <p className="type-meta">{this.state.error.message}</p>
          <Button
            variant="outline"
            onClick={() => {
              useGLTF.clear('/models/space65-typing.glb');
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
  motionMode,
}: WorkKeyboardSceneProps) {
  const chapter = useAtomValue(workChapterAtom);
  const groupRef = useRef<Group>(null);
  const [point] = useState(() => new Vector3());

  useFrame(({ camera, size, viewport }) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    const progress = progressRef.current;
    group.visible = progress > 1.05 && progress < 2.5;
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
    <group ref={groupRef} visible={false}>
      <KeyboardBoundary>
        <Suspense
          fallback={
            <Html center>
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
            chapter={chapter}
          />
        </Suspense>
      </KeyboardBoundary>
      <Html center position={[0, -0.9, 0]} style={{ pointerEvents: 'none' }}>
        <p className="type-meta hidden whitespace-nowrap text-muted-foreground md:block">
          SPACE65 / THE DAILY DRIVER
        </p>
      </Html>
    </group>
  );
}
