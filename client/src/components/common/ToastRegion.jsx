import { useToasts, dismissToast } from '../../hooks/useToast.js';
import { IconCheckCircle, IconAlert, IconInfo, IconClose } from './Icons.jsx';

const ICONS = {
  success: IconCheckCircle,
  error: IconAlert,
  warning: IconAlert,
  info: IconInfo,
};

/** Renders the toast stack. Mounted once in App. */
export default function ToastRegion() {
  const items = useToasts();
  if (items.length === 0) return null;

  return (
    <div className="toast-region" aria-live="polite" aria-atomic="false">
      {items.map((item) => {
        const Icon = ICONS[item.variant] || IconInfo;
        return (
          <div key={item.id} className={`toast toast--${item.variant}`} role="status">
            <span className={`toast__icon ${item.variant === 'info' ? 'toast__icon--info' : ''}`}>
              <Icon size={17} />
            </span>
            <span className="toast__text">{item.message}</span>
            <button
              type="button"
              className="toast__close"
              onClick={() => dismissToast(item.id)}
              aria-label="Dismiss notification"
            >
              <IconClose size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}