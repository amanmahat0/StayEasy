import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, ChevronRight, Clock, CheckCircle2, AlertCircle,
  Search, Download, Eye,
} from "lucide-react";
import { getAgreements, downloadAgreementPDF } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import PublicNavbar from "../../components/Navbar/PublicNavbar";

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

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  draft: { label: "Draft", color: "text-gray-600", bg: "bg-gray-100", icon: FileText },
  pending_tenant: { label: "Pending Your Signature", color: "text-blue-600", bg: "bg-blue-50", icon: Clock },
  pending_landlord: { label: "Pending Landlord", color: "text-purple-600", bg: "bg-purple-50", icon: Clock },
  active: { label: "Active", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle2 },
  expired: { label: "Expired", color: "text-red-600", bg: "bg-red-50", icon: AlertCircle },
  terminated: { label: "Terminated", color: "text-red-600", bg: "bg-red-50", icon: AlertCircle },
};

export default function AgreementList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [agreements, setAgreements] = useState<AgreementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAgreements()
      .then(setAgreements)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = agreements.filter((a) =>
    a.property_name.toLowerCase().includes(search.toLowerCase()) ||
    a.landlord_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Agreements</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage your rental agreements</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agreements..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#A989C8]"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A989C8]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800">No Agreements Yet</h3>
            <p className="text-sm text-gray-500 mt-1">Agreements will appear here after booking and payment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((ag) => {
              const badge = STATUS_BADGE[ag.status] || STATUS_BADGE.draft;
              const Icon = badge.icon;
              return (
                <div
                  key={ag.id}
                  onClick={() => navigate(`/agreements/${ag.id}`)}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 hover:shadow-md hover:border-[#A989C8]/30 transition cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-[#A989C8]/10 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-[#A989C8]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 text-sm">{ag.property_name}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg} ${badge.color}`}>
                            <Icon className="w-3 h-3" />
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Landlord: {ag.landlord_name} · NPR {ag.monthly_rent}/mo
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Created: {new Date(ag.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                      <button
                        onClick={(e) => { e.stopPropagation(); downloadAgreementPDF(ag.id); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        <Download className="w-3 h-3" /> PDF
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/agreements/${ag.id}`); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#A989C8] text-white rounded-lg text-xs font-bold hover:bg-[#9678b5]"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
