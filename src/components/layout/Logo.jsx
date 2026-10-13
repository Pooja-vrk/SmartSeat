// Logo component — SmartSeat Mobility Branding
// Upgraded with premium futuristic electric coach emblem & geometric typography

import BrandIcon from './BrandIcon';
import './NavbarFooter.css';

/**
 * size: 'sm' | 'md' | 'lg' | 'xl'
 * variant: 'dark' (default, white text on dark bg) | 'light' (dark text on light bg)
 */
const Logo = ({ size = 'md', variant = 'dark', className = '', showTagline = true }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`ss-logo ${className}`}>
      {/* Brand Emblem */}
      <BrandIcon className={iconSizes[size]} />

      {/* Wordmark */}
      <div className="ss-logo__wordmark">
        <span className={`ss-logo__name font-black ${textSizes[size]} ${variant === 'light' ? 'ss-logo__name--light' : ''}`}>
          SMART<span className="ss-logo__accent">SEAT</span>
        </span>
        {showTagline && (
          <span className="ss-logo__sub">
            BOOK · TRACK · TRAVEL
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;
