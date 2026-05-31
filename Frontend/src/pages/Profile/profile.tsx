import { useState } from "react";
import ProfileNavbar from "../../components/Navbar/ProfileNavbar";
import Footer from "../../components/Footer";

import Sidebar from "../../components/Profile/Sidebar";
import PersonalInformation from "../../components/Profile/PersonalInformation";
import LoginSecurity from "../../components/Profile/LoginSecurity";
import LanguageCurrency from "../../components/Profile/LanguageCurrency";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("personal");

  const renderContent = () => {
    switch (activeTab) {
      case "personal":
        return <PersonalInformation />;
      case "security":
        return <LoginSecurity />;
      case "preferences":
        return <LanguageCurrency />;
      default:
        return <PersonalInformation />;
    }
  };

  return (
    <>
      <ProfileNavbar />

      <div className="min-h-screen bg-[#FDFBFD] font-sans pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Profile</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
            <div className="md:col-span-1">
              <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            <div className="md:col-span-3">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Profile;
