// Logo component — SmartSeat Mobility Branding

import { Bus, Sparkles } from 'lucide-react';
import './NavbarFooter.css';

/**
 * size: 'sm' | 'md' | 'lg' | 'xl'
 * variant: 'dark' (default, white text on dark bg) | 'light' (dark text on light bg)
 */
const Logo = ({ size = 'md', variant = 'dark', className = '' }) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`ss-logo ${className}`}>
      {/* icon container */}
      <div className="ss-logo__icon">
        <Bus className={iconSizes[size]} />
        <Sparkles className="ss-logo__spark" aria-hidden="true" />
      </div>

      {/* wordmark */}
      <div className="ss-logo__wordmark">
        <span className={`ss-logo__name ${textSizes[size]} ${variant === 'light' ? 'ss-logo__name--light' : ''}`}>
          SMART<span className="ss-logo__accent">SEAT</span>
        </span>
        <span className="ss-logo__sub">SMART MOBILITY</span>
      </div>
    </div>
  );
};

export default Logo;
