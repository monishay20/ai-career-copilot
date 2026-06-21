"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle, Zap, RefreshCw } from "lucide-react";

export default function AnalyzePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (selected: File) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(selected.type)) {
      setError("Only PDF or DOCX files are allowed");
      return;
    }
    if (selected.size > 4 * 1024 * 1024) {
      setError("File size must be under 4MB");
      return;
    }
    setError(null);
    setFile(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileChange(dropped);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobDescription", jobDescription);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      router.push(`/dashboard/results/${data.analysisId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold text-slate-900">Analyze Resume</h1>
        <p className="text-slate-500 text-sm mt-1">
          Upload your resume and paste a job description to get your ATS score and AI feedback.
        </p>
      </div>

      {/* Upload area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Resume File
        </label>
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => {
            const el = document.createElement("input");
            el.type = "file";
            el.accept = ".pdf,.docx";
            el.onchange = (ev) => {
              const f = (ev.target as HTMLInputElement).files?.[0];
              if (f) handleFileChange(f);
            };
            el.click();
          }}
          className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : file
              ? "border-green-400 bg-green-50"
              : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
          }`}
        >
          {file ? (
            <>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-3">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <p className="font-semibold text-slate-800 text-sm">{file.name}</p>
              <p className="text-xs text-slate-500 mt-1">Click to replace</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <Upload size={24} className="text-blue-500" />
              </div>
              <p className="font-semibold text-slate-700 text-sm">
                Drop your resume here
              </p>
              <p className="text-xs text-slate-500 mt-1">PDF or DOCX — up to 4MB</p>
              <div className="mt-4 text-xs font-semibold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-lg">
                Browse Files
              </div>
            </>
          )}
        </div>
      </div>

      {/* Job description */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Job Description
        </label>
        <p className="text-xs text-slate-500 mb-3">
          Paste the full job posting to get accurate keyword matching and ATS scoring.
        </p>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste job description here... e.g. 'We are looking for a Senior Software Engineer with 5+ years of experience in React, TypeScript, and Node.js...'"
          rows={7}
          className="w-full text-sm text-slate-700 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate-400">{jobDescription.length} characters</span>
          {jobDescription.length > 0 && (
            <span className="text-xs text-green-600 font-medium">✓ Ready to analyze</span>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
          {error}
        </p>
      )}

      {/* CTA */}
      <button
        onClick={handleAnalyze}
        disabled={!file || isAnalyzing}
        className={`w-full flex items-center justify-center gap-2.5 text-white font-bold py-4 rounded-xl text-base transition-all ${
          !file
            ? "bg-slate-300 cursor-not-allowed"
            : isAnalyzing
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-500/25"
        }`}
      >
        {isAnalyzing ? (
          <>
            <RefreshCw size={18} className="animate-spin" />
            Analyzing your resume...
          </>
        ) : (
          <>
            <Zap size={18} />
            Analyze Resume
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-400 pb-8">
        Analysis takes 5–30 seconds • Your data is processed securely
      </p>
    </div>
  );
}