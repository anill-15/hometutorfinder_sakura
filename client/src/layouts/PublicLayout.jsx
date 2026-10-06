import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar.jsx';
import Footer from '../components/common/Footer.jsx';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/tutors', label: 'Find tutors' },
  { to: '/requirements', label: 'Open requirements' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

/**
 * Layout for every public page. The bell is hidden on the auth pages.
 *
 * `children` is optional: nested routes render through <Outlet />, while the
 * catch-all 404 route passes its page directly.
 */
export default function PublicLayout({ children }) {
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar links={LINKS} showBell={!isAuthPage} />
      <main style={{ flex: 1 }}>{children || <Outlet />}</main>
      <Footer />
    </div>
  );
}
