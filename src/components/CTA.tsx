import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20" />
      <div className="absolute inset-0 backdrop-blur-3xl" />
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Ready to Transform
            <br />
            Your Operations?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
            Start automating today and redefine actionable intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '400ms' }}>
            <Button size="lg" className="bg-gradient-primary text-primary-foreground hover:shadow-glow-primary transition-all duration-300 group">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="border-primary/20 hover:bg-primary/10">
              Schedule Demo
            </Button>
          </div>

          {/* Trust Badges */}
        </div>
      </div>
    </section>
  );
};

export default CTA;
