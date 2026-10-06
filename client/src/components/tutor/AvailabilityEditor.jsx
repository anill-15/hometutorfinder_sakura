import { useState } from 'react';
import { DAYS_OF_WEEK } from '../../utils/helpers.js';
import { IconPlus } from '../common/Icons.jsx';
import FormInput from '../common/FormInput.jsx';
import { toast } from '../../hooks/useToast.js';

const DEFAULT_START = '17:00';
const DEFAULT_END = '19:00';

/**
 * Builds one editor row per weekday, merging any slots already published so an
 * existing schedule is always shown instead of being silently dropped.
 */
function buildSlots(initial) {
  return DAYS_OF_WEEK.map((day) => {
    const existing = initial.find((slot) => slot.day === day);
    return existing
      ? { ...existing, start: existing.start || DEFAULT_START, end: existing.end || DEFAULT_END, enabled: true }
      : { id: `new-${day}`, day, enabled: false, start: DEFAULT_START, end: DEFAULT_END };
  });
}

/**
 * Weekly availability editor for tutors.
 *
 * All seven days are always listed, so a tutor only has to tick a box and
 * adjust the times rather than building a schedule from scratch.
 */
export default function AvailabilityEditor({ initial = [], onSave }) {
  const [slots, setSlots] = useState(() => buildSlots(initial));
  const [errors, setErrors] = useState({});

  const update = (day, patch) => {
    setSlots((prev) => prev.map((slot) => (slot.day === day ? { ...slot, ...patch } : slot)));
    setErrors((prev) => ({ ...prev, [day]: '' }));
  };

  const handleSave = () => {
    const nextErrors = {};
    slots.forEach((slot) => {
      if (!slot.enabled) return;
      if (!slot.start || !slot.end) {
        nextErrors[slot.day] = 'Enter both a start and an end time';
      } else if (slot.start >= slot.end) {
        nextErrors[slot.day] = 'End time must be later than the start time';
      }
    });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error('Please fix the highlighted time slots');
      return;
    }

    onSave(slots);
  };

  const copyMonday = () => {
    const monday = slots.find((slot) => slot.day === 'Monday');
    if (!monday) return;
    setSlots((prev) =>
      prev.map((slot) =>
        slot.day === 'Monday'
          ? slot
          : { ...slot, start: monday.start, end: monday.end },
      ),
    );
    toast.info('Copied Monday’s timings to every day');
  };

  const addSlot = () => {
    const free = DAYS_OF_WEEK.find((day) => !slots.some((slot) => slot.day === day && slot.enabled));
    if (!free) {
      toast.info('All seven days are already enabled');
      return;
    }
    update(free, { enabled: true });
  };

  return (
    <div className="stack">
      <div className="alert alert--info">
        <div>
          Students see these timings on your profile, and they factor into the match you see on
          your side. Keep them accurate — it is the most common reason a request is declined.
        </div>
      </div>

      <div className="availability-editor">
        {slots.map((slot) => (
          <div key={slot.day} className={`availability-slot ${slot.enabled ? '' : 'is-disabled'}`}>
            <label className="checkbox availability-slot__day">
              <input
                type="checkbox"
                checked={slot.enabled}
                onChange={(event) => update(slot.day, { enabled: event.target.checked })}
              />
              {slot.day.slice(0, 3)}
            </label>

            <FormInput
              name={`start-${slot.day}`}
              type="time"
              value={slot.start}
              onChange={(value) => update(slot.day, { start: value })}
              disabled={!slot.enabled}
              aria-label={`${slot.day} start time`}
            />

            <FormInput
              name={`end-${slot.day}`}
              type="time"
              value={slot.end}
              onChange={(value) => update(slot.day, { end: value })}
              disabled={!slot.enabled}
              error={errors[slot.day]}
              aria-label={`${slot.day} end time`}
            />

            <span />
          </div>
        ))}
      </div>

      <div className="row row--between row--wrap">
        <div className="btn-group">
          <button type="button" className="btn btn--secondary btn--sm" onClick={copyMonday}>
            Copy Monday to all
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={addSlot}>
            <IconPlus size={14} /> Enable another day
          </button>
        </div>

        <button type="button" className="btn btn--primary" onClick={handleSave}>
          Save availability
        </button>
      </div>
    </div>
  );
}