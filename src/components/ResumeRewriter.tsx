"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Rewrite {
  section: string;
  original: string;
  rewritten: string;
  explanation: string;
}

interface RewriteResult {
  rewrites: Rewrite[];
  improvedSummary: string | null;
}

export default function ResumeRewriter({ analysisId }: { analysisId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RewriteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRewrite = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rewrite failed");
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
    if (!result) return;
    setIsDownloading(true);

    try {
        const res = await fetch("/api/download-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            analysisId,
            rewrites: result.rewrites,
            improvedSummary: result.improvedSummary,
        }),
    });

    if (!res.ok) throw new Error("Download failed");

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "optimized-resume.pdf";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsDownloading(false);
    }
    };

  return (
    <div className="space-y-4">
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-purple-800 flex items-center gap-2">
            ✨ AI Resume Rewriter
          </CardTitle>
          <p className="text-sm text-purple-600">
            Let AI rewrite your weak bullet points into strong, quantified, ATS-optimized ones
          </p>
        </CardHeader>
        <CardContent>
          {!result && (
            <Button
              onClick={handleRewrite}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Rewriting your resume...
                </span>
              ) : (
                "✨ Rewrite My Resume"
              )}
            </Button>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg border border-red-200 mt-3">
              {error}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Improved Summary */}
      {result?.improvedSummary && (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Badge className="bg-purple-100 text-purple-800">Summary</Badge>
              Improved Professional Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 leading-relaxed">
                {result.improvedSummary}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bullet Point Rewrites */}
      {result?.rewrites && result.rewrites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Rewritten Bullet Points ({result.rewrites.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {result.rewrites.map((rewrite, index) => (
              <div key={index} className="space-y-3">
                <Badge variant="outline" className="text-xs">
                  {rewrite.section}
                </Badge>

                {/* Before */}
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs font-semibold text-red-500 mb-1">❌ BEFORE</p>
                  <p className="text-sm text-red-800">{rewrite.original}</p>
                </div>

                {/* After */}
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs font-semibold text-green-500 mb-1">✅ AFTER</p>
                  <p className="text-sm text-green-800">{rewrite.rewritten}</p>
                </div>

                {/* Explanation */}
                <p className="text-xs text-slate-500 flex gap-1">
                  <span>💡</span>
                  <span>{rewrite.explanation}</span>
                </p>

                {index < result.rewrites.length - 1 && (
                  <hr className="border-slate-100" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}


      {/* Download Button */}
        {result && (
        <div className="flex justify-center pb-4">
            <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-green-600 hover:bg-green-700 text-white px-8"
            size="lg"
            >
            {isDownloading ? (
                <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating PDF...
                </span>
            ) : (
                "⬇️ Download Optimized Resume"
            )}
            </Button>
        </div>
        )}
    </div>
  );
}