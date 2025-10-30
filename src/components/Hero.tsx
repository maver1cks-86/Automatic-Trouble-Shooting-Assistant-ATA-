import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
const handleScroll = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20">
      {/* Radial Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, hsl(217 91% 60% / 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, hsl(260 70% 60% / 0.12) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, hsl(280 80% 65% / 0.1) 0%, transparent 50%),
              hsl(var(--background))
            `
          }}
        />
      </div>

      {/* Animated Grid */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 mx-auto text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-card border border-primary/20 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Powered by Advanced AI</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
          Autonomous Troubleshooting
          <br />
          Assistant
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Resolve system errors instantly through a simple conversation.
          Our AI agent handles the fix and the follow-up, so you don't have to.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
<Button
      size="lg"
      className="bg-gradient-primary text-primary-foreground hover:shadow-glow-primary transition-all duration-300 group"
      onClick={handleScroll}
    >
      Join the Movement!
      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
    </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">99.9%</div>
            <div className="text-sm text-muted-foreground">Reliability</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">90%</div>
            <div className="text-sm text-muted-foreground">Increase in Efficiency</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-accent mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">AI Support</div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default Hero;
