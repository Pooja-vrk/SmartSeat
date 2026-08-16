// Reusable Input component
import { forwardRef } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const Input = forwardRef(({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  icon: Icon,
  showPasswordToggle = false,
  onPasswordToggle,
  showPassword = false,
  ...props
}, ref) => {
  const inputStyles = `
    w-full px-4 py-2.5 rounded-lg border
    ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'}
    focus:outline-none focus:ring-2 focus:border-transparent
    transition-all duration-200
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    ${Icon ? 'pl-10' : ''}
  `;

  const renderPasswordToggle = () => {
    if (!showPasswordToggle) return null;
    
    return (
      <button
        type="button"
        onClick={onPasswordToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    );
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="mb-1.5 text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        
        <input
          ref={ref}
          type={showPassword ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={inputStyles}
          {...props}
        />
        
        {renderPasswordToggle()}
      </div>
      
      {error && (
        <div className="mt-1 flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
