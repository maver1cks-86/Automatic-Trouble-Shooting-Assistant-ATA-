import { CheckCircle2 } from "lucide-react";

const benefits = [
  "Reduce operational costs by up to 50%",
  "Automate repetitive tasks and workflows",
  "Scale effortlessly with AI-powered insights",
  "24/7 monitoring and intelligent alerts",
  "Predictive maintenance and issue prevention",
  "Seamless team collaboration tools"
];

const Benefits = () => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-float" />
      
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Autonomous Operations
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of businesses that have transformed their operations 
              with our cutting-edge AI automation platform.
            </p>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <span className="text-lg text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <div className="bg-card border border-primary/20 rounded-lg p-6 backdrop-blur-sm hover:border-primary/40 transition-all">
                  <div className="text-3xl font-bold text-primary mb-2">10k+</div>
                  <div className="text-muted-foreground">Active Users</div>
                </div>
                <div className="bg-card border border-secondary/20 rounded-lg p-6 backdrop-blur-sm hover:border-secondary/40 transition-all">
                  <div className="text-3xl font-bold text-secondary mb-2">500M+</div>
                  <div className="text-muted-foreground">Tasks Automated</div>
                </div>
              </div>
              <div className="space-y-4 pt-8 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <div className="bg-card border border-accent/20 rounded-lg p-6 backdrop-blur-sm hover:border-accent/40 transition-all">
                  <div className="text-3xl font-bold text-accent mb-2">98%</div>
                  <div className="text-muted-foreground">Satisfaction</div>
                </div>
                <div className="bg-card border border-primary/20 rounded-lg p-6 backdrop-blur-sm hover:border-primary/40 transition-all">
                  <div className="text-3xl font-bold text-primary mb-2">150+</div>
                  <div className="text-muted-foreground">Countries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
