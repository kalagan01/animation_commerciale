import type { JSX } from 'hono/jsx';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export const Loading = ({
  size = 'md',
  text,
  fullScreen = false,
  className = ''
}: LoadingProps): JSX.Element => {
  
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-8xl'
  };
  
  const containerClasses = fullScreen
    ? 'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm'
    : 'flex flex-col items-center justify-center p-8';
  
  return (
    <div class={`${containerClasses} ${className}`}>
      <div class={`${sizeClasses[size]} text-primary mb-4`}>
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      {text && (
        <p class="text-gray-600 text-lg font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

// Skeleton Loader Component
interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: boolean;
  className?: string;
}

export const Skeleton = ({
  width = 'w-full',
  height = 'h-4',
  rounded = false,
  className = ''
}: SkeletonProps): JSX.Element => {
  
  const roundedClass = rounded ? 'rounded-full' : 'rounded';
  
  return (
    <div 
      class={`${width} ${height} ${roundedClass} bg-gray-200 animate-pulse ${className}`}
    ></div>
  );
};
