import { Card } from "@/components/ui/card";
import { Brain, Zap, Shield, BarChart3, GitBranch, Lock } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Intelligence",
    description: "Advanced machine learning algorithms that adapt and improve with every interaction.",
    gradient: "from-primary to-secondary"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Process thousands of operations per second with unmatched efficiency.",
    gradient: "from-secondary to-accent"
  },
  {
    icon: Shield,
    title: "Security",
    description: "Actively Detect Threats.",
    gradient: "from-accent to-primary"
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Comprehensive insights and metrics delivered in real-time dashboards.",
    gradient: "from-primary to-accent"
  },
  {
    icon: GitBranch,
    title: "Seamless Operations",
    description: "Intuitively access information about your system.",
    gradient: "from-secondary to-primary"
  },
  {
    icon: Lock,
    title: "Easy Setup",
    description: "Effortlessly setup this state of the art support system.",
    gradient: "from-accent to-secondary"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 px-4 relative">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to automate and optimize your operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 bg-card border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-glow-primary group cursor-pointer animate-fade-in backdrop-blur-sm"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
