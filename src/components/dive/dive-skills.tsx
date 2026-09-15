'use client';

import { STACK_GROUPS } from '@/app/_components/stack';
import { StackIceExhibit } from './stack-ice-exhibit';

export const DiveSkills = () => (
  <div className="px-4 pb-[75svh]">
    <header>
      <p className="identity-tag type-meta">What I build with</p>
      <h2 className="work-section-title font-display">Skills</h2>
      <p className="type-meta mt-4 text-muted-foreground">
        Scroll to explore the stack.
      </p>
    </header>
    {STACK_GROUPS.map((group, index) => (
      <StackIceExhibit key={group.id} group={group} index={index} />
    ))}
  </div>
);
