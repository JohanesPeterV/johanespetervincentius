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
        className="profile-avatar-frame pointer-events-none absolute -inset-2 h-32 w-32"
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
          className="profile-avatar-primary"
          d="M9 66V38C9 22 22 9 38 9H70"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          className="profile-avatar-secondary"
          d="M119 62V90C119 106 106 119 90 119H58"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <rect
          className="profile-avatar-trace"
          x="12"
          y="12"
          width="104"
          height="104"
          rx="26"
          pathLength="100"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="6 44"
        />
        <g className="profile-avatar-spark profile-avatar-spark-secondary">
          <path d="m108 5 4.5 10.5L123 20l-10.5 4.5L108 35l-4.5-10.5L93 20l10.5-4.5Z" />
          <path
            className="profile-avatar-spark-core"
            d="m108 12 2.5 5.5L116 20l-5.5 2.5L108 28l-2.5-5.5L100 20l5.5-2.5Z"
          />
        </g>
        <g className="profile-avatar-spark profile-avatar-spark-primary">
          <path d="m19 99 3.5 8.5L31 111l-8.5 3.5L19 123l-3.5-8.5L7 111l8.5-3.5Z" />
          <path
            className="profile-avatar-spark-core"
            d="m19 105 1.8 4.2L25 111l-4.2 1.8L19 117l-1.8-4.2L13 111l4.2-1.8Z"
          />
        </g>
      </svg>
    </div>
  );
}
