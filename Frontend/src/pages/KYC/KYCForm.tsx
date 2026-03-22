import React from "react";
import PublicNavbar from "../../components/Navbar/ProfileNavbar";
import Footer from "../../components/Footer";
import KYCContainer from "../../components/KYC/KYCContainer";

const KYCForm: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <PublicNavbar />

      {/* Main content */}
      <main className="flex-grow bg-gray-50 p-6">
        <KYCContainer />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default KYCForm;
