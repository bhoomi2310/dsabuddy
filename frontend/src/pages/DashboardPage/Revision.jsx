import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Repeat, Check, ExternalLink, Shuffle } from "lucide-react";
import { questionService } from "@/api/services";
import { Spinner } from "@/components/common";

const DIFF_STYLES = {
  EASY: "text-[#10B981] bg-[#10B981]/10",
  MEDIUM: "text-[#F5B14C] bg-[#F5B14C]/10",
  HARD: "text-[#F26D6D] bg-[#F26D6D]/10",
};

const diffLabel = (d) => (d ? d[0] + d.slice(1).toLowerCase() : "—");

function problemUrl(q) {
  return q.sourceUrl || q.leetcodeUrl || null;
}

export function Revision() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await questionService.getRevision(5);
      const list = (res.questions || []).map((q) => ({
        ...q,
        status: q.userStatuses?.[0]?.status || "UNSOLVED",
      }));
      setQuestions(list);
    } catch (e) {
      console.error("Failed to load revision questions", e);
      setError("Failed to load revision questions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSolved = async (q) => {
    const next = q.status === "SOLVED" ? "UNSOLVED" : "SOLVED";
    setQuestions((prev) =>
      prev.map((x) => (x.id === q.id ? { ...x, status: next } : x))
    );
    try {
      await questionService.setStatus(q.id, next);
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const solvedCount = questions.filter((q) => q.status === "SOLVED").length;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-white text-4xl font-normal italic mb-2 font-serif flex items-center gap-3">            Last Minute Revision
          </h1>
          <p className="text-neutral-500 font-mono text-sm">
            A quick random set to blitz before your interview.{" "}
            {questions.length > 0 && (
              <span className="text-neutral-400">
                {solvedCount} / {questions.length} done
              </span>
            )}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-800 text-neutral-300 hover:text-white hover:border-[#35b9f1]/50 font-mono text-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          <Shuffle className="w-4 h-4" />
          Shuffle
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-24 text-neutral-600 font-mono">
          No questions available yet.
        </div>
      ) : (
        <div className="border border-neutral-900 rounded-2xl overflow-hidden bg-[#0D1117]">
          {questions.map((q, i) => {
            const solved = q.status === "SOLVED";
            const url = problemUrl(q);
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.01, 0.4) }}
                className="grid grid-cols-[40px_1fr_auto] items-center gap-3 px-4 py-3 border-b border-neutral-900/70 last:border-b-0 hover:bg-neutral-900/30 transition-colors"
              >
                <button
                  onClick={() => toggleSolved(q)}
                  title={solved ? "Mark unsolved" : "Mark solved"}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                    solved
                      ? "bg-[#10B981] border-[#10B981]"
                      : "border-neutral-700 hover:border-[#35b9f1]"
                  }`}
                >
                  {solved && <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />}
                </button>

                <div className="min-w-0">
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className={`text-sm inline-flex items-center gap-1.5 hover:text-[#35b9f1] transition-colors ${
                        solved ? "text-neutral-500 line-through" : "text-neutral-200"
                      }`}
                    >
                      <span className="truncate">{q.displayName || q.title}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                    </a>
                  ) : (
                    <span className={`text-sm ${solved ? "text-neutral-500 line-through" : "text-neutral-200"}`}>
                      {q.displayName || q.title}
                    </span>
                  )}
                  {q.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {q.tags.slice(0, 3).map((t) => (
                        <span
                          key={t.tag.id}
                          className="text-[10px] font-mono text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded"
                        >
                          {t.tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-md text-center w-16 ${
                    DIFF_STYLES[q.difficulty] || "text-neutral-500 bg-neutral-900"
                  }`}
                >
                  {diffLabel(q.difficulty)}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
