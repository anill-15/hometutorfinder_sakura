import { IconInbox } from './Icons.jsx';

/**
 * Placeholder shown when a list has no items. Every list in the app uses this
 * so empty screens look deliberate rather than broken.
 */
export default function EmptyState({
  title = 'Nothing here yet',
  text = '',
  action = null,
  icon = null,
  compact = false,
}) {
  return (
    <div className="empty-state" style={compact ? { padding: '32px 20px' } : undefined}>
      <div className="empty-state__icon">{icon || <IconInbox size={24} />}</div>
      <h3 className="empty-state__title">{title}</h3>
      {text && <p className="empty-state__text">{text}</p>}
      {action}
    </div>
  );
}