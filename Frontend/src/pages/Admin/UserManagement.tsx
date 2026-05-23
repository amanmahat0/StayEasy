import { useState, useEffect } from "react";
import { Header } from "../../components/admin/Header";
import { Users, Building2, Loader2 } from "lucide-react";
import API from "../../services/api";

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  role: string;
  email_verified: boolean;
  date_joined: string;
  bookings_count?: number;
  properties_count?: number;
  total_bookings?: number;
}

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState<"users" | "landlords">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [landlords, setLandlords] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch Users (Tenants)
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await API.get("admin/users/");
      setUsers(response.data.results || []);
    } catch (err: any) {
      let errorMessage = "Failed to fetch users";
      
      if (err.response?.status === 401) {
        errorMessage = "Unauthorized: Invalid or expired token. Please login again.";
      } else if (err.response?.status === 403) {
        errorMessage = "Forbidden: Admin access required.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Landlords
  const fetchLandlords = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await API.get("admin/landlords/");
      setLandlords(response.data.results || []);
    } catch (err: any) {
      let errorMessage = "Failed to fetch landlords";
      
      if (err.response?.status === 401) {
        errorMessage = "Unauthorized: Invalid or expired token. Please login again.";
      } else if (err.response?.status === 403) {
        errorMessage = "Forbidden: Admin access required.";
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error("Error fetching landlords:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and tab change
  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else {
      fetchLandlords();
    }
  }, [activeTab]);

  const data = activeTab === "users" ? users : landlords;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage all users and landlords in the system
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0 mb-6 bg-white rounded-lg overflow-hidden border border-gray-200">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 py-3 px-4 font-medium flex items-center justify-center gap-2 transition ${
              activeTab === "users"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Users size={20} />
            Users (Tenants) - {users.length}
          </button>
          <button
            onClick={() => setActiveTab("landlords")}
            className={`flex-1 py-3 px-4 font-medium flex items-center justify-center gap-2 transition ${
              activeTab === "landlords"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Building2 size={20} />
            Landlords - {landlords.length}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="inline-block animate-spin h-12 w-12 text-blue-600 mb-4" />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        )}

        {/* Table */}
        {!loading && data.length > 0 && (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    {activeTab === "users" ? "Bookings" : "Properties"}
                  </th>
                  {activeTab === "landlords" && (
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Total Bookings
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {item.first_name} {item.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {item.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      @{item.username}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          item.email_verified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.email_verified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {activeTab === "users"
                        ? item.bookings_count || 0
                        : item.properties_count || 0}
                    </td>
                    {activeTab === "landlords" && (
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {item.total_bookings || 0}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(item.date_joined).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!loading && data.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-gray-400 mb-2 flex justify-center">
              {activeTab === "users" ? <Users size={48} /> : <Building2 size={48} />}
            </div>
            <p className="text-gray-600">
              No {activeTab === "users" ? "users" : "landlords"} found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;