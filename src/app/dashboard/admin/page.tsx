import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CheckCircle, XCircle, Clock, Layers, AlertCircle } from "lucide-react";
import MonitoringCharts from "@/components/MonitoringCharts";

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const logs = await prisma.aILog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  
  const totalRequests = logs.length;
  const successfulRequests = logs.filter((l: any) => l.success).length;
  const failedRequests = logs.filter((l: any) => !l.success).length;
  const successRate = totalRequests > 0
    ? Math.round((successfulRequests / totalRequests) * 100)
    : 0;
  const avgResponseTime = totalRequests > 0
    ? Math.round(logs.reduce((sum, l: any) => sum + l.responseTime, 0) / totalRequests)
    : 0;

  const modelUsage = logs.reduce((acc: Record<string, number>, log: any) => {
    acc[log.model] = (acc[log.model] || 0) + 1;
    return acc;
  }, {});

  const actionBreakdown = logs.reduce((acc: Record<string, number>, log: any) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {});

  const modelColors: Record<string, string> = {
    "gemini-2.5-flash": "#9333ea",
    "gemini-2.0-flash-001": "#2563eb",
    "gemini-2.0-flash": "#16a34a",
    "gemini-2.0-flash-lite-001": "#ca8a04",
  };

  const statCards = [
    {
      label: "Total Requests",
      value: totalRequests.toString(),
      sub: "All time",
      icon: <Layers size={20} />,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Success Rate",
      value: `${successRate}%`,
      sub: "Above target",
      icon: <CheckCircle size={20} />,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Failed Requests",
      value: failedRequests.toString(),
      sub: "All time",
      icon: <AlertCircle size={20} />,
      color: "bg-red-50 text-red-600",
    },
    {
      label: "Avg Response Time",
      value: `${(avgResponseTime / 1000).toFixed(1)}s`,
      sub: "Per request",
      icon: <Clock size={20} />,
      color: "bg-yellow-50 text-yellow-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Monitoring</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Real-time overview of AI model usage and system performance
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="text-sm font-medium text-slate-700 mt-0.5">{card.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <MonitoringCharts
        modelUsage={modelUsage}
        actionBreakdown={actionBreakdown}
        modelColors={modelColors}
      />

      {/* Logs table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Recent AI Logs</h2>
          <span className="text-xs text-slate-400">{logs.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Status", "Action", "Model", "Response Time", "Timestamp"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 text-sm py-12">
                    No logs yet — analyze a resume to start tracking
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    {log.success ? (
                      <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200">
                        <CheckCircle size={10} />
                        Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-red-200">
                        <XCircle size={10} />
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-700 font-medium text-xs capitalize">
                    {log.action}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs text-slate-600 font-mono">
                      {log.model}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600 text-xs font-mono">
                    {(log.responseTime / 1000).toFixed(1)}s
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">
                    {new Date(log.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}