import type { JSX } from 'hono/jsx';

interface TextareaProps {
  name: string;
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  rows?: number;
  maxLength?: number;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  error?: string;
  helper?: string;
  showCount?: boolean;
  className?: string;
  onInput?: string;
  onChange?: string;
}

export const Textarea = ({
  name,
  id,
  label,
  placeholder,
  value = '',
  rows = 4,
  maxLength,
  required = false,
  disabled = false,
  readonly = false,
  error,
  helper,
  showCount = false,
  className = '',
  onInput,
  onChange
}: TextareaProps): JSX.Element => {
  
  const textareaId = id || name;
  const hasError = !!error;
  const currentLength = value.toString().length;
  
  const textareaClasses = `
    w-full px-4 py-2
    border-2 rounded-lg
    text-gray-900 placeholder-gray-400
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-1
    resize-y
    ${hasError 
      ? 'border-red-500 focus:border-red-600 focus:ring-red-500' 
      : 'border-gray-300 focus:border-primary focus:ring-primary'
    }
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    ${readonly ? 'bg-gray-50' : ''}
    ${className}
  `;
  
  return (
    <div class="form-group mb-4">
      <div class="flex items-center justify-between mb-1">
        {label && (
          <label 
            for={textareaId} 
            class="block text-sm font-medium text-gray-700"
          >
            {label}
            {required && <span class="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {showCount && maxLength && (
          <span class="text-xs text-gray-500">
            {currentLength} / {maxLength}
          </span>
        )}
      </div>
      
      <textarea
        name={name}
        id={textareaId}
        class={textareaClasses}
        placeholder={placeholder}
        rows={rows}
        maxlength={maxLength}
        required={required}
        disabled={disabled}
        readonly={readonly}
        oninput={onInput}
        onchange={onChange}
      >{value}</textarea>
      
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
