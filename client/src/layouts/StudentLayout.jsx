import { useAuth } from '../context/AuthContext.jsx';
import DashboardShell from './DashboardShell.jsx';
import {
  IconDashboard, IconSearch, IconBriefcase, IconHeart, IconChat, IconBell, IconUser,
} from '../components/common/Icons.jsx';

/** Sidebar links for the student dashboard. */
const STUDENT_LINKS = [
  {
    title: 'Overview',
    links: [{ to: '/student/dashboard', label: 'Dashboard', icon: IconDashboard, end: true }],
  },
  {
    title: 'Find a tutor',
    links: [
      { to: '/student/tutors', label: 'Browse tutors', icon: IconSearch },
      { to: '/student/favorites', label: 'Favourites', icon: IconHeart },
      { to: '/student/requirements/new', label: 'Post a requirement', icon: IconBriefcase },
    ],
  },
  {
    title: 'My activity',
    links: [
      { to: '/student/requirements', label: 'My requirements', icon: IconBriefcase },
      { to: '/student/requests', label: 'My requests', icon: IconChat },
      { to: '/student/notifications', label: 'Notifications', icon: IconBell },
    ],
  },
  {
    title: 'Account',
    links: [{ to: '/student/profile', label: 'Profile & preferences', icon: IconUser }],
  },
];

/** Dashboard shell for students and parents. */
export default function StudentLayout() {
  const { user } = useAuth();

  return (
    <DashboardShell
      links={STUDENT_LINKS}
      footer={
        <>
          <div className="small strong">{user?.name}</div>
          <div className="small muted">Signed in as a student</div>
        </>
      }
    />
  );
}