"use client";

import GaugeComponent from "react-gauge-component";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ATSGauge({ score }: { score: number }) {
  const getLabel = (score: number) => {
    if (score >= 80) return { text: "Excellent", color: "#16a34a" };
    if (score >= 60) return { text: "Good", color: "#ca8a04" };
    if (score >= 40) return { text: "Fair", color: "#ea580c" };
    return { text: "Poor", color: "#dc2626" };
  };

  const label = getLabel(score);

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-lg">ATS Compatibility Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <GaugeComponent
          value={score}
          type="radial"
          arc={{
            colorArray: ["#dc2626", "#ea580c", "#ca8a04", "#16a34a"],
            padding: 0.02,
            subArcs: [
              { limit: 40 },
              { limit: 60 },
              { limit: 80 },
              { limit: 100 },
            ],
          }}
          pointer={{
            elastic: true,
            animationDelay: 0,
          }}
          labels={{
            valueLabel: {
              formatTextValue: (value) => `${value}`,
              style: {
                fontSize: "40px",
                fill: label.color,
                fontWeight: "bold",
              },
            },
            tickLabels: {
              type: "outer",
              ticks: [
                { value: 0 },
                { value: 25 },
                { value: 50 },
                { value: 75 },
                { value: 100 },
              ],
              defaultTickValueConfig: {
                style: { fontSize: "10px", fill: "#94a3b8" },
              },
            },
          }}
          minValue={0}
          maxValue={100}
        />

        {/* Score label */}
        <div className="text-center -mt-4">
          <span
            className="text-xl font-bold"
            style={{ color: label.color }}
          >
            {label.text}
          </span>
          <p className="text-sm text-slate-500 mt-1">
            {score >= 80
              ? "Your resume is well-optimized for ATS systems"
              : score >= 60
              ? "Your resume needs some improvements to pass ATS filters"
              : "Your resume needs significant improvements for ATS compatibility"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}