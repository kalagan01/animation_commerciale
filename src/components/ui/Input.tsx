import type { JSX } from 'hono/jsx';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time' | 'datetime-local';
  name: string;
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string | number;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  error?: string;
  helper?: string;
  icon?: string; // FontAwesome icon
  className?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  pattern?: string;
  autocomplete?: string;
  onInput?: string; // JavaScript code
  onChange?: string; // JavaScript code
}

export const Input = ({
  type = 'text',
  name,
  id,
  label,
  placeholder,
  value,
  required = false,
  disabled = false,
  readonly = false,
  error,
  helper,
  icon,
  className = '',
  min,
  max,
  step,
  pattern,
  autocomplete,
  onInput,
  onChange
}: InputProps): JSX.Element => {
  
  const inputId = id || name;
  const hasError = !!error;
  
  const inputClasses = `
    w-full px-4 py-2 min-h-[44px]
    border-2 rounded-lg
    text-gray-900 placeholder-gray-400
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-1
    ${hasError 
      ? 'border-red-500 focus:border-red-600 focus:ring-red-500' 
      : 'border-gray-300 focus:border-primary focus:ring-primary'
    }
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    ${readonly ? 'bg-gray-50' : ''}
    ${icon ? 'pl-10' : ''}
    ${className}
  `;
  
  return (
    <div class="form-group mb-4">
      {label && (
        <label 
          for={inputId} 
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span class="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div class="relative">
        {icon && (
          <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <i class={icon}></i>
          </div>
        )}
        
        <input
          type={type}
          name={name}
          id={inputId}
          class={inputClasses}
          placeholder={placeholder}
          value={value}
          required={required}
          disabled={disabled}
          readonly={readonly}
          min={min}
          max={max}
          step={step}
          pattern={pattern}
          autocomplete={autocomplete}
          oninput={onInput}
          onchange={onChange}
        />
      </div>
      
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
