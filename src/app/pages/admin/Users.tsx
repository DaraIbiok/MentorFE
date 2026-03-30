import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Search, CheckCircle2, UserX, UserCheck, Eye, ChevronLeft, ChevronRight, Users, XCircle } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "../../components/ui/EmptyState";
import { getApiUrl, getAccessToken } from "../../../lib/api";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  isActive: boolean;
  verificationStatus: string;
  createdAt: string;
};

async function apiFetch(path: string, options: RequestInit = {}) {
  const base = getApiUrl();
  const token = await getAccessToken();
  return fetch(`${base}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...options.headers },
  });
}

const PER_PAGE = 8;

function getStatus(user: AdminUser): "Active" | "Pending" | "Suspended" {
  if (user.role === "mentor") {
    if (user.verificationStatus === "pending") return "Pending";
    if (user.verificationStatus === "rejected" || !user.isActive) return "Suspended";
    return "Active";
  }
  return user.isActive ? "Active" : "Suspended";
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [userForAction, setUserForAction] = useState<AdminUser | null>(null);

  useEffect(() => {
    apiFetch("/api/admin/users")
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchRole = roleFilter === "All" || u.role === roleFilter.toLowerCase();
    const status = getStatus(u);
    const matchStatus = statusFilter === "All" || status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  useEffect(() => { setCurrentPage(1); }, [searchQuery, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const totalUsers = users.length;
  const totalMentors = users.filter((u) => u.role === "mentor").length;
  const totalMentees = users.filter((u) => u.role === "mentee").length;
  const pendingApproval = users.filter((u) => u.role === "mentor" && u.verificationStatus === "pending").length;

  const updateUser = (id: string, patch: Partial<AdminUser>) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, ...patch } : u));
  };

  const handleApprove = async (user: AdminUser) => {
    try {
      const res = await apiFetch(`/api/admin/mentors/${user.id}/approve`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      updateUser(user.id, { verificationStatus: "approved", isActive: true });
      toast.success(`${user.name} has been approved as a mentor!`);
    } catch {
      toast.error("Failed to approve mentor");
    }
  };

  const handleReject = async (user: AdminUser) => {
    try {
      const res = await apiFetch(`/api/admin/mentors/${user.id}/reject`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      updateUser(user.id, { verificationStatus: "rejected", isActive: false });
      toast.success(`${user.name}'s application has been rejected.`);
    } catch {
      toast.error("Failed to reject mentor");
    }
  };

  const handleSuspendConfirm = async () => {
    if (!userForAction) return;
    const isActive = getStatus(userForAction) !== "Suspended";
    const path = isActive
      ? `/api/admin/users/${userForAction.id}/deactivate`
      : `/api/admin/users/${userForAction.id}/activate`;
    try {
      const res = await apiFetch(path, { method: "PATCH" });
      if (!res.ok) throw new Error();
      updateUser(userForAction.id, { isActive: !isActive });
      toast.success(isActive ? `${userForAction.name} suspended.` : `${userForAction.name} activated.`);
    } catch {
      toast.error("Failed to update user");
    }
    setSuspendDialogOpen(false);
    setUserForAction(null);
  };

  return (
    <DashboardLayout role="admin">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <Badge className="bg-indigo-50 text-indigo-600 border-0 text-sm font-semibold">
            {totalUsers} users
          </Badge>
        </div>
        <p className="text-gray-600 mt-1">Manage platform users and permissions</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-5 border-0 shadow-lg">
          <p className="text-sm text-gray-600 mb-1">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
        </Card>
        <Card className="p-5 border-0 shadow-lg">
          <p className="text-sm text-gray-600 mb-1">Total Mentors</p>
          <p className="text-2xl font-bold text-gray-900">{totalMentors}</p>
        </Card>
        <Card className="p-5 border-0 shadow-lg">
          <p className="text-sm text-gray-600 mb-1">Total Mentees</p>
          <p className="text-2xl font-bold text-gray-900">{totalMentees}</p>
        </Card>
        <Card className="p-5 border-0 shadow-lg">
          <p className="text-sm text-gray-600 mb-1">Pending Approval</p>
          <p className="text-2xl font-bold text-orange-600">{pendingApproval}</p>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        {/* Filter bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[140px]"
            >
              <option value="All">All roles</option>
              <option value="Mentor">Mentors</option>
              <option value="Mentee">Mentees</option>
              <option value="Admin">Admins</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[140px]"
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-0">
                      <div className="p-8">
                        <EmptyState icon={<Users size={48} />} title="No users found"
                          subtitle="Try adjusting your search or filter criteria." />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((user) => {
                    const status = getStatus(user);
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-indigo-100 flex-shrink-0 flex items-center justify-center">
                              {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-indigo-600 font-semibold">{(user.name ?? "U")[0]}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            user.role === "mentor" ? "bg-indigo-50 text-indigo-600 border-0" :
                            user.role === "admin" ? "bg-purple-50 text-purple-600 border-0" :
                            "bg-gray-100 text-gray-700 border-0"
                          }>
                            {capitalize(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            status === "Active" ? "bg-emerald-50 text-emerald-600 border-0" :
                            status === "Pending" ? "bg-yellow-50 text-yellow-600 border-0" :
                            "bg-red-50 text-red-600 border-0"
                          }>
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 flex-wrap">
                            {status === "Pending" && user.role === "mentor" && (
                              <>
                                <Button size="sm" variant="outline"
                                  className="text-emerald-600 hover:text-emerald-700 hover:border-emerald-300"
                                  onClick={() => handleApprove(user)}>
                                  <CheckCircle2 size={16} className="mr-1" /> Approve
                                </Button>
                                <Button size="sm" variant="outline"
                                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                                  onClick={() => handleReject(user)}>
                                  <XCircle size={16} className="mr-1" /> Reject
                                </Button>
                              </>
                            )}
                            {status !== "Pending" && (
                              <Button size="sm" variant="outline"
                                className={status === "Suspended"
                                  ? "text-emerald-600 hover:text-emerald-700"
                                  : "text-red-600 hover:text-red-700 hover:border-red-300"}
                                onClick={() => { setUserForAction(user); setSuspendDialogOpen(true); }}>
                                {status === "Suspended"
                                  ? <><UserCheck size={16} className="mr-1" /> Activate</>
                                  : <><UserX size={16} className="mr-1" /> Suspend</>}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {filtered.length > PER_PAGE && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft size={16} className="mr-1" /> Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                Next <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userForAction && getStatus(userForAction) === "Active" ? "Suspend user?" : "Activate user?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {userForAction && getStatus(userForAction) === "Active"
                ? `Are you sure you want to suspend ${userForAction?.name}? They will lose access to the platform.`
                : `Are you sure you want to activate ${userForAction?.name}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserForAction(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspendConfirm}
              className={userForAction && getStatus(userForAction) === "Active"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"}
            >
              {userForAction && getStatus(userForAction) === "Active" ? "Suspend" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}