// Logo component
import { Bus } from 'lucide-react';

const Logo = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`gradient-primary rounded-lg p-2 ${sizes[size]}`}>
        <Bus className="text-white" />
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
        SmartSeat
      </span>
    </div>
  );
};

export default Logo;
