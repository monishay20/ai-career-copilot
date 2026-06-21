import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ResumeRewriter from "@/components/ResumeRewriter";
import { CheckCircle, XCircle, RefreshCw, Bot } from "lucide-react";

// Custom SVG Gauge
function ATSGauge({ score }: { score: number }) {
  const R = 90;
  const cx = 120;
  const cy = 115;

  const toXY = (angle: number) => ({
    x: cx + R * Math.cos(angle),
    y: cy - R * Math.sin(angle),
  });

  const sweepFrac = score / 100;
  const needleAngle = Math.PI - sweepFrac * Math.PI;
  const needleX = cx + (R - 10) * Math.cos(needleAngle);
  const needleY = cy - (R - 10) * Math.sin(needleAngle);

  const bgStart = toXY(Math.PI);
  const bgEnd = toXY(0);

  const segments = [
    { from: 0, to: 0.4, color: "#dc2626" },
    { from: 0.4, to: 0.6, color: "#f97316" },
    { from: 0.6, to: 0.8, color: "#ca8a04" },
    { from: 0.8, to: 1.0, color: "#16a34a" },
  ];

  const gaugeColor =
    score >= 80 ? "#16a34a" : score >= 60 ? "#ca8a04" : score >= 40 ? "#f97316" : "#dc2626";

  const gaugeLabel =
    score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Poor";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-sm font-bold text-slate-700 mb-1">ATS Compatibility Score</h2>
      <p className="text-xs text-slate-500 mb-3">
        How well your resume passes applicant tracking systems
      </p>
      <svg viewBox="0 0 240 140" className="w-full max-w-xs mx-auto">
        {/* Background track */}
        <path
          d={`M ${bgStart.x} ${bgStart.y} A ${R} ${R} 0 0 1 ${bgEnd.x} ${bgEnd.y}`}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="18"
          strokeLinecap="round"
        />
        {/* Colored segments */}
        {segments.map((seg) => {
          const clampedTo = Math.min(sweepFrac, seg.to);
          const clampedFrom = Math.min(sweepFrac, seg.from);
          if (clampedFrom >= clampedTo) return null;
          const sAngle = Math.PI - clampedFrom * Math.PI;
          const eAngle = Math.PI - clampedTo * Math.PI;
          const s = toXY(sAngle);
          const e = toXY(eAngle);
          const large = clampedTo - clampedFrom > 0.5 ? 1 : 0;
          return (
            <path
              key={seg.from}
              d={`M ${s.x} ${s.y} A ${R} ${R} 0 ${large} 1 ${e.x} ${e.y}`}
              fill="none"
              stroke={seg.color}
              strokeWidth="18"
              strokeLinecap="round"
            />
          );
        })}
        {/* Needle */}
        <line
          x1={cx} y1={cy} x2={needleX} y2={needleY}
          stroke="#1e293b" strokeWidth="3" strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="6" fill="#1e293b" />
        <circle cx={cx} cy={cy} r="3" fill="white" />
        {/* Score text */}
        <text x={cx} y={cy + 28} textAnchor="middle" fontSize="32" fontWeight="700" fill={gaugeColor}>
          {score}
        </text>
        <text x={cx} y={cy + 44} textAnchor="middle" fontSize="11" fill="#64748b">
          ATS Score
        </text>
        {/* Labels */}
        <text x="16" y={cy + 14} fontSize="10" fill="#64748b">0</text>
        <text x="218" y={cy + 14} fontSize="10" fill="#64748b">100</text>
      </svg>

      {/* Legend */}
      <div className="flex justify-center gap-3 mt-2">
        {[
          { label: "Poor", color: "bg-red-500" },
          { label: "Fair", color: "bg-orange-500" },
          { label: "Good", color: "bg-yellow-500" },
          { label: "Excellent", color: "bg-green-500" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${l.color}`} />
            <span className="text-xs text-slate-500">{l.label}</span>
          </div>
        ))}
      </div>

      <p className="text-center mt-3 text-sm font-semibold" style={{ color: gaugeColor }}>
        {gaugeLabel}
      </p>
    </div>
  );
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const analysis = await prisma.analysis.findUnique({
    where: { id },
    include: { resume: true },
  });

  if (!analysis) redirect("/dashboard");

  const feedback = analysis.feedback as any;
  const suggestions = analysis.suggestions as any;
  const matchedKeywords = analysis.matchedKeywords as string[] | null;
  const missingKeywords = analysis.missingKeywords as string[] | null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#16a34a";
    if (score >= 60) return "#ca8a04";
    return "#dc2626";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analysis Results</h1>
          <p className="text-slate-500 text-sm mt-0.5">{analysis.resume.fileName}</p>
        </div>
        <Link href="/dashboard/analyze">
          <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors">
            <RefreshCw size={14} />
            Analyze Another
          </button>
        </Link>
      </div>

      {/* Resume Text Preview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-bold text-slate-800 mb-1">Resume Content</h2>
        <p className="text-xs text-slate-500 mb-3">Extracted text from your resume</p>
        <ScrollArea className="h-36 w-full rounded-lg border bg-slate-50 p-4">
          <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono leading-relaxed">
            {analysis.resume.rawText}
          </pre>
        </ScrollArea>
      </div>

      {/* Top scores row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ATS Gauge */}
        <ATSGauge score={analysis.atsScore} />

        {/* Job match circular score */}
        {analysis.matchScore ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
            <h2 className="text-sm font-bold text-slate-700 mb-1">Job Match Score</h2>
            <p className="text-xs text-slate-500 mb-4">
              Compatibility with the target job description
            </p>
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="#2563eb" strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 42 * analysis.matchScore / 100} ${2 * Math.PI * 42}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-blue-600">
                    {analysis.matchScore}%
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Match</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-green-700">
                  {matchedKeywords?.length ?? 0}
                </p>
                <p className="text-xs text-green-600 font-medium">Keywords matched</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-red-600">
                  {missingKeywords?.length ?? 0}
                </p>
                <p className="text-xs text-red-500 font-medium">Keywords missing</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col items-center justify-center text-center">
            <p className="text-slate-400 text-sm mb-2">No job description provided</p>
            <p className="text-xs text-slate-400">
              Analyze again with a job description to see your match score
            </p>
          </div>
        )}
      </div>

      {/* Keyword Analysis */}
      {(matchedKeywords?.length || missingKeywords?.length) ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-3">Keyword Analysis</h2>
          <div className="mb-4">
            <p className="text-xs font-semibold text-green-700 mb-2 uppercase tracking-wide">
              Matched Keywords
            </p>
            <div className="flex flex-wrap gap-2">
              {matchedKeywords?.map((kw) => (
                <span
                  key={kw}
                  className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-200"
                >
                  <CheckCircle size={11} />
                  {kw}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-red-600 mb-2 uppercase tracking-wide">
              Missing Keywords
            </p>
            <div className="flex flex-wrap gap-2">
              {missingKeywords?.map((kw) => (
                <span
                  key={kw}
                  className="flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-red-200"
                >
                  <XCircle size={11} />
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Section Breakdown Accordion */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-bold text-slate-800 mb-3">Section Breakdown</h2>
        <div className="space-y-2">
          {Object.entries(feedback).map(([section, data]: [string, any]) => (
            <Accordion type="multiple" key={section}>
              <AccordionItem
                value={section}
                className="border rounded-xl px-4"
              >
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-semibold capitalize text-slate-800 text-sm">
                      {section}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getProgressColor(data.score)}`}
                          style={{ width: `${data.score}%` }}
                        />
                      </div>
                      <span
                        className="text-sm font-bold"
                        style={{ color: getScoreColor(data.score) }}
                      >
                        {data.score}/100
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4 space-y-3">
                  <p className="text-sm text-slate-600">{data.feedback}</p>
                  {data.suggestions?.length > 0 && (
                    <ul className="space-y-1">
                      {data.suggestions.map((s: string, i: number) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-500">
                          <span className="text-blue-500 mt-0.5">→</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      </div>

      {/* Experience Gaps */}
      {analysis.matchScore && suggestions?.experienceGaps?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-3">Experience Gap Analysis</h2>
          <div className="grid grid-cols-3 gap-3 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 px-1">
            <span>Required</span>
            <span>Your Experience</span>
            <span>Gap</span>
          </div>
          <div className="space-y-2">
            {suggestions.experienceGaps.map((gap: any, i: number) => (
              <div key={i} className="grid grid-cols-3 gap-3 bg-slate-50 rounded-xl p-3 text-sm">
                <span className="text-slate-700 font-medium">{gap.required}</span>
                <span className="text-slate-600">{gap.candidate}</span>
                <span className={`font-semibold ${gap.gap?.toLowerCase().includes("none") ? "text-green-600" : "text-red-600"}`}>
                  {gap.gap}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education Match */}
      {analysis.matchScore && suggestions?.educationMatch && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-3">Education Match</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-1">📋 Required</p>
              <p className="text-sm text-slate-700">{suggestions.educationMatch.required}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-1">🎓 Your Education</p>
              <p className="text-sm text-slate-700">{suggestions.educationMatch.candidate}</p>
            </div>
          </div>
          <div className={`p-4 rounded-xl border ${suggestions.educationMatch.match ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-center gap-2">
              {suggestions.educationMatch.match
                ? <CheckCircle size={16} className="text-green-600" />
                : <XCircle size={16} className="text-red-600" />
              }
              <p className={`text-sm font-semibold ${suggestions.educationMatch.match ? "text-green-700" : "text-red-700"}`}>
                {suggestions.educationMatch.match ? "Match" : "No Match"} — {suggestions.educationMatch.note}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grammar Issues */}
      {suggestions?.grammarIssues?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-3">Grammar & Clarity Issues</h2>
          <ul className="space-y-2">
            {suggestions.grammarIssues.map((issue: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-slate-600 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                <span className="text-yellow-500">⚠</span>
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Overall Suggestions */}
      {suggestions?.overall?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-800 mb-3">Overall Suggestions</h2>
          <ul className="space-y-2">
            {suggestions.overall.map((s: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-slate-600">
                <span className="text-blue-500">💡</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tailored Suggestions */}
      {suggestions?.tailored?.length > 0 && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
          <h2 className="text-sm font-bold text-blue-800 mb-3">
            🎯 Tailored Suggestions for This Job
          </h2>
          <ul className="space-y-2">
            {suggestions.tailored.map((s: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-blue-700">
                <span>→</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Rewriter */}
      <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-purple-900">AI Resume Rewriter</h2>
            <p className="text-xs text-purple-600">
              Let AI rewrite your weak bullet points into strong, quantified ones
            </p>
          </div>
        </div>
        <ResumeRewriter analysisId={analysis.id} />
      </div>

      {/* Back button */}
      <div className="pb-8">
        <Link href="/dashboard">
          <Button variant="outline" className="w-full">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}