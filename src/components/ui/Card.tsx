import type { JSX } from 'hono/jsx';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: any;
  footer?: any;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hoverable?: boolean;
  onClick?: string;
}

export const Card = ({
  title,
  subtitle,
  children,
  footer,
  className = '',
  padding = 'md',
  shadow = 'md',
  border = true,
  hoverable = false,
  onClick
}: CardProps): JSX.Element => {
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };
  
  const borderClass = border ? 'border border-gray-200' : '';
  const hoverClass = hoverable ? 'hover:shadow-lg hover:border-primary transition-all duration-200 cursor-pointer' : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';
  
  const cardClasses = `
    card bg-white rounded-lg overflow-hidden
    ${paddingClasses[padding]}
    ${shadowClasses[shadow]}
    ${borderClass}
    ${hoverClass}
    ${clickableClass}
    ${className}
  `;
  
  return (
    <div class={cardClasses} onclick={onClick}>
      {(title || subtitle) && (
        <div class="card-header mb-4">
          {title && (
            <h3 class="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          )}
          {subtitle && (
            <p class="text-sm text-gray-600 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div class="card-body">
        {children}
      </div>
      
      {footer && (
        <div class="card-footer mt-4 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};
