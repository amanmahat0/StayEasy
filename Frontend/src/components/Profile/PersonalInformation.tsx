import { useState, useEffect, useRef, type FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  User, Mail, Phone, Calendar, MapPin, ShieldCheck, ShieldAlert,
  PenSquare, CheckCircle, XCircle, Loader, AlertTriangle,
  Camera, Clock, Building2, FileText, ExternalLink, Home,
  Heart, X
} from "lucide-react";
import { getProfile, updateProfile, getKYCDetail, submitKYC } from "../../services/api";
import { useNavigate } from "react-router-dom";

const PersonalInformation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userType = user?.user_type || "tenant";
  const isOwner = userType === "owner";

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    address: "",
    emergency_contact: "",
  });

  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [pictureFile, setPictureFile] = useState<File | null>(null);

  const [kyc, setKyc] = useState<any>(null);
  const [kycLoading, setKycLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const profile = await getProfile();
        setForm({
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          date_of_birth: profile.date_of_birth
            ? profile.date_of_birth.split("T")[0]
            : "",
          address: profile.address || "",
          emergency_contact: profile.emergency_contact || "",
        });
        setProfilePicture(profile.profile_picture
          ? `http://127.0.0.1:8000${profile.profile_picture}`
          : null
        );

        if (isOwner) {
          setKycLoading(true);
          const kycData = await getKYCDetail();
          setKyc(kycData);
          setKycLoading(false);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isOwner]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPictureFile(file);
      setProfilePicture(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("first_name", form.first_name);
      formData.append("last_name", form.last_name);
      formData.append("phone", form.phone);
      formData.append("date_of_birth", form.date_of_birth);
      formData.append("address", form.address);
      formData.append("emergency_contact", form.emergency_contact);
      if (pictureFile) {
        formData.append("profile_picture", pictureFile);
      }
      await updateProfile(formData);
      setSuccess("Profile updated successfully!");
      setPictureFile(null);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (f: string, l: string) =>
    `${(f || "")[0] || ""}${(l || "")[0] || ""}`.toUpperCase() || "?";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader size={32} className="animate-spin text-[#A989C8]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#A989C8]/20 flex items-center justify-center">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-[#A989C8]" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#A989C8] rounded-full flex items-center justify-center text-white shadow-md hover:bg-[#8d6aa9] transition-colors"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePictureChange}
            />
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {form.first_name || form.last_name
                    ? `${form.first_name} ${form.last_name}`
                    : "Your Name"}
                </h2>
                <p className="text-gray-500 text-sm flex items-center gap-1.5 mt-0.5">
                  <Mail size={13} />
                  {form.email || "—"}
                  <span className="text-gray-300 mx-1">·</span>
                  {isOwner ? "Landlord" : "Tenant"} Account
                </p>
              </div>
              <button
                onClick={() => isEditing ? document.getElementById("profile-form")?.requestSubmit() : setIsEditing(true)}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#A989C8] text-white rounded-xl text-sm font-bold hover:bg-[#8d6aa9] transition-colors shadow-md shadow-[#A989C8]/20 disabled:opacity-50 w-full sm:w-auto justify-center"
              >
                {saving ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <PenSquare size={16} />
                )}
                {isEditing ? "Save" : "Edit"}
              </button>
            </div>
            {isEditing && (
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setPictureFile(null); }}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      {/* Personal Information Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <div className="mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Personal Information</h3>
          <p className="text-gray-500 text-sm mt-1">Update your personal details and contact information</p>
        </div>

        <form id="profile-form" onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="First Name" icon={User}>
              {isEditing ? (
                <input type="text" value={form.first_name} onChange={(e) => handleChange("first_name", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#A989C8]/30 focus:border-[#A989C8] outline-none" />
              ) : (
                <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-800">
                  {form.first_name || "—"}
                </p>
              )}
            </Field>
            <Field label="Last Name" icon={User}>
              {isEditing ? (
                <input type="text" value={form.last_name} onChange={(e) => handleChange("last_name", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#A989C8]/30 focus:border-[#A989C8] outline-none" />
              ) : (
                <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-800">
                  {form.last_name || "—"}
                </p>
              )}
            </Field>
            <Field label="Email" icon={Mail}>
              <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-500">
                {form.email || "—"}
              </p>
            </Field>
            <Field label="Phone Number" icon={Phone}>
              {isEditing ? (
                <input type="tel" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#A989C8]/30 focus:border-[#A989C8] outline-none" />
              ) : (
                <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-800">
                  {form.phone || "—"}
                </p>
              )}
            </Field>
            {!isOwner && (
              <Field label="Date of Birth" icon={Calendar}>
                {isEditing ? (
                  <input type="date" value={form.date_of_birth} onChange={(e) => handleChange("date_of_birth", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#A989C8]/30 focus:border-[#A989C8] outline-none" />
                ) : (
                  <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-800">
                    {form.date_of_birth ? new Date(form.date_of_birth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                  </p>
                )}
              </Field>
            )}
            <Field label="Address" icon={MapPin} fullWidth={!isOwner}>
              {isEditing ? (
                <textarea value={form.address} onChange={(e) => handleChange("address", e.target.value)} rows={2}
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#A989C8]/30 focus:border-[#A989C8] outline-none resize-none" />
              ) : (
                <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-800">
                  {form.address || "—"}
                </p>
              )}
            </Field>
            {!isOwner && (
              <Field label="Emergency Contact" icon={Heart}>
                {isEditing ? (
                  <input type="text" value={form.emergency_contact} onChange={(e) => handleChange("emergency_contact", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#A989C8]/30 focus:border-[#A989C8] outline-none" />
                ) : (
                  <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-800">
                    {form.emergency_contact || "—"}
                  </p>
                )}
              </Field>
            )}
          </div>
        </form>
      </div>

      {/* Landlord: KYC Verification Section */}
      {isOwner && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#A989C8]/10 rounded-lg text-[#A989C8]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Identity Verification (KYC)</h3>
              <p className="text-gray-500 text-sm">Your submitted KYC information</p>
            </div>
          </div>

          {kycLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader size={24} className="animate-spin text-[#A989C8]" />
            </div>
          ) : !kyc || kyc.status === "not_submitted" ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <ShieldAlert size={48} className="mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-bold text-gray-700 mb-2">KYC Not Submitted</h4>
              <p className="text-sm text-gray-400 mb-6">Verify your identity to unlock property listing features</p>
              <button
                onClick={() => navigate("/kyc")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#A989C8] text-white rounded-xl font-bold text-sm hover:bg-[#8d6aa9] transition-colors shadow-md shadow-[#A989C8]/20 w-full sm:w-auto justify-center"
              >
                <ShieldCheck size={16} />
                Submit KYC
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${
                kyc.status === "approved" ? "bg-green-50 text-green-700 border-green-200"
                  : kyc.status === "pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}>
                {kyc.status === "approved" ? <CheckCircle size={16} />
                  : kyc.status === "pending" ? <Clock size={16} />
                  : <XCircle size={16} />}
                {kyc.status === "approved" ? "KYC Approved"
                  : kyc.status === "pending" ? "KYC Pending Review"
                  : "KYC Rejected"}
              </div>

              {/* KYC Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Full Name (KYC)" icon={User}>
                  <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-800">
                    {kyc.full_name || "—"}
                  </p>
                </Field>
                <Field label="Phone Number" icon={Phone}>
                  <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-800">
                    {kyc.phone_number || "—"}
                  </p>
                </Field>
                <Field label="Citizenship / ID Number" icon={FileText}>
                  <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-800">
                    {kyc.citizenship_number || "—"}
                  </p>
                </Field>
                <Field label="Submission Date" icon={Clock}>
                  <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-800">
                    {kyc.submitted_at
                      ? new Date(kyc.submitted_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                      : "—"}
                  </p>
                </Field>
                {kyc.verified_by && (
                  <Field label="Verified By" icon={ShieldCheck}>
                    <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-800">
                      {kyc.verified_by.name}
                    </p>
                  </Field>
                )}
                {kyc.verified_at && (
                  <Field label="Verified At" icon={Clock}>
                    <p className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-800">
                      {new Date(kyc.verified_at).toLocaleString()}
                    </p>
                  </Field>
                )}
              </div>

              {/* KYC Document */}
              {kyc.document_image && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FileText size={16} className="text-[#A989C8]" />
                    Uploaded Document
                  </h4>
                  <a
                    href={`http://127.0.0.1:8000${kyc.document_image}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 hover:border-[#A989C8] transition-colors group max-w-md"
                  >
                    <img
                      src={`http://127.0.0.1:8000${kyc.document_image}`}
                      alt="KYC Document"
                      className="w-full h-52 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        const parent = (e.target as HTMLImageElement).parentElement!;
                        parent.classList.add("flex", "items-center", "justify-center", "h-32");
                        const fallback = document.createElement("div");
                        fallback.className = "text-center";
                        fallback.innerHTML = `<span class="text-gray-400 text-sm">Document preview unavailable</span>`;
                        parent.appendChild(fallback);
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
                      <ExternalLink size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </a>
                </div>
              )}

              {/* Rejected: show resubmit button */}
              {kyc.status === "rejected" && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-sm text-red-600 font-medium mb-3">
                    Your KYC was rejected. Please resubmit with correct documents.
                  </p>
                  <button
                    onClick={() => navigate("/kyc")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#A989C8] text-white rounded-xl font-bold text-sm hover:bg-[#8d6aa9] transition-colors w-full sm:w-auto justify-center"
                  >
                    Resubmit KYC
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* --- Sub-Components --- */

const Field = ({
  label, icon: Icon, children, fullWidth,
}: {
  label: string; icon: any; children: React.ReactNode; fullWidth?: boolean;
}) => (
  <div className={fullWidth ? "sm:col-span-2" : ""}>
    <label className="text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
      <Icon size={14} className="text-[#A989C8]" />
      {label}
    </label>
    {children}
  </div>
);

export default PersonalInformation;
