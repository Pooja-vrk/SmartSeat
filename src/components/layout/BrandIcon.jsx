// BrandIcon.jsx — SmartSeat Premium Futuristic Emblem
// Features: Futuristic electric coach bus + integrated cyan location pin + luminous road ribbon + violet orbital accent

const BrandIcon = ({ className = 'w-7 h-7', animated = false }) => {
  return (
    <svg
      viewBox="0 0 54 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block flex-shrink-0 transition-transform duration-300 ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Background Radial Glow */}
        <radialGradient id="iconGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0B2663" />
          <stop offset="70%" stopColor="#071C49" />
          <stop offset="100%" stopColor="#050B1D" />
        </radialGradient>

        {/* Cyan to Electric Blue Gradient */}
        <linearGradient id="iconCyanBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        {/* Luminous Road Gradient */}
        <linearGradient id="iconRoad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
          <stop offset="60%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>

        {/* Windshield Glass Tint */}
        <linearGradient id="iconWindshield" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Orbital Neon Violet Gradient */}
        <linearGradient id="iconOrbit" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>

      {/* Emblem Rounded Canvas */}
      <rect
        x="1.5"
        y="1.5"
        width="51"
        height="51"
        rx="14"
        fill="url(#iconGlow)"
        stroke="#1E293B"
        strokeWidth="1.2"
      />

      {/* Orbital Lighting Ring (Intelligent Connectivity) */}
      <ellipse
        cx="27"
        cy="25"
        rx="20"
        ry="12"
        fill="none"
        stroke="url(#iconOrbit)"
        strokeWidth="1.4"
        opacity="0.75"
        strokeDasharray="20 8"
        transform="rotate(-18 27 25)"
        className={animated ? 'animate-spin-slow' : ''}
      />

      {/* Futuristic Location Pin (Route Destination & Tracking) */}
      <path
        d="M 27 6 C 18.5 6, 12 12.8, 12 21.5 C 12 29, 20.5 38.5, 27 43.5 C 33.5 38.5, 42 29, 42 21.5 C 42 12.8, 35.5 6, 27 6 Z"
        fill="none"
        stroke="url(#iconCyanBlue)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="27" cy="18.5" r="2.8" fill="#22D3EE" />

      {/* Dynamic Luminous Road (Bottom Route) */}
      <path
        d="M 7 44 C 16 44, 21 37.5, 32 35 C 38.5 33.5, 43 36, 46.5 39"
        fill="none"
        stroke="url(#iconRoad)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M 12 46 C 18 46, 22 41, 32 38.5 C 37 37, 41 39.5, 44 42"
        fill="none"
        stroke="#22D3EE"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Futuristic Electric Coach Bus (Front 3/4 View) */}
      <g transform="translate(15, 20)">
        {/* Main Body */}
        <path
          d="M 5 2 C 10 1, 18 1.5, 20.5 3.8 C 22.5 5, 23.5 9, 23.5 16 C 23.5 17.5, 22.5 18.2, 21 18.2 L 3.5 18.2 C 2 18.2, 1 17.5, 1 15.5 C 1 9, 2 3.2, 5 2 Z"
          fill="#F1F5F9"
        />

        {/* Aerodynamic Roofline Accent */}
        <path
          d="M 5 2 C 10 1, 18 1.5, 20.5 3.8"
          fill="none"
          stroke="#3B82F6"
          strokeWidth="1.1"
          strokeLinecap="round"
        />

        {/* Panoramic Windshield */}
        <path
          d="M 4.2 4.2 C 8 3.2, 16.5 3.5, 19.8 5.2 C 20.8 6.2, 21 8.5, 21 10 C 16 10.2, 7 10, 3.5 9.5 C 3.3 7, 3.5 5, 4.2 4.2 Z"
          fill="url(#iconWindshield)"
        />

        {/* LED Headlights */}
        <path d="M 2.5 12.5 L 7 12.8" stroke="#22D3EE" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 16.5 13 L 21 12.5" stroke="#22D3EE" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8.5" y1="13" x2="15" y2="13" stroke="#38BDF8" strokeWidth="0.9" opacity="0.9" />

        {/* Bumper & Wheels */}
        <rect x="6" y="15.5" width="11.5" height="1.8" rx="0.9" fill="#071C49" />
        <rect x="3" y="17.8" width="3.5" height="2" rx="1" fill="#050B1D" />
        <rect x="17" y="17.8" width="3.5" height="2" rx="1" fill="#050B1D" />
      </g>
    </svg>
  );
};

export default BrandIcon;
