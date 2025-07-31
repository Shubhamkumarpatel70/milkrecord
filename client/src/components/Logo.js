import React from 'react';

function Logo({ size = 'medium', className = '', showText = true, variant = 'default' }) {
  // Size variants
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xlarge: 'w-20 h-20'
  };

  // Text size variants
  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-xl',
    xlarge: 'text-2xl'
  };

  // Logo variants
  const logoVariants = {
    default: {
      icon: (
        <svg className={`${sizeClasses[size]} text-blue-600`} fill="currentColor" viewBox="0 0 24 24">
          {/* Background circle */}
          <circle cx="12" cy="12" r="10" fill="#4F46E5" opacity="0.1"/>
          {/* Milk bottle */}
          <path d="M9 6h6v2h-6V6zm-1 3h8v12H8V9z" fill="#4F46E5"/>
          {/* Bottle neck */}
          <path d="M10 6h4v1h-4V6z" fill="#E5E7EB"/>
          {/* Milk level */}
          <rect x="9" y="15" width="6" height="3" fill="#FEF3C7" rx="1"/>
          {/* Milk drop */}
          <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="#3B82F6"/>
          {/* Chart bars */}
          <rect x="8" y="18" width="1.5" height="2" fill="#10B981" rx="0.5"/>
          <rect x="10" y="17" width="1.5" height="3" fill="#10B981" rx="0.5"/>
          <rect x="12" y="16" width="1.5" height="4" fill="#10B981" rx="0.5"/>
          <rect x="14" y="15" width="1.5" height="5" fill="#10B981" rx="0.5"/>
        </svg>
      ),
      text: 'MILK RECORD'
    },
    simple: {
      icon: (
        <svg className={`${sizeClasses[size]} text-blue-600`} fill="currentColor" viewBox="0 0 24 24">
          {/* Background circle */}
          <circle cx="12" cy="12" r="10" fill="#4F46E5" opacity="0.1"/>
          {/* Milk bottle */}
          <path d="M9 6h6v2h-6V6zm-1 3h8v12H8V9z" fill="#4F46E5"/>
          {/* Milk drop */}
          <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="#3B82F6"/>
        </svg>
      ),
      text: 'MR'
    },
    textOnly: {
      icon: null,
      text: 'MILK RECORD'
    }
  };

  const currentVariant = logoVariants[variant] || logoVariants.default;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {currentVariant.icon && (
        <div className="flex-shrink-0">
          {currentVariant.icon}
        </div>
      )}
      {showText && currentVariant.text && (
        <span className={`font-bold text-blue-600 ${textSizeClasses[size]}`}>
          {currentVariant.text}
        </span>
      )}
    </div>
  );
}

export default Logo; 