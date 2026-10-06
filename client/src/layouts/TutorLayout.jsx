import { useAuth } from '../context/AuthContext.jsx';
import DashboardShell from './DashboardShell.jsx';
import {
  IconDashboard, IconUser, IconBriefcase, IconChat, IconBell, IconCalendar, IconStar,
} from '../components/common/Icons.jsx';

/** Sidebar links for the tutor dashboard. */
const TUTOR_LINKS = [
  {
    title: 'Overview',
    links: [{ to: '/tutor/dashboard', label: 'Dashboard', icon: IconDashboard, end: true }],
  },
  {
    title: 'Work',
    links: [
      { to: '/tutor/requirements', label: 'Student requirements', icon: IconBriefcase },
      { to: '/tutor/applications', label: 'My applications', icon: IconBriefcase },
      { to: '/tutor/requests', label: 'Student requests', icon: IconChat },
    ],
  },
  {
    title: 'Profile',
    links: [
      { to: '/tutor/profile', label: 'Edit profile', icon: IconUser },
      { to: '/tutor/availability', label: 'Availability', icon: IconCalendar },
      { to: '/tutor/reviews', label: 'Reviews', icon: IconStar },
      { to: '/tutor/notifications', label: 'Notifications', icon: IconBell },
    ],
  },
];

/** Dashboard shell for tutors. */
export default function TutorLayout() {
  const { user } = useAuth();

  return (
    <DashboardShell
      links={TUTOR_LINKS}
      footer={
        <>
          <div className="small strong">{user?.name}</div>
          <div className="small muted">Signed in as a tutor</div>
        </>
      }
    />
  );
}