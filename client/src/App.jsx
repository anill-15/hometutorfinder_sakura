import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout.jsx';
import StudentLayout from './layouts/StudentLayout.jsx';
import TutorLayout from './layouts/TutorLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import RoleRoute from './components/common/RoleRoute.jsx';
import ToastRegion from './components/common/ToastRegion.jsx';
import NotFound from './pages/public/NotFound.jsx';

/* public */
import Home from './pages/public/Home.jsx';
import Tutors from './pages/public/Tutors.jsx';
import TutorDetail from './pages/public/TutorDetail.jsx';
import Requirements from './pages/public/Requirements.jsx';
import About from './pages/public/About.jsx';
import Contact from './pages/public/Contact.jsx';
import Login from './pages/public/Login.jsx';
import Register from './pages/public/Register.jsx';

/* student */
import StudentDashboard from './pages/student/Dashboard.jsx';
import StudentProfile from './pages/student/Profile.jsx';
import StudentTutors from './pages/student/FindTutors.jsx';
import StudentFavorites from './pages/student/Favorites.jsx';
import StudentRequirements from './pages/student/Requirements.jsx';
import NewRequirement from './pages/student/NewRequirement.jsx';
import RequirementDetail from './pages/student/RequirementDetail.jsx';
import StudentRequests from './pages/student/Requests.jsx';
import StudentNotifications from './pages/student/Notifications.jsx';

/* tutor */
import TutorDashboardPage from './pages/tutor/Dashboard.jsx';
import TutorProfilePage from './pages/tutor/Profile.jsx';
import TutorAvailabilityPage from './pages/tutor/Availability.jsx';
import TutorRequirementsPage from './pages/tutor/Requirements.jsx';
import TutorApplicationsPage from './pages/tutor/Applications.jsx';
import TutorRequestsPage from './pages/tutor/Requests.jsx';
import TutorReviewsPage from './pages/tutor/Reviews.jsx';
import TutorNotificationsPage from './pages/tutor/Notifications.jsx';

/* admin */
import AdminDashboardPage from './pages/admin/Dashboard.jsx';
import AdminUsersPage from './pages/admin/Users.jsx';
import AdminTutorsPage from './pages/admin/Tutors.jsx';
import AdminRequirementsPage from './pages/admin/Requirements.jsx';
import AdminRequestsPage from './pages/admin/Requests.jsx';
import AdminReviewsPage from './pages/admin/Reviews.jsx';
import AdminReportsPage from './pages/admin/Reports.jsx';

/** Wraps a dashboard area so only the right role can reach it. */
const withRole = (role, Layout) => (
  <RoleRoute role={role}>
    <Layout />
  </RoleRoute>
);

export default function App() {
  return (
    <>
      <Routes>
        {/* ------------------------- public ------------------------- */}
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="tutors" element={<Tutors />} />
          <Route path="tutors/:id" element={<TutorDetail />} />
          <Route path="requirements" element={<Requirements />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* ------------------------ student ------------------------- */}
        <Route element={withRole('student', StudentLayout)}>
          <Route path="student/dashboard" element={<StudentDashboard />} />
          <Route path="student/profile" element={<StudentProfile />} />
          <Route path="student/tutors" element={<StudentTutors />} />
          <Route path="student/favorites" element={<StudentFavorites />} />
          <Route path="student/requirements" element={<StudentRequirements />} />
          <Route path="student/requirements/new" element={<NewRequirement />} />
          <Route path="student/requirements/:id" element={<RequirementDetail />} />
          <Route path="student/requests" element={<StudentRequests />} />
          <Route path="student/notifications" element={<StudentNotifications />} />
        </Route>

        {/* ------------------------- tutor -------------------------- */}
        <Route element={withRole('tutor', TutorLayout)}>
          <Route path="tutor/dashboard" element={<TutorDashboardPage />} />
          <Route path="tutor/profile" element={<TutorProfilePage />} />
          <Route path="tutor/availability" element={<TutorAvailabilityPage />} />
          <Route path="tutor/requirements" element={<TutorRequirementsPage />} />
          <Route path="tutor/applications" element={<TutorApplicationsPage />} />
          <Route path="tutor/requests" element={<TutorRequestsPage />} />
          <Route path="tutor/reviews" element={<TutorReviewsPage />} />
          <Route path="tutor/notifications" element={<TutorNotificationsPage />} />
        </Route>

        {/* ------------------------- admin -------------------------- */}
        <Route element={withRole('admin', AdminLayout)}>
          <Route path="admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="admin/users" element={<AdminUsersPage />} />
          <Route path="admin/tutors" element={<AdminTutorsPage />} />
          <Route path="admin/requirements" element={<AdminRequirementsPage />} />
          <Route path="admin/requests" element={<AdminRequestsPage />} />
          <Route path="admin/reviews" element={<AdminReviewsPage />} />
          <Route path="admin/reports" element={<AdminReportsPage />} />
        </Route>

        {/* Legacy / convenience redirects */}
        <Route path="dashboard" element={<Navigate to="/" replace />} />
        <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
      </Routes>

      <ToastRegion />
    </>
  );
}