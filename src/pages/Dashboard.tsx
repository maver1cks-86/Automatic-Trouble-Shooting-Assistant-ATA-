import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Activity, TrendingUp, DollarSign } from "lucide-react";
import Header from "@/components/Header";
import ScrollGradient from "@/components/ScrollGradient";
import ReactMarkdown from "react-markdown";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SummaryReport {
  id: number;
  summary: string;
  timestamp: string;
  totalAnomalies?: number;
  ticketsRaised?: number;
  totalLogs?: number;
}

const Dashboard = () => {
  const [reports, setReports] = useState<SummaryReport[]>([]);
  const [metrics, setMetrics] = useState({ totalAnomalies: 0, totalLogs: 0, ticketsRaised: 0 });
  const [openReport, setOpenReport] = useState<number | null>(null);

  useEffect(() => {
    // Load summary reports & metrics
    const storedReports: SummaryReport[] = JSON.parse(localStorage.getItem("summaryReports") || "[]");
    setReports(storedReports);

    const anomalies = Number(localStorage.getItem("anomalyCount") || 0);
    const uniqueLogs: string[] = JSON.parse(localStorage.getItem("logs") || "[]");
    let tickets = Number(localStorage.getItem("jiraIssueCount") || 0);
    tickets = tickets !== 0 ? tickets - 1 : tickets;

    setMetrics({
      totalAnomalies: anomalies,
      totalLogs: uniqueLogs.length,
      ticketsRaised: tickets,
    });
  }, []);

  const stats = [
    { label: "Total Anomalies", value: metrics.totalAnomalies, icon: Activity },
    { label: "Total Log Readings", value: metrics.totalLogs, icon: TrendingUp },
    { label: "Tickets Raised", value: metrics.ticketsRaised, icon: DollarSign },
  ];

  // Sample chart data
  const chartData = [
    { name: "10/19 00:00", anomalies: 6 },
    { name: "10/19 01:00", anomalies: 4 },
    { name: "10/19 02:00", anomalies: 7 },
    { name: "10/19 03:00", anomalies: 5 },
    { name: "10/19 04:00", anomalies: 3 },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <ScrollGradient />
      <Header />

      <main className="container mx-auto px-4 pt-32 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mb-8">Monitor your system performance and metrics</p>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label} className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-glow-primary transition-all">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>

          {/* Sample Recent Logs Chart */}
          <Card className="p-6 mb-8 bg-card/50 backdrop-blur-sm border-border/50">
            <h3 className="text-xl font-semibold mb-4">Recent System Logs (Last 10)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="anomalies" stroke="#FF4D4F" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Summary Reports */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <h3 className="text-xl font-semibold mb-4">Summary Reports</h3>
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer"
                  onClick={() => setOpenReport(openReport === report.id ? null : report.id)}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Summary Report {report.id}</p>
                    <span className="text-sm text-muted-foreground">
                      {new Date(report.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {openReport === report.id && (
                    <div className="mt-2 prose max-w-full">
                      <ReactMarkdown>{report.summary}</ReactMarkdown>
                      <div className="text-sm text-muted-foreground mt-2">
                        Anomalies: {report.totalAnomalies || 0} | Tickets Raised: {report.ticketsRaised || 0} | Logs: {report.totalLogs || 0}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {reports.length === 0 && <p className="text-muted-foreground">No summary reports generated yet.</p>}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
