import Link from "next/link";
import { getUserAnalyses, getAnalysisStats, getScoreHistory } from "@/lib/actions/analysis";
import ScoreHistoryChart from "@/components/ScoreHistoryChart";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileText,
  BarChart2,
  Briefcase,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

export default async function DashboardPage() {
  const [resumes, stats, scoreHistory] = await Promise.all([
    getUserAnalyses(),
    getAnalysisStats(),
    getScoreHistory(),
  ]);

  const getScoreBadgeStyle = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-700 ring-1 ring-green-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200";
    return "bg-red-100 text-red-700 ring-1 ring-red-200";
  };

  const getMatchBadgeStyle = (score: number) => {
    if (score >= 80) return "bg-blue-100 text-blue-700";
    if (score >= 60) return "bg-indigo-100 text-indigo-700";
    return "bg-slate-100 text-slate-600";
  };

  const statCards = [
    {
      label: "Resumes Analyzed",
      value: stats.total.toString(),
      sub: "All time",
      icon: <FileText size={20} />,
      color: "bg-blue-50 text-blue-600",
      trend: "All time",
    },
    {
      label: "Average ATS Score",
      value: stats.avgScore.toString(),
      sub: "Last 30 days",
      icon: <BarChart2 size={20} />,
      color: "bg-green-50 text-green-600",
      trend: "Improving",
    },
    {
      label: "Job Matches Run",
      value: stats.jobMatches.toString(),
      sub: "With job descriptions",
      icon: <Briefcase size={20} />,
      color: "bg-purple-50 text-purple-600",
      trend: "With JD",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Track your resume improvements over time
          </p>
        </div>
        <Link href="/dashboard/analyze">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all">
            <Upload size={15} />
            Analyze New Resume
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <TrendingUp size={10} />
                {card.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="text-sm font-medium text-slate-700 mt-0.5">{card.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Score History Chart */}
      <ScoreHistoryChart data={scoreHistory} />

      {/* Recent Analyses */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Recent Analyses</h2>
        </div>

        {resumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <FileText size={24} className="text-blue-500" />
            </div>
            <p className="text-slate-500 text-sm mb-4">No resumes analyzed yet</p>
            <Link href="/dashboard/analyze">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white">
                Analyze Your First Resume
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {resumes.map((resume) => {
              const latestAnalysis = resume.analyses[0];
              return (
                <div
                  key={resume.id}
                  className="flex items-center px-5 py-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mr-3 shrink-0">
                    <FileText size={15} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {resume.fileName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(resume.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {latestAnalysis && (
                      <>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getScoreBadgeStyle(latestAnalysis.atsScore)}`}>
                          ATS {latestAnalysis.atsScore}
                        </span>
                        {latestAnalysis.matchScore && (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getMatchBadgeStyle(latestAnalysis.matchScore)}`}>
                            {latestAnalysis.matchScore}% match
                          </span>
                        )}
                        <Link href={`/dashboard/results/${latestAnalysis.id}`}>
                          <ChevronRight size={16} className="text-slate-400 hover:text-slate-600" />
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}