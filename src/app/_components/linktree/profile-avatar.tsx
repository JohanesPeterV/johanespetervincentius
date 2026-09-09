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
            d="M35 94H41C55 94 56 118 40 120H35V114H40C48 113 49 100 41 100H35Z"
          />
          <path
            className="profile-coffee-cup"
            d="M8 89H36C38 96 39 111 36.5 119Q35.5 124 31 125H13Q8.5 124 7.5 119C5 111 6 96 8 89Z"
          />
          <path
            className="profile-coffee-shade"
            d="M30 91C33 100 34 112 31 119Q29 123 17 124L13 125H31Q35.5 124 36.5 119C39 111 38 96 36 89Z"
          />
          <ellipse
            className="profile-coffee-drink"
            cx="22"
            cy="89"
            rx="14"
            ry="3.5"
          />
          <path
            className="profile-coffee-ice"
            d="M15 88L20 87L23 89L18 91ZM25 87L30 88L29 90L24 89Z"
          />
          <circle className="profile-coffee-emblem" cx="22" cy="108" r="6.5" />
        </g>
      </svg>
    </div>
  );
}
