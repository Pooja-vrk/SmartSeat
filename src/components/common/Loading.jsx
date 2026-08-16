// Loading component
import { Loader2 } from 'lucide-react';

const Loading = ({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false,
  className = '' 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const content = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`${sizes[size]} text-primary-600 animate-spin`} />
      {text && (
        <p className="mt-3 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export const Skeleton = ({ 
  className = '', 
  variant = 'default',
  count = 1 
}) => {
  const variants = {
    default: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`bg-gray-200 animate-pulse ${variants[variant]} ${className}`}
    />
  ));

  return <>{skeletons}</>;
};

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loading size="lg" text="Loading SmartSeat..." />
  </div>
);

export default Loading;
