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
          className="profile-avatar-rim"
          d="M48 118H89C105 118 118 105 118 89V48"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <g className="profile-coffee-steam profile-coffee-steam-side">
          <path d="M17 96C23 87 8 85 11 75C14 67 3 64 4 55C5 46 18 47 18 39C18 32 7 33 8 25C9 18 17 16 23 19C15 18 13 25 20 28C34 33 27 45 19 49C11 52 13 58 18 63C27 73 15 78 20 84C23 89 22 93 17 96Z" />
          <path
            className="profile-coffee-steam-fold"
            d="M15 83C7 68 21 73 13 60C5 47 26 46 23 36M14 29C10 26 10 21 16 20"
          />
        </g>
        <g className="profile-coffee-steam profile-coffee-steam-crown">
          <path d="M20 24C18 13 31 14 30 8C29 3 22 5 23 9C17 2 29-3 36 4C41 10 36 16 31 17C39 22 48 16 45 10C38-4 58-5 64 3C56-1 49 3 53 9C60 20 49 29 39 27C30 27 28 20 20 24Z" />
          <path d="M54 4C66-4 87 2 82 13C80 19 72 16 71 12C77 16 79 9 74 7C66 2 58 11 63 17C74 29 92 14 101 18C109 23 119 20 116 15C114 12 107 12 107 7C108 2 113 3 114 5C109 4 110 8 115 10C132 15 128 27 116 29C98 32 99 22 92 24C77 32 59 31 54 20C51 14 57 9 54 4Z" />
          <path
            className="profile-coffee-steam-fold"
            d="M29 6C35 9 29 13 27 15M49 6C43 14 53 15 45 22M62 5C70 0 80 5 79 10M60 18C66 29 84 24 94 21C108 18 104 30 119 23"
          />
        </g>
        <g className="profile-coffee-mug">
          <path
            className="profile-coffee-cup"
            d="M36 96H41C55 96 55 116 41 116H36V111H41C47 111 47 101 41 101H36Z"
          />
          <path
            className="profile-coffee-cup"
            d="M7 93H39V119C39 127 7 127 7 119Z"
          />
          <path
            className="profile-coffee-shade"
            d="M32 95V117C32 122 20 123 12 122C20 128 39 125 39 119V93Z"
          />
          <ellipse
            className="profile-coffee-drink"
            cx="23"
            cy="93"
            rx="16"
            ry="5"
          />
          <path
            className="profile-coffee-foam-fold"
            d="M14 93C18 89 32 90 30 93C28 96 20 95 21 93C22 92 25 92 26 93"
          />
          <circle className="profile-coffee-emblem" cx="23" cy="111" r="6.5" />
        </g>
      </svg>
    </div>
  );
}
