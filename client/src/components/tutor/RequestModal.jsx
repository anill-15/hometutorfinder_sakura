import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import * as requestService from '../../services/requestService.js';
import * as reportService from '../../services/reportService.js';
import { toast } from '../../hooks/useToast.js';
import { TIME_SLOTS } from '../../utils/helpers.js';
import FormInput from '../common/FormInput.jsx';
import SelectInput from '../common/SelectInput.jsx';
import Modal from '../common/Modal.jsx';
import { IconInfo, IconShield } from '../common/Icons.jsx';

/**
 * The dialog a student uses to send a tuition or demo request.
 *
 * @param {string} mode  'tutoring' or 'demo'
 */
export default function RequestModal({ open, onClose, tutor, mode = 'tutoring', onSent }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ subject: '', message: '', preferredDate: '', preferredTime: 'evening' });
  const [error, setError] = useState('');
  const isDemo = mode === 'demo';

  // Only reset when the dialog opens or the target tutor changes. Depending on
  // the whole `tutor` object would wipe the form on every parent re-render.
  const tutorId = tutor?.id ?? null;
  useEffect(() => {
    if (!open || !tutorId) return;
    setError('');
    setForm({
      subject: tutor?.subjects?.[0] || '',
      message: '',
      preferredDate: '',
      preferredTime: 'evening',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tutorId]);

  if (!tutor) return null;

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!user) {
      toast.info('Please sign in to send a request');
      return;
    }
    if (!form.message.trim()) {
      setError('Tell the tutor a little about what you need');
      return;
    }
    if (user.id === tutor.userId) {
      setError('This is your own profile — manage tuition from your tutor dashboard');
      return;
    }

    const result = requestService.createRequest(user.id, {
      tutorUserId: tutor.userId,
      subject: form.subject,
      message: form.message,
      type: isDemo ? 'demo' : 'tutoring',
      preferredDate: form.preferredDate,
      preferredTime: form.preferredTime,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast.success(isDemo ? `Demo request sent to ${tutor.user.name}` : `Request sent to ${tutor.user.name}`);
    onSent?.(result.request);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isDemo ? 'Request a demo class' : 'Send a tuition request'}
      footer={
        <>
          <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="request-form" className="btn btn--primary">
            {isDemo ? 'Send demo request' : 'Send request'}
          </button>
        </>
      }
    >
      <form id="request-form" className="form" onSubmit={handleSubmit} noValidate>
        <div className="alert alert--info">
          <IconInfo size={15} />
          <span>
            {isDemo
              ? 'A demo is a single trial class. Tutors often offer it free or for a small fee — mention if you have a preference.'
              : 'Explain what you need and when you are available. The tutor can accept or decline, and you will be notified either way.'}
          </span>
        </div>

        <SelectInput
          label="Subject"
          name="request-subject"
          value={form.subject}
          onChange={set('subject')}
          placeholder="Select a subject"
          options={(tutor.subjects || []).map((s) => ({ value: s, label: s }))}
          required
        />

        <FormInput
          label={isDemo ? 'Preferred demo date' : 'Preferred start date'}
          name="request-date"
          type="date"
          value={form.preferredDate}
          onChange={set('preferredDate')}
          hint="Optional — leave blank if you are flexible"
        />

        <SelectInput
          label="Preferred time"
          name="request-time"
          value={form.preferredTime}
          onChange={set('preferredTime')}
          placeholder="Select a time"
          options={TIME_SLOTS.map((slot) => ({ value: slot.value, label: slot.label }))}
        />

        <div className="field">
          <label className="field__label" htmlFor="field-request-message">
            Message<span className="field__required" aria-hidden="true">*</span>
          </label>
          <textarea
            id="field-request-message"
            className="textarea"
            rows={4}
            maxLength={800}
            value={form.message}
            onChange={(e) => set('message')(e.target.value)}
            placeholder={
              isDemo
                ? 'Example: We would like a demo class for Class 10 Mathematics. Weekday evenings work for us.'
                : 'Example: Need a Mathematics tutor for Class 10, two classes a week, preferably evenings.'
            }
            aria-invalid={error ? 'true' : 'false'}
          />
          {error && <span className="field__error" role="alert">{error}</span>}
        </div>
      </form>
    </Modal>
  );
}

/** Dialog for reporting a profile. */
export function ReportModal({ open, onClose, targetUserId, targetTutorId = null, onReported }) {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!user) {
      setError('Please sign in to file a report');
      return;
    }
    if (!reason) {
      setError('Please choose a reason');
      return;
    }

    const result = reportService.createReport({
      reporterId: user.id,
      reportedUserId: targetUserId,
      reportedTutorId: targetTutorId,
      reason,
      details,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast.success('Report submitted. An administrator will review it.');
    setReason('');
    setDetails('');
    setError('');
    onReported?.();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Report this profile"
      footer={
        <>
          <button type="button" className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="report-form" className="btn btn--danger">Submit report</button>
        </>
      }
    >
      <form id="report-form" className="form" onSubmit={handleSubmit} noValidate>
        <div className="alert alert--info">
          <IconShield size={15} />
          <span>
            Reports go straight to the administrator queue. Adding a few details helps us act on it
            quickly.
          </span>
        </div>

        <SelectInput
          label="Reason"
          name="report-reason"
          value={reason}
          onChange={(value) => {
            setReason(value);
            setError('');
          }}
          placeholder="Select a reason"
          options={reportService.REPORT_REASONS.map((r) => ({ value: r, label: r }))}
          required
        />

        <div className="field">
          <label className="field__label" htmlFor="field-report-details">What happened?</label>
          <textarea
            id="field-report-details"
            className="textarea"
            rows={3}
            maxLength={800}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Anything that will help us review this"
          />
          {error && <span className="field__error" role="alert">{error}</span>}
        </div>
      </form>
    </Modal>
  );
}