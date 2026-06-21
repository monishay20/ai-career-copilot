"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MonitoringChartsProps {
  modelUsage: Record<string, number>;
  actionBreakdown: Record<string, number>;
  modelColors: Record<string, string>;
}

export default function MonitoringCharts({
  modelUsage,
  actionBreakdown,
  modelColors,
}: MonitoringChartsProps) {
  const total = Object.values(modelUsage).reduce((a, b) => a + b, 0);
  const barData = Object.entries(actionBreakdown).map(([action, count]) => ({
        name: action.charAt(0).toUpperCase() + action.slice(1),
        count,
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Model usage */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-bold text-slate-800 mb-4">Model Usage Breakdown</h2>
        {Object.keys(modelUsage).length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(modelUsage).map(([model, count]) => {
              const pct = Math.round((count / total) * 100);
              const color = modelColors[model] ?? "#2563eb";
              return (
                <div key={model}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700 font-mono">
                      {model}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Total requests:{" "}
            <span className="font-bold text-slate-800">{total}</span>
          </p>
        </div>
      </div>

      {/* Action breakdown bar chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-bold text-slate-800 mb-1">Action Breakdown</h2>
        <p className="text-xs text-slate-500 mb-3">
          Request distribution by AI action type
        </p>
        {barData.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={barData}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={60} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}