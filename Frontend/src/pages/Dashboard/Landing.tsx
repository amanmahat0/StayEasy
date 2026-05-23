// src/pages/Landing/Landing.tsx

import { useNavigate } from "react-router-dom";
import type { MouseEvent } from "react";

import Navbar from "../../components/Navbar/AuthNavbar";
import Hero from "../../components/Hero";
import Categories from "../../components/Categories";
import Features from "../../components/Features";
import Locations from "../../components/Locations";
import CTA from "../../components/CTA";
import Footer from "../../components/Footer";

export default function Landing() {
  const navigate = useNavigate();

  const handleRedirectToLogin = (
    e: MouseEvent<HTMLDivElement>
  ) => {
    const target = e.target as HTMLElement;

    // Allow footer links, navbar links & buttons
    if (
      target.closest("a") ||
      target.closest("button") ||
      target.closest(".footer-link")
    ) {
      return;
    }

    navigate("/login");
  };

  return (
    <div
      className="
        min-h-screen
        w-full
        overflow-x-hidden
        bg-white
        flex
        flex-col
      "
      onClick={handleRedirectToLogin}
    >
      {/* ================= NAVBAR ================= */}
      <header className="w-full">
        <Navbar />
      </header>

      {/* ================= MAIN ================= */}
      <main className="flex flex-col w-full">
        
        {/* ================= HERO FULL WIDTH ================= */}
        <Hero />

        {/* ================= CATEGORIES ================= */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-14">
          <div className="max-w-7xl mx-auto">
            <Categories />
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-14 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <Features />
          </div>
        </section>

        {/* ================= LOCATIONS ================= */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-14">
          <div className="max-w-7xl mx-auto">
            <Locations />
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="w-full px-4 sm:px-6 lg:px-8 py-14">
          <div className="max-w-7xl mx-auto">
            <CTA />
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="w-full mt-auto">
        <Footer />
      </footer>
    </div>
  );
}