// Reusable Card component
import { forwardRef } from 'react';

const Card = forwardRef(({
  children,
  className = '',
  hover = false,
  glass = false,
  padding = 'md',
  shadow = 'md',
  ...props
}, ref) => {
  const baseStyles = 'rounded-xl transition-all duration-200';
  
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
    xl: 'p-8'
  };
  
  const shadowStyles = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };
  
  const hoverStyles = hover ? 'hover:shadow-lg hover:-translate-y-0.5' : '';
  const glassStyles = glass ? 'glass-effect' : 'bg-white';
  
  return (
    <div
      ref={ref}
      className={`${baseStyles} ${paddingStyles[padding]} ${shadowStyles[shadow]} ${hoverStyles} ${glassStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>
    {children}
  </div>
);

export default Card;
