import { useEffect } from 'react';
import { X } from 'lucide-react';
import AnalyticsChart from './AnalyticsChart';
import { cn } from '../utils/cn';
import { MODAL_STYLES } from '../utils/tailwindUtils';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ isOpen, onClose }) => {
  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with smooth transition */}
      <div
        className={cn(
          MODAL_STYLES.backdrop,
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal with entrance animation */}
      <div className={cn(MODAL_STYLES.container, isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none transition-opacity duration-300')}>
        <div
          className={cn(
            MODAL_STYLES.content,
            isOpen ? 'scale-100' : 'scale-95'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={MODAL_STYLES.header}>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Focus Analytics</h2>
              <p className="text-sm text-gray-600 mt-1">
                Track your productivity and focus time trends
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className={MODAL_STYLES.body}>
            <AnalyticsChart />
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalyticsModal;
