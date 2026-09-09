import Image from 'next/image';

export default function ProfileAvatar() {
  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <Image
        src="/peter2.jpg"
        alt="Portrait of Johanes Peter Vincentius"
        width={192}
        height={192}
        priority
        className="profile-avatar h-24 w-24 object-cover"
      />
      <svg
        viewBox="0 0 128 128"
        fill="none"
        aria-hidden="true"
        className="profile-avatar-frame pointer-events-none absolute -inset-2 h-32 w-32 overflow-visible"
      >
        <rect
          className="profile-avatar-track"
          x="12"
          y="12"
          width="104"
          height="104"
          rx="26"
        />
        <path
          className="profile-avatar-rim-primary"
          d="M10 80V38C10 22 22 10 38 10H85"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          className="profile-avatar-rim-secondary"
          d="M48 118H89C105 118 118 105 118 89V48"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <g className="profile-coffee-mug">
          <path
            className="profile-coffee-cup"
            d="M36 96H42C59 96 59 117 42 117H36V111H42C50 111 50 102 42 102H36Z"
          />
          <path
            className="profile-coffee-cup"
            d="M7 93H39C39 100 44 104 42 113C40 130 6 130 4 113C2 104 7 100 7 93Z"
          />
          <path
            className="profile-coffee-shade"
            d="M32 95C32 102 37 104 35 114C34 121 26 125 14 122C27 132 41 124 42 113C44 104 39 100 39 93Z"
          />
          <ellipse
            className="profile-coffee-drink"
            cx="23"
            cy="93"
            rx="16"
            ry="5"
          />
          <path
            className="profile-coffee-ice"
            d="M15 91L20 90L23 93L18 95ZM25 90L30 91L29 94L24 93Z"
          />
          <circle className="profile-coffee-emblem" cx="23" cy="111" r="6.5" />
        </g>
      </svg>
    </div>
  );
}
