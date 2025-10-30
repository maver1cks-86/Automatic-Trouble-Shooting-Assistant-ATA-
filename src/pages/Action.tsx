import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User } from "lucide-react";
import Header from "@/components/Header";
import ReactMarkdown from "react-markdown";

interface Message {
  id: number;
  role: "user" | "agent";
  content: string;
  timestamp: Date;
}

// Collapsible component for thinking_trace
const CollapsibleThinking = ({ attempts }: { attempts: any[] }) => {
  const [open, setOpen] = useState(true);

  if (!attempts || attempts.length === 0) return null;

  return (
    <Card className="my-2 p-4 border border-border/10">
      <div
        className="cursor-pointer font-medium flex justify-between items-center"
        onClick={() => setOpen(!open)}
      >
        <span>💭 Thinking / Failed Attempts ({attempts.length})</span>
        <span>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div className="mt-2 space-y-2 max-h-96 overflow-y-auto">
          {attempts.map((attempt, index) => (
            <Card
              key={index}
              className="p-2 border border-border/5 bg-muted/10 text-sm font-mono"
            >
              <div>Attempt {attempt.attempt}:</div>
              <div>
                <strong>Code:</strong>
                <pre>{attempt.code}</pre>
              </div>
              <div>
                <strong>Error:</strong>
                <pre>{attempt.error}</pre>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
};

const Action = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "agent",
      content:
        "👋 Hello! I’m your Action Agent. Ask me to write, debug, or execute System task — I can handle it dynamically!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:5000/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input, state: {} }),
      });

      const data = await response.json();
      console.log("Response:", data);

      // 🧠 Show thinking_trace as a single collapsible message
      if (data.thinking_trace && Array.isArray(data.thinking_trace)) {
        const thinkingMessage: Message = {
          id: messages.length + 2,
          role: "agent",
          content: JSON.stringify(data.thinking_trace),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, thinkingMessage]);
      }

      // 🤖 Finally show the successful output
      let finalOutput = "⚠️ No valid output received from the Python Expert Agent.";

      if (Array.isArray(data.output) && data.output.length > 0) {
        finalOutput = data.output
          .map((item: any, index: number) => {
            return `### 🧾 Log ${index + 1}\n\`\`\`json\n${JSON.stringify(item, null, 2)}\n\`\`\``;
          })
          .join("\n\n---\n\n");
      } else if (data.output && typeof data.output === "object") {
        finalOutput = `\`\`\`json\n${JSON.stringify(data.output, null, 2)}\n\`\`\``;
      } else if (data.output) {
        finalOutput = data.output.toString();
      } else if (data.error) {
        finalOutput = `⚠️ ${data.error}`;
      }

      const agentMessage: Message = {
        id: messages.length + 3,
        role: "agent",
        content: `✅ Final Output:\n${finalOutput}`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        id: messages.length + 2,
        role: "agent",
        content: "⚠️ Failed to connect to the Python Expert Agent backend.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Header />
      <main className="flex-1 flex flex-col relative mt-16 md:mt-20">
        <div className="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-track-muted/20 scrollbar-thumb-border/40 hover:scrollbar-thumb-border/60 pb-36">
          <div className="w-full min-h-full flex flex-col justify-end">
            <div className="w-full space-y-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`group px-8 py-6 transition-colors w-full ${
                    message.role === "agent" ? "hover:bg-muted/[0.02]" : ""
                  }`}
                >
                  <div className="w-[80%] mx-auto flex items-start gap-6">
                    <div
                      className={`flex-none ${
                        message.role === "user" ? "order-last" : "order-first"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-lg ring-1 ${
                          message.role === "user"
                            ? "bg-primary/5 ring-primary/10 text-primary"
                            : "bg-accent/5 ring-accent/10 text-accent"
                        } flex items-center justify-center`}
                      >
                        {message.role === "user" ? (
                          <User className="w-6 h-6" />
                        ) : (
                          <Bot className="w-6 h-6" />
                        )}
                      </div>
                    </div>
                    <div
                      className={`flex-1 ${
                        message.role === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      <div className="prose max-w-full">
                        {/* Render collapsible thinking_trace if content is JSON array */}
                        {typeof message.content === "string" &&
                        message.content.startsWith("[") ? (
                          <CollapsibleThinking attempts={JSON.parse(message.content)} />
                        ) : (
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="px-4 py-6">
                  <div className="max-w-3xl mx-auto flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-accent/5 ring-1 ring-accent/10 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex gap-1.5 pt-3">
                      <span className="w-1.5 h-1.5 bg-accent/30 rounded-full animate-pulse"></span>
                      <span className="w-1.5 h-1.5 bg-accent/30 rounded-full animate-pulse [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-accent/30 rounded-full animate-pulse [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-10">
          <div className="bg-gradient-to-t from-background via-background to-transparent h-24 pointer-events-none" />
          <div className="bg-background/70 backdrop-blur-xl border-t border-border/5">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Ask the Python Expert Agent anything..."
                    className="w-full min-h-[56px] max-h-[150px] px-5 py-4 bg-muted/20 hover:bg-muted/30 border-0 rounded-xl resize-none focus:ring-1 focus:ring-primary/20 text-[15px] placeholder:text-muted-foreground/40 transition-colors"
                  />
                </div>
                <div className="flex flex-col justify-center gap-2 h-[56px]">
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="h-[31px] w-[44px] bg-accent/90 hover:bg-accent text-accent-foreground transition-all hover:shadow-sm disabled:opacity-50 disabled:hover:shadow-none rounded-md"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Action;
