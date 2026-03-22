import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border rounded-xl p-5">
      <h3 className="font-semibold mb-4">Quick Actions</h3>

      <div className="space-y-3">
        {/* ✅ Navigate to Add Property */}
        <button
          onClick={() => navigate("/add-property")}
          className="w-full bg-primary text-white py-2 rounded-lg"
        >
          Add Property
        </button>

        <button className="w-full border py-2 rounded-lg text-sm">
          View Tenants
        </button>

        {/* ✅ Navigate to KYC page */}
        <button
          onClick={() => navigate("/kyc")}
          className="w-full border py-2 rounded-lg text-sm"
        >
          Complete KYC
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
