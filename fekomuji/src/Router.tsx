import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import { SignIn, SignUp, Events, Profile, EventDetail } from './pages';
import SignUpPanitia from './pages/SignUpPanitia';
import UpgradeToPanitia from './pages/UpgradeToPanitia';
import ForgotPassword from './pages/ForgotPassword';
import PremiumUpgrade from './pages/PremiumUpgrade';
import About from './pages/About';
import WithdrawalManagement from './admin/pages/WithdrawalManagement';
import Contact from './pages/Contact';
import Transaksi from './pages/Transaksi';
import TransactionDetail from './pages/TransactionDetail';
import ETicket from './pages/ETicket';
import EventHistory from './pages/EventHistory';
import CheckIn from './pages/CheckIn';
import DebugRegistration from './pages/DebugRegistration';
import OrganizerLogin from './pages/OrganizerLogin';
import TicketBookingPage from './pages/TicketBooking';
import PaymentSuccess from './pages/PaymentSuccess';
import { AuthProvider } from './contexts/AuthContext';
import EventAttendance from './pages/EventAttendance';
import { Dashboard, EventManagementFixed, Tickets, Finance, Settings } from './organizer/pages';
import CertificateSettings from './organizer/pages/CertificateSettings';
import CertificateIssuance from './organizer/pages/CertificateIssuance';
import CertificateTemplates from './pages/CertificateTemplates';
import EventsCardView from './organizer/pages/EventsCardView';
import EventManage from './organizer/pages/EventManage';
import Financial from './organizer/pages/Financial';
import UsersManagement from './admin/pages/UsersManagement';
import CategoriesManagement from './admin/pages/CategoriesManagement';

import ParticipantsNew from './organizer/pages/ParticipantsNew';
import OrganizerEventDetail from './organizer/pages/EventDetail';
import { ProtectedOrganizerRoute, ErrorBoundary } from './components';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import PanitiaApproval from './admin/pages/PanitiaApproval';
import AdminDashboard from './admin/pages/AdminDashboard';
import PanitiaManagement from './admin/pages/PanitiaManagement';
import { Transactions } from './admin/pages/Transactions';
import Reports from './admin/pages/Reports';
import AdminSettings from './admin/pages/AdminSettings';
import BannerManagement from './admin/pages/BannerManagement';
import ContactMessages from './admin/pages/ContactMessages';
import CategoryManagement from './admin/pages/CategoryManagement';
import UserManagement from './admin/pages/UserManagement';
import TestPage from './TestPage';

const AppRouter = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/test" element={<TestPage />} />
          <Route path="/debug-registration" element={<DebugRegistration />} />
          <Route path="/" element={<App />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signup-panitia" element={<SignUpPanitia />} />
          <Route path="/upgrade-to-panitia" element={<UpgradeToPanitia />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/organizer-login" element={<OrganizerLogin />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/events/:eventId/book" element={<TicketBookingPage />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<Transaksi />} />
          <Route path="/transaksi" element={<Transaksi />} />
          <Route path="/transaksi/:id" element={<TransactionDetail />} />
          <Route path="/transaksi/:id/eticket" element={<ETicket />} />
          <Route path="/history/events" element={<EventHistory />} />
          <Route path="/events/:eventId/checkin" element={<CheckIn />} />

          {/* Organizer Routes - Protected */}
          <Route path="/organizer" element={<ProtectedOrganizerRoute><ErrorBoundary><Dashboard /></ErrorBoundary></ProtectedOrganizerRoute>} />
          <Route path="/organizer/events" element={<ProtectedOrganizerRoute><ErrorBoundary><EventManagementFixed /></ErrorBoundary></ProtectedOrganizerRoute>} />
          <Route path="/organizer/events-card" element={<ProtectedOrganizerRoute><ErrorBoundary><EventsCardView /></ErrorBoundary></ProtectedOrganizerRoute>} />
          <Route path="/organizer/events/:id" element={<ProtectedOrganizerRoute><ErrorBoundary><OrganizerEventDetail /></ErrorBoundary></ProtectedOrganizerRoute>} />
          <Route path="/organizer/events/:id/participants" element={<ProtectedOrganizerRoute><ErrorBoundary><EventManage /></ErrorBoundary></ProtectedOrganizerRoute>} />
          <Route path="/organizer/events/:eventId/attendance" element={<ProtectedOrganizerRoute><ErrorBoundary><EventAttendance /></ErrorBoundary></ProtectedOrganizerRoute>} />
          <Route path="/organizer/events/:eventId/certificates/settings" element={<ProtectedOrganizerRoute><ErrorBoundary><CertificateSettings /></ErrorBoundary></ProtectedOrganizerRoute>} />
          <Route path="/organizer/events/:eventId/certificates" element={<ProtectedOrganizerRoute><ErrorBoundary><CertificateIssuance /></ErrorBoundary></ProtectedOrganizerRoute>} />
          <Route path="/certificate-templates" element={<ProtectedOrganizerRoute><ErrorBoundary><CertificateTemplates /></ErrorBoundary></ProtectedOrganizerRoute>} />

          <Route path="/organizer/participants" element={<ProtectedOrganizerRoute><ErrorBoundary><ParticipantsNew /></ErrorBoundary></ProtectedOrganizerRoute>} />
          <Route path="/organizer/tickets" element={<ProtectedOrganizerRoute><ErrorBoundary><Tickets /></ErrorBoundary></ProtectedOrganizerRoute>} />
          <Route path="/organizer/finance" element={<ProtectedOrganizerRoute><ErrorBoundary><Finance /></ErrorBoundary></ProtectedOrganizerRoute>} />
          <Route path="/organizer/settings" element={<ProtectedOrganizerRoute><ErrorBoundary><Settings /></ErrorBoundary></ProtectedOrganizerRoute>} />
          <Route path="/organizer/finance" element={<ProtectedOrganizerRoute><ErrorBoundary><Financial /></ErrorBoundary></ProtectedOrganizerRoute>} />
          <Route path="/organizer/premium" element={<ProtectedOrganizerRoute><ErrorBoundary><PremiumUpgrade /></ErrorBoundary></ProtectedOrganizerRoute>} />

          {/* Admin Routes - Protected - Simplified */}
          <Route path="/admin" element={<ProtectedAdminRoute><ErrorBoundary><AdminDashboard /></ErrorBoundary></ProtectedAdminRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedAdminRoute><ErrorBoundary><AdminDashboard /></ErrorBoundary></ProtectedAdminRoute>} />
          <Route path="/admin/users" element={<ProtectedAdminRoute><ErrorBoundary><UsersManagement /></ErrorBoundary></ProtectedAdminRoute>} />
          <Route path="/admin/categories" element={<ProtectedAdminRoute><ErrorBoundary><CategoriesManagement /></ErrorBoundary></ProtectedAdminRoute>} />
          <Route path="/admin/finance" element={<ProtectedAdminRoute><ErrorBoundary><Transactions /></ErrorBoundary></ProtectedAdminRoute>} />
          <Route path="/admin/withdrawals" element={<ProtectedAdminRoute><ErrorBoundary><WithdrawalManagement /></ErrorBoundary></ProtectedAdminRoute>} />
          <Route path="/admin/content" element={<ProtectedAdminRoute><ErrorBoundary><BannerManagement /></ErrorBoundary></ProtectedAdminRoute>} />
          <Route path="/admin/messages" element={<ProtectedAdminRoute><ErrorBoundary><ContactMessages /></ErrorBoundary></ProtectedAdminRoute>} />
          <Route path="/admin/settings" element={<ProtectedAdminRoute><ErrorBoundary><AdminSettings /></ErrorBoundary></ProtectedAdminRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRouter;

