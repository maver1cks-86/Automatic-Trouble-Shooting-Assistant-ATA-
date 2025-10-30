const logos = [
  { name: "LangGraph", text: "LANGGRAPH" },
  { name: "Windows", text: "WINDOWS" },
  { name: "Azure", text: "GROQ" },
  { name: "OpenAI", text: "OPENAI" },
  { name: "Docker", text: "DOCKER" },
  { name: "Kubernetes", text: "RPA" },
  { name: "AWS", text: "AWS" },
  { name: "Google Cloud", text: "GOOGLE CLOUD" },
  { name: "MongoDB", text: "MONGODB" },
  { name: "PostgreSQL", text: "POSTGRESQL" },
];

const LogoCarousel = () => {
  return (
    <section className="py-12 px-4 overflow-hidden bg-card/30 backdrop-blur-sm border-y border-border/50">
      <div className="container mx-auto mb-6">
        <p className="text-center text-sm text-muted-foreground uppercase tracking-wider">
          Trusted by KLH
        </p>
      </div>
      
      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        
        {/* Scrolling Container */}
        <div className="flex animate-scroll">
          {/* First set of logos */}
          {logos.map((logo, index) => (
            <div
              key={`first-${index}`}
              className="flex-shrink-0 mx-8 flex items-center justify-center h-12 min-w-[180px]"
            >
              <span className="text-2xl font-bold text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors duration-300 tracking-tight">
                {logo.text}
              </span>
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {logos.map((logo, index) => (
            <div
              key={`second-${index}`}
              className="flex-shrink-0 mx-8 flex items-center justify-center h-12 min-w-[180px]"
            >
              <span className="text-2xl font-bold text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors duration-300 tracking-tight">
                {logo.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoCarousel;
