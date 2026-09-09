'use client';

import Image from 'next/image';

import { useConfig } from '@/hooks/use-config';

export default function ProfilePortrait() {
  const [{ theme }] = useConfig();

  return (
    <div
      className="profile-avatar relative h-24 w-24 shrink-0 overflow-hidden"
      data-themed={theme === 'blue'}
    >
      <Image
        src="/peter2.jpg"
        alt="Portrait of Johanes Peter Vincentius"
        fill
        sizes="96px"
        priority
        className="object-cover"
      />
      <div className="profile-portrait-themed absolute inset-0">
        <Image
          src="/portrait-cyan-ultraviolet-background-v2.webp"
          alt=""
          fill
          sizes="96px"
          priority
          className="object-cover"
        />
        <Image
          src="/peter2.jpg"
          alt=""
          fill
          sizes="160px"
          priority
          className="profile-portrait-subject object-cover"
        />
      </div>
    </div>
  );
}
