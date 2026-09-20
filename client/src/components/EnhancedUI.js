import React from 'react';

// Enhanced Button Component
export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    icon = null,
    onClick,
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-medium hover:shadow-strong focus:ring-primary-500 hover:scale-105 active:scale-95',
        secondary: 'bg-gradient-to-r from-secondary-100 to-secondary-200 hover:from-secondary-200 hover:to-secondary-300 text-secondary-800 shadow-soft hover:shadow-medium focus:ring-secondary-500 hover:scale-105 active:scale-95',
        success: 'bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white shadow-medium hover:shadow-strong focus:ring-success-500 hover:scale-105 active:scale-95',
        danger: 'bg-gradient-to-r from-danger-500 to-danger-600 hover:from-danger-600 hover:to-danger-700 text-white shadow-medium hover:shadow-strong focus:ring-danger-500 hover:scale-105 active:scale-95',
        warning: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-medium hover:shadow-strong focus:ring-red-500 hover:scale-105 active:scale-95',
        outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 focus:ring-primary-500 hover:scale-105 active:scale-95',
        ghost: 'text-secondary-600 hover:bg-secondary-100 focus:ring-secondary-500 hover:scale-105 active:scale-95',
        gradient: 'bg-gradient-to-r from-primary-500 via-accent-500 to-success-500 hover:from-primary-600 hover:via-accent-600 hover:to-success-600 text-white shadow-medium hover:shadow-strong focus:ring-primary-500 hover:scale-105 active:scale-95'
    };

    const sizes = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-6 py-4 text-lg',
        xl: 'px-8 py-5 text-xl'
    };

    const handleClick = (e) => {
        if (onClick && !disabled && !loading) {
            // Add ripple effect
            const button = e.currentTarget;
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.className = 'absolute rounded-full bg-white/30 animate-ping pointer-events-none';

            button.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);

            onClick(e);
        }
    };

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} relative overflow-hidden`}
            disabled={disabled || loading}
            onClick={handleClick}
            aria-label={props['aria-label'] || (loading ? 'Loading...' : undefined)}
            {...props}
        >
            {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {icon && !loading && <span className="mr-2">{icon}</span>}
            {children}
        </button>
    );
};

// Enhanced Card Component
export const Card = ({
    children,
    className = '',
    elevated = false,
    hover = true,
    padding = 'md',
    ...props
}) => {
    const baseClasses = 'bg-white dark:bg-secondary-800 rounded-2xl border border-secondary-100 dark:border-secondary-700 transition-all duration-300';
    const shadowClasses = elevated ? 'shadow-medium hover:shadow-strong' : 'shadow-soft hover:shadow-medium';
    const hoverClasses = hover ? 'hover:scale-[1.02]' : '';

    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10'
    };

    return (
        <div
            className={`${baseClasses} ${shadowClasses} ${hoverClasses} ${paddings[padding]} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

// Enhanced Input Component
export const Input = ({
    label,
    error,
    icon,
    className = '',
    containerClassName = '',
    ...props
}) => {
    return (
        <div className={`space-y-2 ${containerClassName}`}>
            {label && (
                <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-secondary-400">{icon}</span>
                    </div>
                )}
                <input
                    className={`input-field ${icon ? 'pl-10' : ''} ${error ? 'border-danger-500 focus:ring-danger-500' : ''} ${className}`}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-sm text-danger-600 dark:text-danger-400 animate-slide-up">
                    {error}
                </p>
            )}
        </div>
    );
};

// Enhanced Modal Component
export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    className = ''
}) => {
    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full mx-4'
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 transition-opacity bg-black bg-opacity-50 backdrop-blur-sm"
                    onClick={onClose}
                ></div>

                {/* Modal */}
                <div className={`inline-block w-full ${sizes[size]} p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-secondary-800 shadow-strong rounded-2xl ${className}`}>
                    {/* Header */}
                    {title && (
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-secondary-900 dark:text-secondary-100">
                                {title}
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-2 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Content */}
                    <div className="text-secondary-700 dark:text-secondary-300">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Enhanced Badge Component
export const Badge = ({
    children,
    variant = 'primary',
    size = 'md',
    className = ''
}) => {
    const variants = {
        primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
        secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-200',
        success: 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200',
        danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200',
        warning: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };

    const sizes = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-2 text-base'
    };

    return (
        <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
            {children}
        </span>
    );
};

// Enhanced Loading Spinner
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12'
    };

    return (
        <div className={`animate-spin rounded-full border-2 border-secondary-200 border-t-primary-600 ${sizes[size]} ${className}`}></div>
    );
};

// Enhanced Alert Component
export const Alert = ({
    children,
    variant = 'info',
    onClose,
    className = ''
}) => {
    const variants = {
        info: 'bg-primary-50 border-primary-200 text-primary-800 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-200',
        success: 'bg-success-50 border-success-200 text-success-800 dark:bg-success-900/20 dark:border-success-800 dark:text-success-200',
        warning: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
        danger: 'bg-danger-50 border-danger-200 text-danger-800 dark:bg-danger-900/20 dark:border-danger-800 dark:text-danger-200'
    };

    return (
        <div className={`p-4 border rounded-xl ${variants[variant]} ${className}`}>
            <div className="flex items-start">
                <div className="flex-1">
                    {children}
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="ml-4 text-current opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

// Enhanced Progress Bar
export const ProgressBar = ({
    value,
    max = 100,
    variant = 'primary',
    size = 'md',
    showLabel = false,
    className = ''
}) => {
    const percentage = Math.min((value / max) * 100, 100);

    const variants = {
        primary: 'bg-primary-500',
        success: 'bg-success-500',
        warning: 'bg-red-500',
        danger: 'bg-danger-500'
    };

    const sizes = {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4'
    };

    return (
        <div className={`w-full ${className}`}>
            {showLabel && (
                <div className="flex justify-between text-sm text-secondary-600 dark:text-secondary-400 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(percentage)}%</span>
                </div>
            )}
            <div className={`w-full bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden ${sizes[size]}`}>
                <div
                    className={`${sizes[size]} ${variants[variant]} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};