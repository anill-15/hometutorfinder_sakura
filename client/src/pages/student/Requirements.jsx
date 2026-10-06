import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import * as requirementService from '../../services/requirementService.js';
import { toast } from '../../hooks/useToast.js';
import RequirementCard from '../../components/student/RequirementCard.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { plural } from '../../utils/helpers.js';
import { IconBriefcase, IconPlus, IconUsers } from '../../components/common/Icons.jsx';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'applications_received', label: 'Applications received' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'closed', label: 'Closed' },
  { value: 'cancelled', label: 'Cancelled' },
];

/** The student's own requirements, with application handling. */
export default function Requirements() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [confirm, setConfirm] = useState(null); // { requirement, action }
  const [, setVersion] = useState(0);

  const all = requirementService.listRequirements({ studentId: user.id });
  const visible = requirementService.filterMyRequirements(all, filter);

  const refresh = () => setVersion((v) => v + 1);

  const handleAccept = (requirement, application) => {
    const result = requirementService.updateApplicationStatus(application.id, 'accepted', user.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    requirementService.assignTutor(requirement.id, application.tutorId, user.id);
    toast.success(`${application.tutorUser?.name} has been accepted for this requirement`);
    refresh();
  };

  const handleReject = (requirement, application) => {
    const result = requirementService.updateApplicationStatus(application.id, 'rejected', user.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.info(`Application from ${application.tutorUser?.name} declined`);
    refresh();
  };

  const handleClose = (requirement) => {
    const result = requirementService.closeRequirement(requirement.id, user.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success('Requirement closed. It is no longer visible to tutors.');
    refresh();
  };

  const handleDelete = (requirement) => {
    const result = requirementService.deleteRequirement(requirement.id, user.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success('Requirement deleted');
    refresh();
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">My requirements</h1>
          <p className="dashboard-header__subtitle">
            {all.length > 0
              ? `You have ${plural(all.length, 'requirement')}. Tutors can apply while a requirement is open.`
              : 'Post what you need and tutors in your area can apply to you.'}
          </p>
        </div>
        <Link className="btn btn--primary" to="/student/requirements/new">
          <IconPlus size={15} /> Post a requirement
        </Link>
      </div>

      <div className="search-toolbar" style={{ marginBottom: 18 }}>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map((option) => {
            const count = option.value === 'all'
              ? all.length
              : all.filter((r) => r.status === option.value).length;

            return (
              <button
                key={option.value}
                type="button"
                className={`tag ${filter === option.value ? 'tag--active' : ''}`}
                onClick={() => setFilter(option.value)}
                style={{ cursor: 'pointer' }}
                aria-pressed={filter === option.value}
              >
                {option.label} {count > 0 && <span>({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<IconBriefcase size={24} />}
          title={all.length === 0 ? 'No requirements posted yet' : 'Nothing in this filter'}
          text={
            all.length === 0
              ? 'Tell tutors what you need — subject, class, budget and when you are free. They can then apply to you.'
              : 'Try a different status filter to see your other requirements.'
          }
          action={
            all.length === 0 ? (
              <Link className="btn btn--primary" to="/student/requirements/new">Post a requirement</Link>
            ) : (
              <button type="button" className="btn btn--secondary" onClick={() => setFilter('all')}>
                Show all requirements
              </button>
            )
          }
        />
      ) : (
        <div className="stack">
          {visible.map((requirement) => {
            const applications = requirementService.applicationsForRequirement(requirement.id);

            return (
              <RequirementCard
                key={requirement.id}
                requirement={requirement}
                applications={applications}
                viewerRole="student"
                onAccept={(application) => handleAccept(requirement, application)}
                onReject={(application) => handleReject(requirement, application)}
                onClose={() => setConfirm({ requirement, action: 'close' })}
                onDelete={() => setConfirm({ requirement, action: 'delete' })}
              />
            );
          })}

          {visible.some((r) => r.applications.some((a) => a.status === 'pending')) && (
            <div className="alert alert--info">
              <IconUsers size={15} />
              <span>
                Accepting an application assigns that tutor to the requirement and stops further
                applications. You can still message them from your requests page.
              </span>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.action === 'delete' ? 'Delete this requirement?' : 'Close this requirement?'}
        message={
          confirm?.action === 'delete'
            ? 'The requirement and its applications will be permanently removed. This cannot be undone.'
            : 'Tutors will no longer be able to apply to this requirement. You can still view its applications.'
        }
        confirmLabel={confirm?.action === 'delete' ? 'Delete requirement' : 'Close requirement'}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm.action === 'delete') handleDelete(confirm.requirement);
          else handleClose(confirm.requirement);
          setConfirm(null);
        }}
      />
    </div>
  );
}