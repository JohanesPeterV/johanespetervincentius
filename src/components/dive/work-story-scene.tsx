'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import type { RefObject } from 'react';
import { Group, Vector3 } from 'three';

import { WORK_EXPERIENCES } from '@/app/_components/work-experience/work-experiences';
import { WORK_STONE, narrativeStoneY } from './descent';
import type { MotionMode } from './descent';
import type { DivePalette } from './dive-palette';
import { workSectionOpacity } from './hero-handoff';
import {
  getWorkArtifactPose,
  getWorkLayout,
  workStoryPosition,
} from './work-story';
import {
  GiftArtifact,
  OrderingArtifact,
  ProduceArtifact,
  SystemsArtifact,
} from './work-story-artifacts';

type WorkStorySceneProps = {
  palette: DivePalette;
  progressRef: RefObject<number>;
  motionMode: MotionMode;
};

const ARTIFACTS = {
  gift: GiftArtifact,
  ordering: OrderingArtifact,
  produce: ProduceArtifact,
  systems: SystemsArtifact,
};

export default function WorkStoryScene({
  palette,
  progressRef,
  motionMode,
}: WorkStorySceneProps) {
  const groupsRef = useRef<(Group | null)[]>([]);
  const elapsedRef = useRef(0);
  const [point] = useState(() => new Vector3());

  useFrame(({ camera, size, viewport }, delta) => {
    const progress = progressRef.current;
    const layout = getWorkLayout(size.width, size.height);
    const position =
      motionMode === 'reduced'
        ? Math.round(workStoryPosition.current)
        : workStoryPosition.current;
    if (motionMode === 'full') {
      elapsedRef.current += Math.min(delta, 0.05);
    }
    groupsRef.current.forEach((group, index) => {
      if (!group) {
        return;
      }
      const offset = index - position;
      const pose = getWorkArtifactPose(offset);
      group.visible = workSectionOpacity(progress) >= 0.05 && pose.visible;
      if (!group.visible) {
        return;
      }
      const x = layout.modelX + offset * (layout.previewX - layout.modelX);
      point
        .set(
          (x / size.width) * 2 - 1,
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
      if (motionMode === 'full') {
        group.position.y += Math.sin(elapsedRef.current * 0.7 + index) * 0.045;
      }
      const worldWidth = viewport.getCurrentViewport(camera, point).width;
      group.scale.setScalar(
        (worldWidth * layout.modelWidth * pose.scale) / (size.width * 2.8),
      );
      group.rotation.set(0.12, pose.rotationY, pose.rotationZ);
    });
  }, -1);

  return (
    <group name="work-story-artifacts">
      {WORK_EXPERIENCES.map((job, index) => {
        const Artifact = ARTIFACTS[job.artifact];
        return (
          <group
            key={job.company}
            name={`work-artifact-${job.artifact}`}
            ref={(group) => {
              groupsRef.current[index] = group;
            }}
            visible={false}
          >
            <Artifact palette={palette} />
          </group>
        );
      })}
    </group>
  );
}
