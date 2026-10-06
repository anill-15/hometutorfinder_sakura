import { useEffect } from 'react';
import { IconClose } from './Icons.jsx';

/**
 * Accessible modal dialog: focus moves into the panel on open, Escape closes
 * it, and background scrolling is locked while it is visible.
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  footer = null,
  wide = false,
  closeOnOverlay = true,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (closeOnOverlay && event.target === event.currentTarget) onClose?.();
      }}
      role="presentation"
    >
      <div className={`modal ${wide ? 'modal--wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close dialog">
            <IconClose />
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  );
}