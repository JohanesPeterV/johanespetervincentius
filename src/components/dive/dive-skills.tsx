'use client';

import { StackIceExhibit } from './stack-ice-exhibit';

export const DiveSkills = () => (
  <div className="px-4">
    <header>
      <p className="identity-tag type-meta">What I build with</p>
      <h2 className="work-section-title font-display">Skills</h2>
      <p className="type-meta mt-4 text-muted-foreground">
        Scroll to explore the stack.
      </p>
    </header>
    <StackIceExhibit />
  </div>
);
