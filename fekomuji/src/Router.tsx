import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import { SignIn, SignUp, Events, Profile, History, EventDetail } from './pages';
import About from './pages/About';
import Contact from './pages/Contact';
import EventHistory from './pages/EventHistory';
import TransactionHistory from './pages/TransactionHistory';
import OrganizerLogin from './pages/OrganizerLogin';
import { AuthProvider } from './contexts/AuthContext';
import { Dashboard, EventManagementFixed, Participants, Tickets, Finance, Settings } from './organizer/pages';

import ParticipantsNew from './organizer/pages/ParticipantsNew';
import OrganizerEventDetail from './organizer/pages/EventDetail';
import { ProtectedOrganizerRoute, ErrorBoundary } from './components';

const AppRouter = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/organizer-login" element={<OrganizerLogin />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/events" element={<EventHistory />} />
          <Route path="/history/transactions" element={<TransactionHistory />} />
          
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

