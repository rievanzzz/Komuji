import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import { SignIn, SignUp, Events, Profile, EventDetail } from './pages';
import About from './pages/About';
import Contact from './pages/Contact';
import Transaksi from './pages/Transaksi';
import TransactionDetail from './pages/TransactionDetail';
import ETicket from './pages/ETicket';
import EventHistory from './pages/EventHistory';
import CheckIn from './pages/CheckIn';
import DebugRegistration from './pages/DebugRegistration';
import OrganizerLogin from './pages/OrganizerLogin';
import TicketBookingPage from './pages/TicketBooking';
import { AuthProvider } from './contexts/AuthContext';
import { Dashboard, EventManagementFixed, Participants, Tickets, Finance, Settings } from './organizer/pages';

import ParticipantsNew from './organizer/pages/ParticipantsNew';
import OrganizerEventDetail from './organizer/pages/EventDetail';
import { ProtectedOrganizerRoute, ErrorBoundary } from './components';
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
          <Route path="/organizer-login" element={<OrganizerLogin />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/events/:eventId/book" element={<TicketBookingPage />} />
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
          <Route path="/organizer/events/:id" element={<ProtectedOrganizerRoute><ErrorBoundary><OrganizerEventDetail /></ErrorBoundary></ProtectedOrganizerRoute>} />

          <Route path="/organizer/participants" element={<ProtectedOrganizerRoute><ErrorBoundary><ParticipantsNew /></ErrorBoundary></ProtectedOrganizerRoute>} />
          <Route path="/organizer/tickets" element={<ProtectedOrganizerRoute><ErrorBoundary><Tickets /></ErrorBoundary></ProtectedOrganizerRoute>} />
          <Route path="/organizer/finance" element={<ProtectedOrganizerRoute><ErrorBoundary><Finance /></ErrorBoundary></ProtectedOrganizerRoute>} />
          <Route path="/organizer/settings" element={<ProtectedOrganizerRoute><ErrorBoundary><Settings /></ErrorBoundary></ProtectedOrganizerRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRouter;

