import { Navigate, useLocation } from "react-router";
import { useAuth, type AuthRole } from "../context/AuthContext";

const DASHBOARD_BY_ROLE: Record<AuthRole, string> = {
  mentee: "/dashboard",
  mentor: "/mentor/dashboard",
  admin: "/admin/dashboard",
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AuthRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnUrl=${returnUrl}`} state={{ from: location }} replace />;
  }

  // Pending mentor — redirect to apply or pending page
  // Allow access to /mentor/apply, /mentor/pending, and /settings
  const allowedPendingPaths = ["/mentor/apply", "/mentor/pending", "/settings"];
  const isPendingMentor =
    user.role === "mentor" &&
    (user as any).verificationStatus === "pending";

  if (isPendingMentor && !allowedPendingPaths.some(p => location.pathname.startsWith(p))) {
  return <Navigate to="/mentor/apply?step=1" replace />;
}

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={DASHBOARD_BY_ROLE[user.role]} replace />;
  }

  return <>{children}</>;
}