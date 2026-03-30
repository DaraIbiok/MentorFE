import { createBrowserRouter } from "react-router";
import { Outlet } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import HowItWorks from "./pages/HowItWorks";
import ForMentors from "./pages/ForMentors";
import About from "./pages/About";
import BrowseMentorsPublic from "./pages/BrowseMentorsPublic";
import MenteeDashboard from "./pages/mentee/Dashboard";
import BrowseMentors from "./pages/mentee/BrowseMentors";
import MentorProfile from "./pages/mentee/MentorProfile";
import MenteeSessions from "./pages/mentee/Sessions";
import SessionRoom from "./pages/mentee/SessionRoom";
import MenteeSettings from "./pages/mentee/Settings";
import MenteeMessages from "./pages/mentee/Messages";
import MenteeResources from "./pages/mentee/Resources";
import MentorDashboard from "./pages/mentor/Dashboard";
import MentorshipRequests from "./pages/mentor/Requests";
import MyMentees from "./pages/mentor/Mentees";
import MenteeDetail from "./pages/mentor/MenteeDetail";
import SessionManagement from "./pages/mentor/SessionManagement";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminSessions from "./pages/admin/Sessions";
import AdminSettings from "./pages/admin/Settings";
import NotFound from "./pages/NotFound";
import MentorApplication from "./pages/MentorApplication";
import MentorPending from "./pages/MentorPending";

function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "browse", element: <BrowseMentorsPublic /> },
      { path: "how-it-works", element: <HowItWorks /> },
      { path: "for-mentors", element: <ForMentors /> },
      { path: "about", element: <About /> },

      // Mentor application flow (accessible when logged in as mentor, even if pending)
      { path: "mentor/apply", element: <MentorApplication /> },
{ path: "mentor/pending", element: <MentorPending /> },
      // Mentee Routes
      { path: "dashboard", element: <ProtectedRoute allowedRoles={["mentee"]}><MenteeDashboard /></ProtectedRoute> },
      { path: "mentors", element: <ProtectedRoute allowedRoles={["mentee"]}><BrowseMentors /></ProtectedRoute> },
      { path: "mentors/:id", element: <ProtectedRoute allowedRoles={["mentee"]}><MentorProfile /></ProtectedRoute> },
      { path: "sessions", element: <ProtectedRoute allowedRoles={["mentee"]}><MenteeSessions /></ProtectedRoute> },
      { path: "session/:id", element: <ProtectedRoute allowedRoles={["mentee", "mentor"]}><SessionRoom /></ProtectedRoute> },
      { path: "messages", element: <ProtectedRoute allowedRoles={["mentee"]}><MenteeMessages /></ProtectedRoute> },
      { path: "resources", element: <ProtectedRoute allowedRoles={["mentee"]}><MenteeResources /></ProtectedRoute> },
      { path: "settings", element: <ProtectedRoute allowedRoles={["mentee", "mentor"]}><MenteeSettings /></ProtectedRoute> },

      // Mentor Routes
      { path: "mentor/dashboard", element: <ProtectedRoute allowedRoles={["mentor"]}><MentorDashboard /></ProtectedRoute> },
      { path: "mentor/requests", element: <ProtectedRoute allowedRoles={["mentor"]}><MentorshipRequests /></ProtectedRoute> },
      { path: "mentor/mentees", element: <ProtectedRoute allowedRoles={["mentor"]}><MyMentees /></ProtectedRoute> },
      { path: "mentor/mentees/:id", element: <ProtectedRoute allowedRoles={["mentor"]}><MenteeDetail /></ProtectedRoute> },
      { path: "mentor/sessions", element: <ProtectedRoute allowedRoles={["mentor"]}><SessionManagement /></ProtectedRoute> },

      // Admin Routes
      { path: "admin/dashboard", element: <ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute> },
      { path: "admin/users", element: <ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute> },
      { path: "admin/sessions", element: <ProtectedRoute allowedRoles={["admin"]}><AdminSessions /></ProtectedRoute> },
      { path: "admin/settings", element: <ProtectedRoute allowedRoles={["admin"]}><AdminSettings /></ProtectedRoute> },

      { path: "*", element: <NotFound /> },
    ],
  },
]);