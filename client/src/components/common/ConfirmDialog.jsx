import Modal from './Modal.jsx';

/**
 * Confirmation dialog used before destructive actions (delete, cancel,
 * remove verification). Keeps the browser's alert() out of the UI.
 */
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Go back',
  variant = 'danger',
  onConfirm,
  onCancel,
  children,
}) {
  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <button type="button" className="btn btn--secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={`btn btn--${variant}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--ink-600)', lineHeight: 1.6 }}>{message}</p>
      {children}
    </Modal>
  );
}