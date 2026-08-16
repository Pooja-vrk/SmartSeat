// Reusable Select component
import { forwardRef } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

const Select = forwardRef(({
  label,
  placeholder = 'Select an option',
  value,
  onChange,
  options = [],
  error,
  helperText,
  disabled = false,
  required = false,
  className = '',
  ...props
}, ref) => {
  const selectStyles = `
    w-full px-4 py-2.5 rounded-lg border
    ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'}
    focus:outline-none focus:ring-2 focus:border-transparent
    transition-all duration-200 appearance-none
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    bg-white
  `;

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="mb-1.5 text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={selectStyles}
          {...props}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
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

Select.displayName = 'Select';

export default Select;
