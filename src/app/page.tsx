import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Bot,
  ArrowRight,
  Zap,
  BarChart2,
  Star,
  RefreshCw,
  Briefcase,
  CheckCircle,
} from "lucide-react";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Hero */}
      <section
        className="relative min-h-screen flex flex-col overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #0f2040 100%)",
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glow blobs */}
        <div
          className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "#2563eb" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ background: "#9333ea" }}
        />

        {/* Nav */}
        <div className="relative z-10 flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              AI Career Copilot
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-slate-300 hover:text-white text-sm font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/25"
            >
              Get Started Free
            </Link>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex items-center px-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full py-16">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <Zap size={12} />
                Powered by Google Gemini AI
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-5 tracking-tight">
                AI Career
                <span
                  className="block"
                  style={{
                    WebkitTextFillColor: "transparent",
                    WebkitBackgroundClip: "text",
                    backgroundImage: "linear-gradient(90deg, #60a5fa, #a78bfa)",
                  }}
                >
                  Copilot
                </span>
              </h1>
              <p className="text-slate-300 text-xl leading-relaxed mb-8 max-w-md">
                Analyze, optimize and rewrite your resume with AI — and land
                interviews at top companies faster.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/sign-up"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all hover:shadow-xl hover:shadow-blue-500/30 text-base"
                >
                  Get Started Free
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/sign-in"
                  className="flex items-center gap-2 border border-white/20 text-white hover:bg-white/10 font-semibold px-7 py-3.5 rounded-xl transition-all text-base"
                >
                  Sign In
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 mt-10">
                {[
                  { label: "Resumes Analyzed", val: "10,000+" },
                  { label: "Avg ATS Improvement", val: "+24pts" },
                  { label: "Jobs Matched", val: "50K+" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-white font-bold text-xl">{s.val}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: floating resume card */}
            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-sm">
                {/* Main card */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                      JD
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">John Doe</p>
                      <p className="text-slate-500 text-xs">Full Stack Developer</p>
                    </div>
                    <div className="ml-auto bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      87 ATS
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">ATS Score</span>
                      <span className="font-bold text-slate-900">87 / 100</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: "87%" }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Job Match</span>
                      <span className="font-bold text-slate-900">91%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: "91%" }}
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <p className="text-xs font-semibold text-slate-700 mb-2">
                      Matched Keywords
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {["React", "TypeScript", "Node.js", "AWS", "CI/CD"].map((kw) => (
                        <span
                          key={kw}
                          className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full border border-green-200 font-medium"
                        >
                          ✓ {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating badge top */}
                <div className="absolute -top-4 -right-4 bg-purple-600 text-white rounded-xl px-3 py-2 shadow-lg z-20">
                  <p className="text-xs font-semibold">AI Suggestions</p>
                  <p className="text-lg font-bold leading-none mt-0.5">12</p>
                </div>

                {/* Floating badge bottom */}
                <div className="absolute -bottom-3 -left-4 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg z-20 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle size={13} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 leading-none">
                      Analysis complete
                    </p>
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">
                      2.3 seconds
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features row */}
        <div className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: <BarChart2 size={20} />,
                title: "ATS Score Analysis",
                desc: "Instant compatibility scoring",
              },
              {
                icon: <Star size={20} />,
                title: "Keyword Optimization",
                desc: "Match job descriptions precisely",
              },
              {
                icon: <RefreshCw size={20} />,
                title: "AI Resume Rewrite",
                desc: "One-click bullet point improvement",
              },
              {
                icon: <Briefcase size={20} />,
                title: "Job Match Engine",
                desc: "Smart role compatibility scoring",
              },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-300 shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{f.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}