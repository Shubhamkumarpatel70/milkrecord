import React from 'react';

function CustomLogo({ size = 'medium', className = '', showText = true, variant = 'default' }) {
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

  // Custom logo configuration
  // Using your existing logo files
  const customLogoConfig = {
    // Option 1: Use your existing logo files
    imageSrc: '/logo192.png', // Your existing logo file
    
    // Option 2: Use a custom SVG
    // Uncomment and replace with your custom SVG
    // customSvg: `<svg>...</svg>`,
    
    // Option 3: Use text-only logo (fallback)
    textOnly: {
      text: 'MILK RECORD',
      color: '#4F46E5'
    }
  };

  // Using your existing logo image
  if (customLogoConfig.imageSrc) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <img 
          src={customLogoConfig.imageSrc} 
          alt="Milk Record Logo" 
          className={`${sizeClasses[size]} object-contain`}
        />
        {showText && (
          <span className={`font-bold text-blue-600 ${textSizeClasses[size]}`}>
            {customLogoConfig.textOnly.text}
          </span>
        )}
      </div>
    );
  }

  // If you have a custom SVG, uncomment this section
  /*
  if (customLogoConfig.customSvg) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div 
          className={`${sizeClasses[size]} text-blue-600`}
          dangerouslySetInnerHTML={{ __html: customLogoConfig.customSvg }}
        />
        {showText && (
          <span className={`font-bold text-blue-600 ${textSizeClasses[size]}`}>
            {customLogoConfig.textOnly.text}
          </span>
        )}
      </div>
    );
  }
  */

  // Default logo (text-only for now)
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showText && (
        <span 
          className={`font-bold ${textSizeClasses[size]}`}
          style={{ color: customLogoConfig.textOnly.color }}
        >
          {customLogoConfig.textOnly.text}
        </span>
      )}
    </div>
  );
}

export default CustomLogo; 