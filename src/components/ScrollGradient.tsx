import { useEffect, useState } from "react";

const ScrollGradient = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (position / maxScroll) * 100;
      setScrollPosition(scrollPercentage);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs that react to scroll */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full blur-[150px] transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(circle, hsl(217 91% 60% / 0.15), transparent)`,
          top: `${-20 + scrollPosition * 0.5}%`,
          left: `${10 + scrollPosition * 0.3}%`,
        }}
      />
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px] transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(circle, hsl(260 70% 60% / 0.12), transparent)`,
          top: `${30 - scrollPosition * 0.3}%`,
          right: `${5 + scrollPosition * 0.2}%`,
        }}
      />
      <div
        className="absolute w-[700px] h-[700px] rounded-full blur-[140px] transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(circle, hsl(280 80% 65% / 0.1), transparent)`,
          bottom: `${-10 + scrollPosition * 0.4}%`,
          left: `${40 - scrollPosition * 0.25}%`,
        }}
      />
      
      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  );
};

export default ScrollGradient;
