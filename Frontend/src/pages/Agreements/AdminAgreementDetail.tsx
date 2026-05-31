import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Download, User, Shield, Building2, Banknote, Clock } from "lucide-react";
import { getAgreementDetail, downloadAgreementPDF } from "../../services/api";
import { Header } from "../../components/admin/Header";

export default function AdminAgreementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getAgreementDetail(Number(id))
      .then(setAgreement)
      .catch(() => navigate("/admin"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A989C8]" />
      </div>
    );
  }

  if (!agreement) return null;

  return (
    <>
      <Header />
      <div className="p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/admin")} className="p-1.5 hover:bg-gray-200 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Agreement AGR-{String(agreement.id).padStart(6, "0")}</h1>
          <p className="text-sm text-gray-500">{agreement.property_name}</p>
        </div>
        <button
          onClick={() => downloadAgreementPDF(agreement.id)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-[#A989C8] text-white rounded-lg text-xs font-bold hover:bg-[#9678b5]"
        >
          <Download className="w-3 h-3" /> PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-[#A989C8]" /> Property
          </h3>
          <p className="font-semibold text-gray-900">{agreement.property_name}</p>
          <p className="text-sm text-gray-500">{agreement.property_address}</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div><span className="text-xs text-gray-400">Type:</span> <span className="text-xs font-medium">{agreement.property_type}</span></div>
            <div><span className="text-xs text-gray-400">Rent:</span> <span className="text-xs font-medium">NPR {agreement.monthly_rent}</span></div>
            <div><span className="text-xs text-gray-400">Deposit:</span> <span className="text-xs font-medium">NPR {agreement.security_deposit}</span></div>
            <div><span className="text-xs text-gray-400">Lease:</span> <span className="text-xs font-medium">{agreement.lease_duration_months} mo</span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-3">
            <Banknote className="w-4 h-4 text-[#A989C8]" /> Payment
          </h3>
          <div className="space-y-1.5">
            <div className="flex justify-between"><span className="text-xs text-gray-400">Transaction:</span><span className="text-xs font-mono font-medium">{agreement.transaction_id || "N/A"}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-400">Amount:</span><span className="text-xs font-bold">NPR {agreement.amount_paid}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-400">Date:</span><span className="text-xs">{agreement.payment_date ? new Date(agreement.payment_date).toLocaleDateString() : "N/A"}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-[#A989C8]" /> Tenant
          </h3>
          <p className="font-semibold text-gray-900">{agreement.tenant_name}</p>
          <p className="text-sm text-gray-500">{agreement.tenant_email}</p>
          {agreement.tenant_phone && <p className="text-sm text-gray-500">{agreement.tenant_phone}</p>}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-400">Signed:</span>
            {agreement.tenant_signed_at ? (
              <span className="text-xs text-green-600 font-medium">{new Date(agreement.tenant_signed_at).toLocaleString()}</span>
            ) : (
              <span className="text-xs text-gray-400">Not yet</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-[#A989C8]" /> Landlord
          </h3>
          <p className="font-semibold text-gray-900">{agreement.landlord_name}</p>
          <p className="text-sm text-gray-500">{agreement.landlord_email}</p>
          {agreement.landlord_phone && <p className="text-sm text-gray-500">{agreement.landlord_phone}</p>}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-400">Signed:</span>
            {agreement.landlord_signed_at ? (
              <span className="text-xs text-green-600 font-medium">{new Date(agreement.landlord_signed_at).toLocaleString()}</span>
            ) : (
              <span className="text-xs text-gray-400">Not yet</span>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-[#A989C8]" /> Audit Trail
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Created</span>
              <span className="text-gray-700">{new Date(agreement.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Last Updated</span>
              <span className="text-gray-700">{new Date(agreement.updated_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Status</span>
              <span className="font-medium">{agreement.status}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Tenant IP</span>
              <span className="text-gray-700 font-mono">{agreement.tenant_ip_address || "N/A"}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Landlord IP</span>
              <span className="text-gray-700 font-mono">{agreement.landlord_ip_address || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-[#A989C8]" /> Agreement Content
          </h3>
          <pre className="whitespace-pre-wrap font-sans text-xs text-gray-700 leading-relaxed max-h-96 overflow-y-auto">
            {agreement.agreement_content}
          </pre>
        </div>
      </div>
    </div>
    </>
  );
}
