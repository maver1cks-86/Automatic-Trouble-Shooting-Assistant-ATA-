import Header from "@/components/Header";
import ScrollGradient from "@/components/ScrollGradient";
import Hero from "@/components/Hero";
import LogoCarousel from "@/components/LogoCarousel";
import Features from "@/components/Features";
import Benefits from "@/components/Benefits";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <ScrollGradient />
      <Header />
      <Hero />
      <LogoCarousel />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
