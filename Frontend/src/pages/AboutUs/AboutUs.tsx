import Navbar from '../../components/Navbar/PublicNavbar'; 
import AboutHero from '../../components/About/AboutHero';
import OurStory from '../../components/About/OurStory';
import StatsStrip from '../../components/About/StatsStrip';
import WhyChooseUs from '../../components/About/WhyChooseUs';
import SolutionsGrid from '../../components/About/SolutionsGrid';
import MissionVision from '../../components/About/MissionVision';
import Footer from '../../components/Footer';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      
      <main>
        <AboutHero />
        <OurStory />
        <StatsStrip />
        <WhyChooseUs />
        <SolutionsGrid />
        <MissionVision />
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;