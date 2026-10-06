/**
 * Maps a status value to a badge colour + label. One place so every screen
 * shows the same wording for the same state.
 */
const MAP = {
  // requests
  pending: { label: 'Pending', variant: 'warning' },
  accepted: { label: 'Accepted', variant: 'success' },
  rejected: { label: 'Declined', variant: 'danger' },
  cancelled: { label: 'Cancelled', variant: 'neutral' },
  completed: { label: 'Completed', variant: 'info' },
  // requirements
  open: { label: 'Open', variant: 'success' },
  applications_received: { label: 'Applications received', variant: 'info' },
  shortlisted: { label: 'Shortlisted', variant: 'brand' },
  assigned: { label: 'Tutor assigned', variant: 'success' },
  closed: { label: 'Closed', variant: 'neutral' },
  // applications
  withdrawn: { label: 'Withdrawn', variant: 'neutral' },
  // verification
  verified: { label: 'Verified', variant: 'success' },
  unverified: { label: 'Not verified', variant: 'neutral' },
  // users
  active: { label: 'Active', variant: 'success' },
  suspended: { label: 'Suspended', variant: 'danger' },
  // reports
  reviewing: { label: 'Reviewing', variant: 'info' },
  resolved: { label: 'Resolved', variant: 'success' },
  dismissed: { label: 'Dismissed', variant: 'neutral' },
};

const FALLBACK = { label: 'Unknown', variant: 'neutral' };

/** Returns the label and colour for a status. */
const statusMeta = (status) => MAP[status] || { ...FALLBACK, label: status || FALLBACK.label };

export default function StatusBadge({ status, variant, label, className = '' }) {
  const meta = statusMeta(status);
  return (
    <span className={`badge badge--${variant || meta.variant} ${className}`}>{label || meta.label}</span>
  );
}