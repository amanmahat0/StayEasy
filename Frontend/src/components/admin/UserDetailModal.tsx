import { useState, useEffect } from "react";
import {
  X, ShieldCheck, ShieldAlert, Mail, Calendar, Building2,
  ChevronRight, CheckCircle, XCircle, Loader, Phone, FileText,
  BookOpen, UserCheck, Clock, Home, AlertTriangle, ChevronLeft,
  ExternalLink, Ban, Flag, History, Gavel, MessageSquare,
} from "lucide-react";
import API from "../../services/api";
import {
  adminWarnUser, adminSuspendUser, adminLiftSuspension,
  adminAddNote, adminGetModerationHistory,
} from "../../services/api";

interface BookingSummary {
  id: number;
  property_title: string;
  property_id: number;
  check_in: string;
  check_out: string;
  total_price: string;
  status: string;
  payment_status: string;
  created_at: string;
}

interface KYCInfo {
  id: number;
  full_name: string;
  phone_number: string;
  citizenship_number: string;
  document_image: string | null;
  status: string;
  submitted_at: string;
  verified_by: { id: number; name: string; email: string } | null;
  verified_at: string | null;
}

interface WarningData {
  id: number;
  user: number;
  issued_by: number;
  issued_by_name: string;
  reason: string;
  reason_display: string;
  custom_reason: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface SuspensionData {
  id: number;
  user: number;
  issued_by: number;
  issued_by_name: string;
  reason: string;
  duration: string;
  duration_display: string;
  expires_at: string | null;
  is_active: boolean;
  lifted_at: string | null;
  lifted_by: number | null;
  lifted_by_name: string | null;
  created_at: string;
}

interface ModerationActionData {
  id: number;
  user: number;
  admin: number;
  admin_name: string;
  action_type: string;
  action_type_display: string;
  reason: string | null;
  details: any;
  created_at: string;
}

interface ModerationInfo {
  warnings_count: number;
  active_warnings_count: number;
  suspensions_count: number;
  active_suspension: SuspensionData | null;
  recent_warnings: WarningData[];
  recent_actions: ModerationActionData[];
}

interface UserDetail {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  role: string;
  email_verified: boolean;
  date_joined: string;
  is_active: boolean;
  kyc: KYCInfo | null;
  bookings_count: number;
  properties_count?: number;
  bookings: BookingSummary[] | null;
  current_rental: {
    id: number;
    property_title: string;
    property_id: number;
    check_in: string;
    check_out: string;
    status: string;
  } | null;
  moderation: ModerationInfo;
}

interface Props {
  userId: number;
  userType: "users" | "landlords";
  isOpen: boolean;
  onClose: () => void;
  onKycUpdate?: () => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  confirmed: "bg-green-50 text-green-700 border-green-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-gray-50 text-gray-600 border-gray-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  unpaid: "bg-yellow-50 text-yellow-700 border-yellow-200",
  paid: "bg-green-50 text-green-700 border-green-200",
};

const getInitials = (first: string, last: string) =>
  `${(first || "")[0] || ""}${(last || "")[0] || ""}`.toUpperCase() || "?";

const avatarColors = [
  "bg-purple-500", "bg-blue-500", "bg-green-500", "bg-orange-500",
  "bg-pink-500", "bg-teal-500", "bg-indigo-500", "bg-rose-500",
];

type Tab = "overview" | "warnings" | "suspensions" | "audit";

const WARNING_REASONS = [
  { value: "fake_info", label: "Fake Information" },
  { value: "suspicious_activity", label: "Suspicious Activity" },
  { value: "policy_violation", label: "Policy Violation" },
  { value: "payment_issues", label: "Payment Issues" },
  { value: "property_listing_issues", label: "Property Listing Issues" },
  { value: "custom", label: "Custom Reason" },
];

const SUSPENSION_DURATIONS = [
  { value: "24h", label: "24 Hours" },
  { value: "3d", label: "3 Days" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "permanent", label: "Permanent" },
];

const actionIcons: Record<string, any> = {
  warning: Flag,
  suspension: Ban,
  lift_suspension: CheckCircle,
  kyc_approve: CheckCircle,
  kyc_reject: XCircle,
  kyc_resubmission: Loader,
  property_hide: Home,
  property_unhide: Home,
  note: MessageSquare,
};

export default function UserDetailModal({ userId, userType, isOpen, onClose, onKycUpdate }: Props) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");

  // KYC state
  const [kycLoading, setKycLoading] = useState(false);
  const [kycAction, setKycAction] = useState<"approve" | "reject" | null>(null);
  const [kycSuccess, setKycSuccess] = useState("");

  // Warning form state
  const [warnReason, setWarnReason] = useState("fake_info");
  const [warnCustomReason, setWarnCustomReason] = useState("");
  const [warnMessage, setWarnMessage] = useState("");
  const [warnLoading, setWarnLoading] = useState(false);
  const [warnError, setWarnError] = useState("");
  const [warnSuccess, setWarnSuccess] = useState("");

  // Suspension form state
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDuration, setSuspendDuration] = useState("24h");
  const [suspendLoading, setSuspendLoading] = useState(false);
  const [suspendError, setSuspendError] = useState("");
  const [suspendSuccess, setSuspendSuccess] = useState("");

  // Moderation history state
  const [modHistory, setModHistory] = useState<{
    warnings: WarningData[];
    suspensions: SuspensionData[];
    moderation_actions: ModerationActionData[];
    active_suspension: SuspensionData | null;
  } | null>(null);
  const [modHistoryLoading, setModHistoryLoading] = useState(false);

  // Note form
  const [noteText, setNoteText] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError("");
    setKycSuccess("");
    setTab("overview");
    API.get(`admin/users/${userId}/`)
      .then((res) => setUser(res.data))
      .catch((err) => setError(err.response?.data?.error || "Failed to load user details"))
      .finally(() => setLoading(false));
  }, [userId, isOpen]);

  const loadModHistory = async () => {
    setModHistoryLoading(true);
    try {
      const data = await adminGetModerationHistory(userId);
      setModHistory(data);
    } catch (err) {
      console.error("Failed to load moderation history", err);
    } finally {
      setModHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "warnings" || tab === "suspensions" || tab === "audit") {
      loadModHistory();
    }
  }, [tab, userId]);

  const handleKycAction = async (action: "approve" | "reject") => {
    if (!user?.kyc) return;
    setKycLoading(true);
    setKycAction(action);
    setError("");
    setKycSuccess("");
    try {
      const status = action === "approve" ? "approved" : "rejected";
      await API.patch(`admin/kyc/${user.kyc.id}/update-status/`, { status });
      setKycSuccess(`KYC ${status} successfully`);
      setUser((prev) =>
        prev && prev.kyc ? { ...prev, kyc: { ...prev.kyc, status } } : prev
      );
      onKycUpdate?.();
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${action} KYC`);
    } finally {
      setKycLoading(false);
      setKycAction(null);
    }
  };

  const handleWarn = async () => {
    setWarnError("");
    setWarnSuccess("");
    if (!warnMessage.trim()) {
      setWarnError("Message is required");
      return;
    }
    setWarnLoading(true);
    try {
      await adminWarnUser(userId, {
        reason: warnReason,
        custom_reason: warnReason === "custom" ? warnCustomReason : undefined,
        message: warnMessage,
      });
      setWarnSuccess("Warning issued successfully");
      setWarnMessage("");
      setWarnCustomReason("");
      loadModHistory();
    } catch (err: any) {
      setWarnError(err.response?.data?.error || "Failed to issue warning");
    } finally {
      setWarnLoading(false);
    }
  };

  const handleSuspend = async () => {
    setSuspendError("");
    setSuspendSuccess("");
    if (!suspendReason.trim()) {
      setSuspendError("Suspension reason is required");
      return;
    }
    setSuspendLoading(true);
    try {
      await adminSuspendUser(userId, {
        reason: suspendReason,
        duration: suspendDuration,
      });
      setSuspendSuccess("Account suspended successfully");
      setSuspendReason("");
      loadModHistory();
    } catch (err: any) {
      setSuspendError(err.response?.data?.error || "Failed to suspend account");
    } finally {
      setSuspendLoading(false);
    }
  };

  const handleLiftSuspension = async (suspensionId: number) => {
    setSuspendError("");
    setSuspendSuccess("");
    setSuspendLoading(true);
    try {
      await adminLiftSuspension(suspensionId);
      setSuspendSuccess("Suspension lifted successfully");
      loadModHistory();
    } catch (err: any) {
      setSuspendError(err.response?.data?.error || "Failed to lift suspension");
    } finally {
      setSuspendLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setNoteLoading(true);
    setNoteSuccess("");
    try {
      await adminAddNote(userId, noteText);
      setNoteSuccess("Note added");
      setNoteText("");
      loadModHistory();
    } catch (err) {
      console.error("Failed to add note", err);
    } finally {
      setNoteLoading(false);
    }
  };

  if (!isOpen) return null;

  const tabs: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: "overview", label: "Overview", icon: UserCheck },
    { key: "warnings", label: "Warnings", icon: Flag, count: user?.moderation?.active_warnings_count },
    { key: "suspensions", label: "Suspensions", icon: Ban, count: user?.moderation?.active_suspension ? 1 : 0 },
    { key: "audit", label: "Audit Log", icon: History },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto pt-4 pb-20" onClick={onClose}>
      <div className="w-full max-w-5xl px-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-white rounded-t-2xl border-b border-gray-100 p-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ChevronLeft size={20} className="text-gray-500" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900">User Details</h2>
              <p className="text-sm text-gray-500">
                {userType === "users" ? "Tenant" : "Landlord"} profile overview
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="bg-white shadow-lg">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader size={36} className="animate-spin text-[#A989C8]" />
            </div>
          ) : error && !user ? (
            <div className="p-8 text-center">
              <AlertTriangle size={40} className="mx-auto mb-4 text-red-400" />
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : user ? (
            <>
              {/* Profile Header */}
              <div className="p-6 pb-4">
                <div className="flex flex-col sm:flex-row items-start gap-5">
                  <div className={`w-20 h-20 rounded-2xl ${avatarColors[user.id % avatarColors.length]} flex items-center justify-center text-white font-bold text-2xl shadow-sm shrink-0`}>
                    {getInitials(user.first_name, user.last_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {user.first_name} {user.last_name}
                        </h3>
                        <p className="text-gray-500 flex items-center gap-2 mt-1">
                          <Mail size={14} />
                          {user.email}
                          <span className="text-gray-300 mx-1">·</span>
                          @{user.username}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 ${
                        user.email_verified ? "bg-green-50 text-green-700 border border-green-200" : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                      }`}>
                        {user.email_verified ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
                        {user.email_verified ? "Email Verified" : "Email Unverified"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 mt-3 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={14} />
                        Joined {new Date(user.date_joined).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                      }`}>
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                      {user.moderation?.active_suspension && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                          <Ban size={12} /> Suspended
                        </span>
                      )}
                      {user.moderation?.active_warnings_count > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                          <Flag size={12} /> {user.moderation.active_warnings_count} Warning{user.moderation.active_warnings_count > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-100 px-6">
                <div className="flex gap-6 overflow-x-auto">
                  {tabs.map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex items-center gap-2 pb-3 border-b-2 text-sm font-medium transition-colors shrink-0 ${
                          tab === t.key
                            ? "border-[#A989C8] text-[#A989C8]"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <Icon size={16} />
                        {t.label}
                        {t.count !== undefined && t.count > 0 && (
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                            t.key === "suspensions"
                              ? "bg-red-100 text-red-700"
                              : t.key === "warnings"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-[#A989C8]/10 text-[#A989C8]"
                          }`}>
                            {t.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Error/Success banners */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                    <AlertTriangle size={16} /> {error}
                  </div>
                )}
                {kycSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm flex items-center gap-2">
                    <CheckCircle size={16} /> {kycSuccess}
                  </div>
                )}

                {/* ── Overview Tab ── */}
                {tab === "overview" && (
                  <>
                    {/* Moderation Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Flag size={16} className="text-yellow-600" />
                          <span className="text-sm font-semibold text-yellow-800">Warnings</span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-900">
                          {user.moderation?.active_warnings_count || 0}
                          <span className="text-sm font-normal text-yellow-600 ml-1">active</span>
                        </p>
                        <p className="text-xs text-yellow-600 mt-0.5">
                          {user.moderation?.warnings_count || 0} total issued
                        </p>
                      </div>
                      <div className={`rounded-xl p-4 border ${
                        user.moderation?.active_suspension
                          ? "bg-red-50 border-red-100"
                          : "bg-gray-50 border-gray-100"
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Ban size={16} className={user.moderation?.active_suspension ? "text-red-600" : "text-gray-400"} />
                          <span className={`text-sm font-semibold ${user.moderation?.active_suspension ? "text-red-800" : "text-gray-500"}`}>
                            Suspension
                          </span>
                        </div>
                        {user.moderation?.active_suspension ? (
                          <>
                            <p className="text-sm font-medium text-red-700">Active</p>
                            <p className="text-xs text-red-500 mt-0.5">
                              {user.moderation.active_suspension.duration_display}
                              {user.moderation.active_suspension.expires_at && (
                                <> · Expires {new Date(user.moderation.active_suspension.expires_at).toLocaleDateString()}</>
                              )}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-lg font-bold text-gray-400">None</p>
                            <p className="text-xs text-gray-400 mt-0.5">No active suspension</p>
                          </>
                        )}
                      </div>
                      <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                        <div className="flex items-center gap-2 mb-1">
                          <History size={16} className="text-purple-600" />
                          <span className="text-sm font-semibold text-purple-800">Actions</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-900">
                          {user.moderation?.recent_actions?.length || 0}
                        </p>
                        <p className="text-xs text-purple-600 mt-0.5">recent moderation actions</p>
                      </div>
                    </div>

                    {/* Existing content - Tenant / Landlord sections */}
                    {user.user_type === "tenant" && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <BookOpen size={16} className="text-[#A989C8]" />
                            Booking History ({user.bookings_count})
                          </h4>
                          {user.current_rental ? (
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                              <p className="text-xs font-semibold text-blue-600 mb-1 flex items-center gap-1">
                                <Home size={13} /> Currently Rented
                              </p>
                              <p className="font-medium text-gray-900">{user.current_rental.property_title}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(user.current_rental.check_in).toLocaleDateString()} – {new Date(user.current_rental.check_out).toLocaleDateString()}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 mb-4">No current rental</p>
                          )}
                          {user.bookings && user.bookings.length > 0 ? (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {user.bookings.map((b) => (
                                <div key={b.id} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">{b.property_title}</p>
                                    <p className="text-xs text-gray-400">
                                      {new Date(b.check_in).toLocaleDateString()} – {new Date(b.check_out).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0 ml-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[b.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                                      {b.status}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[b.payment_status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                                      {b.payment_status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400">No bookings yet</p>
                          )}
                        </div>

                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <UserCheck size={16} className="text-[#A989C8]" />
                            Account Information
                          </h4>
                          <div className="space-y-3">
                            <Row label="Full Name" value={`${user.first_name} ${user.last_name}`} />
                            <Row label="Email" value={user.email} />
                            <Row label="Phone" value="N/A" />
                            <Row label="Role" value={user.user_type} />
                            <Row label="Total Bookings" value={String(user.bookings_count)} bold />
                          </div>
                        </div>
                      </div>
                    )}

                    {user.user_type === "owner" && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <ShieldCheck size={16} className="text-[#A989C8]" />
                            KYC Verification
                          </h4>
                          {user.kyc ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                                <span className="text-sm text-gray-500">Status</span>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                  statusColors[user.kyc.status] || "bg-gray-50 text-gray-600 border-gray-200"
                                }`}>
                                  {user.kyc.status.charAt(0).toUpperCase() + user.kyc.status.slice(1)}
                                </span>
                              </div>
                              <Row label="Full Name (KYC)" value={user.kyc.full_name} />
                              <Row label={<><Phone size={13} /> Phone</>} value={user.kyc.phone_number} />
                              <Row label={<><FileText size={13} /> Citizenship</>} value={user.kyc.citizenship_number} />
                              <Row label="Submitted" value={new Date(user.kyc.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
                              {user.kyc.verified_by && <Row label="Verified By" value={user.kyc.verified_by.name} />}
                              {user.kyc.verified_at && <Row label="Verified At" value={new Date(user.kyc.verified_at).toLocaleString()} />}

                              {(user.kyc.status === "pending" || user.kyc.status === "rejected") && (
                                <div className="flex items-center gap-3 pt-2">
                                  <button
                                    onClick={() => handleKycAction("approve")}
                                    disabled={kycLoading}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 transition-colors disabled:opacity-50"
                                  >
                                    {kycLoading && kycAction === "approve" ? (
                                      <Loader size={16} className="animate-spin" />
                                    ) : <CheckCircle size={16} />}
                                    Approve KYC
                                  </button>
                                  <button
                                    onClick={() => handleKycAction("reject")}
                                    disabled={kycLoading}
                                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
                                  >
                                    {kycLoading && kycAction === "reject" ? (
                                      <Loader size={16} className="animate-spin" />
                                    ) : <XCircle size={16} />}
                                    Reject KYC
                                  </button>
                                </div>
                              )}

                              {user.kyc.status === "approved" && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-center gap-2">
                                  <CheckCircle size={16} /> KYC has been approved
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <ShieldAlert size={32} className="mx-auto mb-2 text-gray-300" />
                              <p className="text-sm text-gray-400">No KYC submitted yet</p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-6">
                          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <UserCheck size={16} className="text-[#A989C8]" />
                              Account Information
                            </h4>
                            <div className="space-y-3">
                              <Row label="Full Name" value={`${user.first_name} ${user.last_name}`} />
                              <Row label="Email" value={user.email} />
                              <Row label="Phone" value={user.kyc?.phone_number || "N/A"} />
                              <Row label="Role" value={user.user_type} />
                              <Row label="Properties" value={String(user.properties_count || 0)} bold />
                              <Row label="Total Bookings" value={String(user.bookings_count)} bold />
                            </div>
                          </div>

                          {user.kyc?.document_image && (
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <FileText size={16} className="text-[#A989C8]" />
                                KYC Document
                              </h4>
                              <a
                                href={`http://127.0.0.1:8000${user.kyc.document_image}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block relative rounded-xl overflow-hidden border border-gray-200 bg-white hover:border-[#A989C8] transition-colors group"
                              >
                                <img
                                  src={`http://127.0.0.1:8000${user.kyc.document_image}`}
                                  alt="KYC Document"
                                  className="w-full h-48 object-contain bg-gray-100"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                    (e.target as HTMLImageElement).parentElement!.classList.add("p-6");
                                    (e.target as HTMLImageElement).parentElement!.innerHTML = `
                                      <div class="text-center">
                                        <FileText class="mx-auto mb-2 text-gray-300" size="32" />
                                        <p class="text-sm text-gray-500">Document preview unavailable</p>
                                        <p class="text-xs text-gray-400 mt-1">Click to open directly</p>
                                      </div>
                                    `;
                                  }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
                                  <ExternalLink size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Add Note */}
                    <div className="mt-6 bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <MessageSquare size={16} className="text-[#A989C8]" />
                        Add Admin Note
                      </h4>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Enter a note about this user..."
                          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#A989C8]/30 focus:border-[#A989C8]"
                        />
                        <button
                          onClick={handleAddNote}
                          disabled={noteLoading || !noteText.trim()}
                          className="px-5 py-2.5 rounded-xl bg-[#A989C8] text-white text-sm font-bold hover:bg-[#9878b7] transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {noteLoading ? <Loader size={16} className="animate-spin" /> : <MessageSquare size={16} />}
                          Add Note
                        </button>
                      </div>
                      {noteSuccess && <p className="text-xs text-green-600 mt-2">{noteSuccess}</p>}
                    </div>
                  </>
                )}

                {/* ── Warnings Tab ── */}
                {tab === "warnings" && (
                  <div className="space-y-6">
                    {/* Issue Warning Form */}
                    <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Flag size={18} className="text-yellow-600" />
                        Issue Warning
                      </h4>
                      {warnSuccess && (
                        <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg text-green-600 text-xs flex items-center gap-1">
                          <CheckCircle size={14} /> {warnSuccess}
                        </div>
                      )}
                      {warnError && (
                        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs flex items-center gap-1">
                          <AlertTriangle size={14} /> {warnError}
                        </div>
                      )}
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Warning Reason</label>
                          <select
                            value={warnReason}
                            onChange={(e) => setWarnReason(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#A989C8]/30"
                          >
                            {WARNING_REASONS.map((r) => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>
                        </div>
                        {warnReason === "custom" && (
                          <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">Custom Reason</label>
                            <input
                              type="text"
                              value={warnCustomReason}
                              onChange={(e) => setWarnCustomReason(e.target.value)}
                              placeholder="Enter custom reason..."
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#A989C8]/30"
                            />
                          </div>
                        )}
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Warning Message</label>
                          <textarea
                            value={warnMessage}
                            onChange={(e) => setWarnMessage(e.target.value)}
                            rows={3}
                            placeholder="Describe the violation and what action is expected..."
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#A989C8]/30 resize-none"
                          />
                        </div>
                        <button
                          onClick={handleWarn}
                          disabled={warnLoading}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500 text-white font-bold text-sm hover:bg-yellow-600 transition-colors disabled:opacity-50"
                        >
                          {warnLoading ? <Loader size={16} className="animate-spin" /> : <Flag size={16} />}
                          Issue Warning
                        </button>
                      </div>
                    </div>

                    {/* Warning History */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <History size={16} className="text-[#A989C8]" />
                        Warning History
                      </h4>
                      {modHistoryLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader size={24} className="animate-spin text-[#A989C8]" />
                        </div>
                      ) : modHistory?.warnings && modHistory.warnings.length > 0 ? (
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {modHistory.warnings.map((w) => (
                            <div key={w.id} className={`p-4 rounded-xl border ${
                              w.is_read ? "bg-white border-gray-100" : "bg-yellow-50/50 border-yellow-100"
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                    w.is_read ? "bg-gray-50 text-gray-500 border-gray-200" : "bg-yellow-100 text-yellow-700 border-yellow-200"
                                  }`}>
                                    {w.is_read ? "Read" : "Unread"}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                    {w.reason_display}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-400">
                                  {new Date(w.created_at).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{w.message}</p>
                              {w.custom_reason && (
                                <p className="text-xs text-gray-500 mt-1">Custom: {w.custom_reason}</p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                By: {w.issued_by_name}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 text-center py-6">No warnings issued</p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Suspensions Tab ── */}
                {tab === "suspensions" && (
                  <div className="space-y-6">
                    {/* Active Suspension Alert */}
                    {modHistory?.active_suspension && (
                      <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                        <div className="flex items-start gap-3">
                          <Ban size={24} className="text-red-500 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-bold text-red-800">Active Suspension</h4>
                            <p className="text-sm text-red-700 mt-1">{modHistory.active_suspension.reason}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-red-600">
                              <span>Duration: {modHistory.active_suspension.duration_display}</span>
                              {modHistory.active_suspension.expires_at && (
                                <span>Expires: {new Date(modHistory.active_suspension.expires_at).toLocaleDateString()}</span>
                              )}
                              <span>By: {modHistory.active_suspension.issued_by_name}</span>
                            </div>
                            <button
                              onClick={() => handleLiftSuspension(modHistory.active_suspension!.id)}
                              disabled={suspendLoading}
                              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-colors disabled:opacity-50"
                            >
                              {suspendLoading ? <Loader size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                              Lift Suspension
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Suspend Form */}
                    <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Ban size={18} className="text-red-600" />
                        Suspend Account
                      </h4>
                      {suspendSuccess && (
                        <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg text-green-600 text-xs flex items-center gap-1">
                          <CheckCircle size={14} /> {suspendSuccess}
                        </div>
                      )}
                      {suspendError && (
                        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs flex items-center gap-1">
                          <AlertTriangle size={14} /> {suspendError}
                        </div>
                      )}
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Suspension Duration</label>
                          <select
                            value={suspendDuration}
                            onChange={(e) => setSuspendDuration(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#A989C8]/30"
                          >
                            {SUSPENSION_DURATIONS.map((d) => (
                              <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 mb-1 block">Suspension Reason *</label>
                          <textarea
                            value={suspendReason}
                            onChange={(e) => setSuspendReason(e.target.value)}
                            rows={3}
                            placeholder="Describe why this account is being suspended..."
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#A989C8]/30 resize-none"
                          />
                        </div>
                        <button
                          onClick={handleSuspend}
                          disabled={suspendLoading}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          {suspendLoading ? <Loader size={16} className="animate-spin" /> : <Ban size={16} />}
                          Suspend Account
                        </button>
                      </div>
                    </div>

                    {/* Suspension History */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <History size={16} className="text-[#A989C8]" />
                        Suspension History
                      </h4>
                      {modHistoryLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader size={24} className="animate-spin text-[#A989C8]" />
                        </div>
                      ) : modHistory?.suspensions && modHistory.suspensions.length > 0 ? (
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {modHistory.suspensions.map((s) => (
                            <div key={s.id} className={`p-4 rounded-xl border ${
                              s.is_active ? "bg-red-50/50 border-red-100" : "bg-white border-gray-100"
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                    s.is_active ? "bg-red-100 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"
                                  }`}>
                                    {s.is_active ? "Active" : "Lifted"}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                    {s.duration_display}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-400">
                                  {new Date(s.created_at).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{s.reason}</p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
                                <span>By: {s.issued_by_name}</span>
                                {s.expires_at && <span>Expires: {new Date(s.expires_at).toLocaleDateString()}</span>}
                                {s.lifted_at && <span>Lifted: {new Date(s.lifted_at).toLocaleString()}</span>}
                                {s.lifted_by_name && <span>Lifted by: {s.lifted_by_name}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 text-center py-6">No suspensions recorded</p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Audit Log Tab ── */}
                {tab === "audit" && (
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <History size={16} className="text-[#A989C8]" />
                      Moderation Audit Log
                    </h4>
                    {modHistoryLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader size={24} className="animate-spin text-[#A989C8]" />
                      </div>
                    ) : modHistory?.moderation_actions && modHistory.moderation_actions.length > 0 ? (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {modHistory.moderation_actions.map((a) => {
                          const Icon = actionIcons[a.action_type] || History;
                          const colorMap: Record<string, string> = {
                            warning: "border-yellow-200 bg-yellow-50",
                            suspension: "border-red-200 bg-red-50",
                            lift_suspension: "border-green-200 bg-green-50",
                            kyc_approve: "border-green-200 bg-green-50",
                            kyc_reject: "border-red-200 bg-red-50",
                            kyc_resubmission: "border-blue-200 bg-blue-50",
                            property_hide: "border-orange-200 bg-orange-50",
                            property_unhide: "border-green-200 bg-green-50",
                            note: "border-gray-200 bg-gray-100",
                          };
                          const iconColor: Record<string, string> = {
                            warning: "text-yellow-600",
                            suspension: "text-red-600",
                            lift_suspension: "text-green-600",
                            kyc_approve: "text-green-600",
                            kyc_reject: "text-red-600",
                            property_hide: "text-orange-600",
                            property_unhide: "text-green-600",
                            note: "text-gray-500",
                          };
                          return (
                            <div key={a.id} className={`flex items-start gap-3 p-3 rounded-xl border ${colorMap[a.action_type] || "bg-white border-gray-100"}`}>
                              <div className={`mt-0.5 ${iconColor[a.action_type] || "text-gray-400"}`}>
                                <Icon size={18} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-900">{a.action_type_display}</span>
                                  <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-0.5">{a.reason || "—"}</p>
                                <p className="text-xs text-gray-400 mt-0.5">By: {a.admin_name}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-6">No moderation actions recorded</p>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: any; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm ${bold ? "font-bold" : "font-medium"} text-gray-900 truncate ml-3`}>{value}</span>
    </div>
  );
}
