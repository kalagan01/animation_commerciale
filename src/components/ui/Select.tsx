import type { JSX } from 'hono/jsx';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  name: string;
  id?: string;
  label?: string;
  options: SelectOption[];
  value?: string | number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helper?: string;
  multiple?: boolean;
  className?: string;
  onChange?: string;
}

export const Select = ({
  name,
  id,
  label,
  options,
  value,
  placeholder = 'Sélectionnez une option',
  required = false,
  disabled = false,
  error,
  helper,
  multiple = false,
  className = '',
  onChange
}: SelectProps): JSX.Element => {
  
  const selectId = id || name;
  const hasError = !!error;
  
  const selectClasses = `
    w-full px-4 py-2 min-h-[44px]
    border-2 rounded-lg
    text-gray-900
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-1
    ${hasError 
      ? 'border-red-500 focus:border-red-600 focus:ring-red-500' 
      : 'border-gray-300 focus:border-primary focus:ring-primary'
    }
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white cursor-pointer'}
    ${className}
  `;
  
  return (
    <div class="form-group mb-4">
      {label && (
        <label 
          for={selectId} 
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span class="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        name={name}
        id={selectId}
        class={selectClasses}
        required={required}
        disabled={disabled}
        multiple={multiple}
        onchange={onChange}
      >
        {!multiple && placeholder && (
          <option value="" disabled selected={!value}>
            {placeholder}
          </option>
        )}
        
        {options.map((option) => (
          <option 
            value={option.value}
            disabled={option.disabled}
            selected={value === option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p class="mt-1 text-sm text-red-600">
          <i class="fas fa-exclamation-circle mr-1"></i>
          {error}
        </p>
      )}
      
      {helper && !error && (
        <p class="mt-1 text-sm text-gray-500">
          {helper}
        </p>
      )}
    </div>
  );
};
