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

const Agent = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "agent",
      content: "Hello! How can I help you today?",
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

  const generateId = () => new Date().getTime() + Math.floor(Math.random() * 1000);

  const userMessage: Message = {
    id: generateId(),
    role: "user",
    content: input,
    timestamp: new Date(),
  };

  setMessages([...messages, userMessage]);
  const messageToSend = input;
  setInput("");
  setIsTyping(true);

  try {
    const response = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: messageToSend }),
    });

    const data = await response.json();

    const agentMessage: Message = {
      id: generateId(),
      role: "agent",
      content: data.reply || "No response from agent.",
      timestamp: new Date(),
    };
    console.log(data);

    setMessages((prev) => [...prev, agentMessage]);

    const anomalyMatch = data.reply?.match(/\*\*Anomalies Found\*\*:\s*(\d+)/);
    const anomalyCount = anomalyMatch ? Number(anomalyMatch[1]) : 0;
    localStorage.setItem("anomalyCount", anomalyCount.toString());
    console.log("Updated anomaly count:", anomalyCount);

    if (typeof data.count === "number") {
      localStorage.setItem("jiraIssueCount", data.count.toString());
      console.log("Saved Jira issue count to localStorage:", data.count);
    }

    if (agentMessage.content.toLowerCase().includes("summary")) {
      const reportList = JSON.parse(localStorage.getItem("summaryReports") || "[]");
      reportList.push({
        id: reportList.length + 1,
        summary: agentMessage.content,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("summaryReports", JSON.stringify(reportList));
      console.log("Saved summary report to localStorage:", agentMessage.content);
    }
  } catch (err) {
    console.error(err);
    const errorMessage: Message = {
      id: generateId(),
      role: "agent",
      content: "⚠️ Failed to connect to the agent.",
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
                            : "bg-secondary/5 ring-secondary/10 text-secondary"
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
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="px-4 py-6">
                  <div className="max-w-3xl mx-auto flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-secondary/5 ring-1 ring-secondary/10 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-secondary" />
                    </div>
                    <div className="flex gap-1.5 pt-3">
                      <span className="w-1.5 h-1.5 bg-secondary/30 rounded-full animate-pulse"></span>
                      <span className="w-1.5 h-1.5 bg-secondary/30 rounded-full animate-pulse [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-secondary/30 rounded-full animate-pulse [animation-delay:0.4s]"></span>
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
                    placeholder="Send a message..."
                    className="w-full min-h-[56px] max-h-[150px] px-5 py-4 bg-muted/20 hover:bg-muted/30 border-0 rounded-xl resize-none focus:ring-1 focus:ring-primary/20 text-[15px] placeholder:text-muted-foreground/40 transition-colors"
                  />
                </div>
                <div className="flex flex-col justify-center gap-2 h-[56px]">
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="h-[31px] w-[44px] bg-primary/90 hover:bg-primary text-primary-foreground transition-all hover:shadow-sm disabled:opacity-50 disabled:hover:shadow-none rounded-md"
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

export default Agent;
