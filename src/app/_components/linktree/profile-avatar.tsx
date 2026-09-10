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
          pathLength={1}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          className="profile-avatar-rim-secondary"
          d="M48 118H89C105 118 118 105 118 89V48"
          pathLength={1}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <g
          className="profile-coffee-mug"
          transform="translate(3 15) scale(0.88)"
        >
          <g className="profile-coffee-steam">
            <path d="M17 83C14 79 20 77 17 72" />
            <path d="M23.5 81C20.5 77 26.5 75 23.5 70" />
            <path d="M30 83C27 79 33 77 30 72" />
          </g>
          <path
            className="profile-coffee-cup"
            d="M35 95C44 95 44 119 35 120V116C39 114 40 102 35 100Z"
          />
          <path
            className="profile-coffee-cup"
            d="M8.5 87.5C5.7 97.5 5.7 111 8 121C10 126.5 35 126.5 37 121C39.3 111 39.3 97.5 36.5 87.5Z"
          />
          <path
            className="profile-coffee-shade"
            d="M31 89C34 100 35 114 32 122C29 125 16 125 12 123C19 127 35 125 37 121C39.3 111 39.3 97.5 36.5 87.5Z"
          />
          <ellipse
            className="profile-coffee-emblem"
            cx="22.5"
            cy="113"
            rx="12"
            ry="10.5"
          />
          <ellipse
            className="profile-coffee-cup"
            cx="22.5"
            cy="87.5"
            rx="14"
            ry="3.3"
          />
          <ellipse
            className="profile-coffee-drink"
            cx="22.5"
            cy="87.8"
            rx="12.7"
            ry="2.25"
          />
        </g>
      </svg>
    </div>
  );
}
