import AuthNavbar from "../../components/Navbar/AuthNavbar";
import Hero from "../../components/Hero";
import Categories from "../../components/Categories";
import Features from "../../components/Features";
import Locations from "../../components/Locations";
import CTA from "../../components/CTA";
import Footer from "../../components/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthNavbar />

      <main>
        <Hero />
        <Categories />
        <Features />
        <Locations />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
