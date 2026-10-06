import { useAuth } from '../../context/AuthContext.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

/**
 * RoleRoute guards a dashboard area by wrapping ProtectedRoute with a role
 * check, so one element covers both concerns:
 *
 *   <RoleRoute role="admin"><AdminLayout /></RoleRoute>
 *
 * - Signed out  → ProtectedRoute shows a sign-in prompt.
 * - Wrong role  → ProtectedRoute explains the mismatch and links to the
 *                 signed-in user's own dashboard.
 *
 * The signed-in user comes from the auth context, so this wrapper is safe to
 * drop anywhere in the tree without the caller having to thread props through.
 */
export default function RoleRoute({ role, children }) {
  const { user } = useAuth();

  return (
    <ProtectedRoute user={user} role={role}>
      {children}
    </ProtectedRoute>
  );
}
