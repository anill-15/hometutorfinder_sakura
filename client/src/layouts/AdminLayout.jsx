import { useAuth } from '../context/AuthContext.jsx';
import DashboardShell from './DashboardShell.jsx';
import {
  IconDashboard, IconUsers, IconUser, IconBriefcase, IconChat, IconStar, IconFlag,
} from '../components/common/Icons.jsx';

/** Sidebar links for the admin panel. */
const ADMIN_LINKS = [
  {
    title: 'Overview',
    links: [{ to: '/admin/dashboard', label: 'Dashboard', icon: IconDashboard, end: true }],
  },
  {
    title: 'People',
    links: [
      { to: '/admin/users', label: 'Users', icon: IconUsers },
      { to: '/admin/tutors', label: 'Tutors & verification', icon: IconUser },
    ],
  },
  {
    title: 'Activity',
    links: [
      { to: '/admin/requirements', label: 'Requirements', icon: IconBriefcase },
      { to: '/admin/requests', label: 'Requests', icon: IconChat },
      { to: '/admin/reviews', label: 'Reviews', icon: IconStar },
      { to: '/admin/reports', label: 'Reports', icon: IconFlag },
    ],
  },
];

/** Dashboard shell for administrators. */
export default function AdminLayout() {
  const { user } = useAuth();

  return (
    <DashboardShell
      links={ADMIN_LINKS}
      footer={
        <>
          <div className="small strong">{user?.name}</div>
          <div className="small muted">Administrator</div>
        </>
      }
    />
  );
}