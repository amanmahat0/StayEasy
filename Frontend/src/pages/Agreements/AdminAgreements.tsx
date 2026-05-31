import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, Search, Eye, CheckCircle2, AlertCircle, Clock,
  Building2, User, ShieldCheck,
} from "lucide-react";
import { getAgreements } from "../../services/api";
import { Header } from "../../components/admin/Header";

interface AgreementItem {
  id: number;
  status: string;
  monthly_rent: string;
  security_deposit: string;
  tenant_name: string;
  landlord_name: string;
  property_name: string;
  tenant_signed_at: string | null;
  landlord_signed_at: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "text-gray-600", bg: "bg-gray-100" },
  pending_tenant: { label: "Pending Tenant", color: "text-blue-600", bg: "bg-blue-50" },
  pending_landlord: { label: "Pending Landlord", color: "text-purple-600", bg: "bg-purple-50" },
  active: { label: "Active", color: "text-green-600", bg: "bg-green-50" },
  expired: { label: "Expired", color: "text-red-600", bg: "bg-red-50" },
  terminated: { label: "Terminated", color: "text-red-600", bg: "bg-red-50" },
};

export default function AdminAgreements() {
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState<AgreementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getAgreements()
      .then(setAgreements)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = agreements
    .filter((a) => filter === "all" || a.status === filter)
    .filter((a) =>
      a.property_name.toLowerCase().includes(search.toLowerCase()) ||
      a.tenant_name.toLowerCase().includes(search.toLowerCase()) ||
      a.landlord_name.toLowerCase().includes(search.toLowerCase())
    );

  const stats = {
    total: agreements.length,
    active: agreements.filter((a) => a.status === "active").length,
    pending: agreements.filter((a) => a.status === "pending_tenant" || a.status === "pending_landlord").length,
    expired: agreements.filter((a) => a.status === "expired").length,
  };

  return (
    <>
      <Header />
      <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Agreement Records</h1>
          <p className="text-sm text-gray-500 mt-1">Audit and verify all rental agreements</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by property, tenant, landlord..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#A989C8]"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active", value: stats.active, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Expired", value: stats.expired, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4`}>
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className={`text-xs font-medium ${color}`}>{label}</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: "all", label: "All" },
          { key: "pending_tenant", label: "Pending Tenant" },
          { key: "pending_landlord", label: "Pending Landlord" },
          { key: "active", label: "Active" },
          { key: "expired", label: "Expired" },
          { key: "terminated", label: "Terminated" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === key
                ? "bg-[#A989C8] text-white"
                : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A989C8]" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Tenant</th>
                  <th className="px-4 py-3">Landlord</th>
                  <th className="px-4 py-3">Rent</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((ag) => {
                  const badge = STATUS_BADGE[ag.status] || STATUS_BADGE.draft;
                  return (
                    <tr key={ag.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">AGR-{String(ag.id).padStart(6, "0")}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="font-medium text-gray-900">{ag.property_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="text-gray-700">{ag.tenant_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="text-gray-700">{ag.landlord_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">NPR {ag.monthly_rent}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg} ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(ag.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/admin/agreements/${ag.id}`)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#A989C8] text-white rounded-lg text-xs font-bold hover:bg-[#9678b5]"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">
                      No agreements found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
