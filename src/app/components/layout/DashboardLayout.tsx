import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { 
  Home, 
  Users, 
  Calendar, 
  Settings, 
  Menu, 
  LogOut,
  Search,
  MessageSquare,
  BarChart3,
  UserCheck,
  BookOpen,
  PanelLeftClose
} from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { NotificationDropdown } from "../ui/NotificationDropdown";

const defaultAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop";

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  role: "mentee" | "mentor" | "admin";
}

const SIDEBAR_CLOSED_KEY = "mentorme-sidebar-closed";

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== "undefined" && window.localStorage.getItem(SIDEBAR_CLOSED_KEY) === "true" ? false : true
  );

  const closeSidebar = () => {
    setSidebarOpen(false);
    try {
      localStorage.setItem(SIDEBAR_CLOSED_KEY, "true");
    } catch {}
  };
  const openSidebar = () => {
    setSidebarOpen(true);
    try {
      localStorage.removeItem(SIDEBAR_CLOSED_KEY);
    } catch {}
  };

  const navItems: Record<string, NavItem[]> = {
    mentee: [
      { label: "Dashboard", path: "/dashboard", icon: <Home size={20} /> },
      { label: "Browse Mentors", path: "/mentors", icon: <Search size={20} /> },
      { label: "My Sessions", path: "/sessions", icon: <Calendar size={20} /> },
      { label: "Messages", path: "/messages", icon: <MessageSquare size={20} /> },
      { label: "Resources", path: "/resources", icon: <BookOpen size={20} /> },
      { label: "Settings", path: "/settings", icon: <Settings size={20} /> },
    ],
    mentor: [
      { label: "Dashboard", path: "/mentor/dashboard", icon: <Home size={20} /> },
      { label: "Requests", path: "/mentor/requests", icon: <UserCheck size={20} /> },
      { label: "My Mentees", path: "/mentor/mentees", icon: <Users size={20} /> },
      { label: "Sessions", path: "/mentor/sessions", icon: <Calendar size={20} /> },
      { label: "Settings", path: "/settings", icon: <Settings size={20} /> },
    ],
    admin: [
      { label: "Dashboard", path: "/admin/dashboard", icon: <BarChart3 size={20} /> },
      { label: "Users", path: "/admin/users", icon: <Users size={20} /> },
      { label: "Sessions", path: "/admin/sessions", icon: <Calendar size={20} /> },
      { label: "Settings", path: "/admin/settings", icon: <Settings size={20} /> },
    ],
  };

  const currentNavItems = navItems[role];
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => (sidebarOpen ? closeSidebar() : openSidebar())}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? <PanelLeftClose size={20} /> : <Menu size={20} />}
            </button>
            <Link
              to={role === "mentee" ? "/dashboard" : role === "mentor" ? "/mentor/dashboard" : "/admin/dashboard"}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="hidden sm:inline text-xl font-semibold text-gray-900">MentorMe</span>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <NotificationDropdown />
            <div className="h-9 w-9 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              <img
                src={user?.avatarUrl ?? defaultAvatar}
                alt="Avatar"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultAvatar;
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-30
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <nav className="p-4 space-y-1">
          {currentNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => closeSidebar()}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${isActive(item.path) 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
            onClick={async () => { await logout(); navigate("/login", { replace: true }); }}
          >
            <LogOut size={20} className="mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Main Content */}
      <main className={`pt-16 transition-[padding] duration-300 ${sidebarOpen ? "lg:pl-64" : ""}`}>
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
