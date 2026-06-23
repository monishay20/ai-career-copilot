"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataPoint {
  date: string;
  atsScore: number;
  matchScore: number | null;
  fileName: string;
}

export default function ScoreHistoryChart({ data }: { data: DataPoint[] }) {
  if (data.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Score History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-sm text-center py-8">
            Analyze at least 2 resumes to see your score history chart
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Score History</CardTitle>
        <p className="text-sm text-slate-500">
          Track your ATS score improvement over time
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: any, name: any) => [
                `${value}/100`,
                name === "atsScore" ? "ATS Score" : "Job Match Score",
              ]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <ReferenceLine
              y={80}
              stroke="#22c55e"
              strokeDasharray="3 3"
              label={{ value: "Good", fill: "#22c55e", fontSize: 11 }}
            />
            <ReferenceLine
              y={60}
              stroke="#eab308"
              strokeDasharray="3 3"
              label={{ value: "Average", fill: "#eab308", fontSize: 11 }}
            />
            <Line
              type="monotone"
              dataKey="atsScore"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ fill: "#2563eb", r: 4 }}
              activeDot={{ r: 6 }}
              name="atsScore"
            />
            <Line
              type="monotone"
              dataKey="matchScore"
              stroke="#9333ea"
              strokeWidth={2}
              dot={{ fill: "#9333ea", r: 4 }}
              activeDot={{ r: 6 }}
              strokeDasharray="5 5"
              name="matchScore"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-600" />
            <span className="text-xs text-slate-500">ATS Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-purple-600 border-dashed" />
            <span className="text-xs text-slate-500">Job Match Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-green-500" />
            <span className="text-xs text-slate-500">Good (80+)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}