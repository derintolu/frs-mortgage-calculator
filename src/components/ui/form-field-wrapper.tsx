import { ReactNode } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FormFieldWrapperProps {
  children: ReactNode;
  label?: string;
  isRequired?: boolean;
  isComplete?: boolean;
  showCompletionIndicator?: boolean;
  className?: string;
}

/**
 * Wrapper component for form fields that adds visual indicators for completeness
 * Usage: Wrap any form field to add required/incomplete highlighting
 */
export function FormFieldWrapper({
  children,
  label,
  isRequired = false,
  isComplete = false,
  showCompletionIndicator = false,
  className,
}: FormFieldWrapperProps) {
  const showIncompleteIndicator = isRequired && !isComplete && showCompletionIndicator;
  const showCompleteIndicator = isRequired && isComplete && showCompletionIndicator;

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {children}

        {/* Completion indicators */}
        {showCompletionIndicator && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {showCompleteIndicator && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {showIncompleteIndicator && (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        )}
      </div>

      {/* Incomplete field message */}
      {showIncompleteIndicator && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-500 rounded-full" />
          This required field is incomplete
        </p>
      )}
    </div>
  );
}

/**
 * Highlight card for incomplete sections
 */
interface IncompleteSectionCardProps {
  title: string;
  icon?: ReactNode;
  missingFields: string[];
  onComplete?: () => void;
  className?: string;
}

export function IncompleteSectionCard({
  title,
  icon,
  missingFields,
  onComplete,
  className,
}: IncompleteSectionCardProps) {
  return (
    <div
      className={cn(
        'p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="p-2 bg-red-100 rounded-lg">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-red-900 mb-2">
            {title}
          </h4>
          <p className="text-xs text-red-700 mb-2">
            Please complete the following fields:
          </p>
          <ul className="space-y-1">
            {missingFields.map((field, index) => (
              <li
                key={index}
                className="text-xs text-red-600 flex items-center gap-2"
              >
                <AlertCircle className="h-3 w-3" />
                {field}
              </li>
            ))}
          </ul>
          {onComplete && (
            <button
              onClick={onComplete}
              className="mt-3 text-xs font-medium text-red-700 hover:text-red-900 underline"
            >
              Complete this section →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
