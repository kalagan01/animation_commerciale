import type { JSX } from 'hono/jsx';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: string; // JavaScript code to execute
  children: any;
  className?: string;
  icon?: string; // FontAwesome icon class
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  children,
  className = '',
  icon
}: ButtonProps): JSX.Element => {
  
  const baseClasses = 'btn transition-all duration-200 font-medium rounded-lg inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[52px]'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  const finalClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`;
  
  return (
    <button
      type={type}
      class={finalClasses}
      disabled={disabled || loading}
      onclick={onClick}
    >
      {loading ? (
        <>
          <i class="fas fa-spinner fa-spin"></i>
          <span>Chargement...</span>
        </>
      ) : (
        <>
          {icon && <i class={icon}></i>}
          {children}
        </>
      )}
    </button>
  );
};
