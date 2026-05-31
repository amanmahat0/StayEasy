import { useState, useEffect } from "react";
import { X, ShieldCheck, ShieldAlert, Mail, Calendar, Building2, ChevronRight, CheckCircle, XCircle, Loader, Phone, FileText, BookOpen, UserCheck, Clock, Home, AlertTriangle, ChevronLeft, ExternalLink } from "lucide-react";
import API from "../../services/api";

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
  kyc: {
    id: number;
    full_name: string;
    phone_number: string;
    citizenship_number: string;
    document_image: string | null;
    status: string;
    submitted_at: string;
    verified_by: { id: number; name: string; email: string } | null;
    verified_at: string | null;
  } | null;
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

export default function UserDetailModal({ userId, userType, isOpen, onClose, onKycUpdate }: Props) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [kycLoading, setKycLoading] = useState(false);
  const [kycAction, setKycAction] = useState<"approve" | "reject" | null>(null);
  const [kycSuccess, setKycSuccess] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError("");
    setKycSuccess("");
    API.get(`admin/users/${userId}/`)
      .then((res) => setUser(res.data))
      .catch((err) => setError(err.response?.data?.error || "Failed to load user details"))
      .finally(() => setLoading(false));
  }, [userId, isOpen]);

  const handleKycAction = async (action: "approve" | "reject") => {
    if (!user?.kyc) return;
    setKycLoading(true);
    setKycAction(action);
    setError("");
    setKycSuccess("");
    try {
      const status = action === "approve" ? "approved" : "rejected";
      await API.patch(`admin/kyc/${user.kyc.id}/update-status/`, { status });
      setKycSuccess(`KYC ${status === "approved" ? "approved" : "rejected"} successfully`);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto pt-4 pb-20" onClick={onClose}>
      <div className="w-full max-w-4xl px-4" onClick={(e) => e.stopPropagation()}>
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

        <div className="bg-white rounded-b-2xl shadow-lg">
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
            <div className="p-6 space-y-6">
              {/* Profile Header */}
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
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}

              {kycSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm flex items-center gap-2">
                  <CheckCircle size={16} />
                  {kycSuccess}
                </div>
              )}

              {/* Tenant Details */}
              {user.user_type === "tenant" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bookings Summary */}
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

                  {/* Account Info */}
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <UserCheck size={16} className="text-[#A989C8]" />
                      Account Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                        <span className="text-sm text-gray-500">Full Name</span>
                        <span className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                        <span className="text-sm text-gray-500">Email</span>
                        <span className="text-sm font-medium text-gray-900 truncate ml-3">{user.email}</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                        <span className="text-sm text-gray-500">Phone</span>
                        <span className="text-sm font-medium text-gray-900">N/A</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                        <span className="text-sm text-gray-500">Role</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">{user.user_type}</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                        <span className="text-sm text-gray-500">Total Bookings</span>
                        <span className="text-sm font-bold text-gray-900">{user.bookings_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Landlord Details */}
              {user.user_type === "owner" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* KYC Information */}
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
                        <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                          <span className="text-sm text-gray-500">Full Name (KYC)</span>
                          <span className="text-sm font-medium text-gray-900">{user.kyc.full_name}</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone size={13} /> Phone
                          </span>
                          <span className="text-sm font-medium text-gray-900">{user.kyc.phone_number}</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <FileText size={13} /> Citizenship No.
                          </span>
                          <span className="text-sm font-medium text-gray-900">{user.kyc.citizenship_number}</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                          <span className="text-sm text-gray-500">Submitted</span>
                          <span className="text-sm text-gray-700">
                            {new Date(user.kyc.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                        {user.kyc.verified_by && (
                          <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                            <span className="text-sm text-gray-500">Verified By</span>
                            <span className="text-sm font-medium text-gray-900">{user.kyc.verified_by.name}</span>
                          </div>
                        )}
                        {user.kyc.verified_at && (
                          <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                            <span className="text-sm text-gray-500">Verified At</span>
                            <span className="text-sm text-gray-700">
                              {new Date(user.kyc.verified_at).toLocaleString()}
                            </span>
                          </div>
                        )}

                        {/* KYC Actions */}
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
                            <CheckCircle size={16} />
                            KYC has been approved
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

                  {/* Account & Property Info */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <UserCheck size={16} className="text-[#A989C8]" />
                        Account Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                          <span className="text-sm text-gray-500">Full Name</span>
                          <span className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                          <span className="text-sm text-gray-500">Email</span>
                          <span className="text-sm font-medium text-gray-900 truncate ml-3">{user.email}</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                          <span className="text-sm text-gray-500">Phone</span>
                          <span className="text-sm font-medium text-gray-900">{user.kyc?.phone_number || "N/A"}</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                          <span className="text-sm text-gray-500">Role</span>
                          <span className="text-sm font-medium text-gray-900 capitalize">{user.user_type}</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                          <span className="text-sm text-gray-500">Properties</span>
                          <span className="text-sm font-bold text-gray-900">{user.properties_count || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                          <span className="text-sm text-gray-500">Total Bookings</span>
                          <span className="text-sm font-bold text-gray-900">{user.bookings_count}</span>
                        </div>
                      </div>
                    </div>

                    {/* KYC Document Preview */}
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
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
