import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const Alert = ({
  type = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className = ''
}) => {
  const types = {
    success: {
      containerClasses: 'bg-green-50 border-green-200',
      iconClasses: 'text-green-400',
      titleClasses: 'text-green-800',
      textClasses: 'text-green-700',
      icon: CheckCircle
    },
    warning: {
      containerClasses: 'bg-yellow-50 border-yellow-200',
      iconClasses: 'text-yellow-400',
      titleClasses: 'text-yellow-800',
      textClasses: 'text-yellow-700',
      icon: AlertTriangle
    },
    error: {
      containerClasses: 'bg-red-50 border-red-200',
      iconClasses: 'text-red-400',
      titleClasses: 'text-red-800',
      textClasses: 'text-red-700',
      icon: XCircle
    },
    info: {
      containerClasses: 'bg-blue-50 border-blue-200',
      iconClasses: 'text-blue-400',
      titleClasses: 'text-blue-800',
      textClasses: 'text-blue-700',
      icon: Info
    }
  };

  const config = types[type];
  const Icon = config.icon;

  return (
    <div className={`rounded-md border p-4 ${config.containerClasses} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${config.iconClasses}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${config.titleClasses}`}>
              {title}
            </h3>
          )}
          {children && (
            <div className={`${title ? 'mt-2' : ''} text-sm ${config.textClasses}`}>
              {children}
            </div>
          )}
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.iconClasses} hover:bg-opacity-20`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;