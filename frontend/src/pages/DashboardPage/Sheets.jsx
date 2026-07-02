import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  ChevronDown,
  FileText,
  Star,
  ExternalLink,
  ArrowLeft,
  Check,
} from "lucide-react";
import { sheetService } from "@/api/services";
import { Spinner } from "@/components/common";

const DIFF_STYLES = {
  EASY: "text-[#10B981] bg-[#10B981]/10",
  MEDIUM: "text-[#F5B14C] bg-[#F5B14C]/10",
  HARD: "text-[#F26D6D] bg-[#F26D6D]/10",
};

const diffLabel = (d) => (d ? d[0] + d.slice(1).toLowerCase() : "—");

function ProgressBar({ solved, total, className = "" }) {
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-1.5 bg-neutral-900 rounded-full overflow-hidden min-w-[60px]">
        <div
          className="h-full bg-[#35b9f1] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-neutral-500 tabular-nums whitespace-nowrap">
        {solved} / {total}
      </span>
    </div>
  );
}

/* ----------------------------- List view ----------------------------- */

function SheetList() {
  const navigate = useNavigate();
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await sheetService.getSheets();
        if (!cancelled) setSheets(res.sheets || []);
      } catch (e) {
        console.error("Failed to load sheets", e);
        if (!cancelled) setError("Failed to load sheets.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-white text-4xl font-normal italic mb-2 font-serif flex items-center gap-3">
          Practice Sheets
        </h1>
        <p className="text-neutral-500 font-mono text-sm">
          Curated DSA sheets — track your progress problem by problem.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {sheets.length === 0 && !error ? (
        <div className="text-center py-24 text-neutral-600 font-mono">
          No sheets available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sheets.map((s) => (
            <motion.button
              key={s.id}
              whileHover={{ y: -3 }}
              onClick={() => navigate(`/dashboard/sheets/${s.slug}`)}
              className="text-left bg-[#0D1117] border border-neutral-900 rounded-2xl p-5 hover:border-[#35b9f1]/40 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3 gap-2">
                <h3 className="text-white font-semibold text-lg leading-snug">
                  {s.name}
                </h3>
                <ChevronRight className="w-5 h-5 text-neutral-700 group-hover:text-[#35b9f1] transition-colors shrink-0" />
              </div>
              {s.author && (
                <p className="text-neutral-500 text-xs font-mono mb-4">
                  by {s.author}
                </p>
              )}
              <ProgressBar solved={s.solvedCount || 0} total={s.totalProblems || 0} />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------- Detail view ---------------------------- */

function ResourceIcons({ problem }) {
  const items = [
    problem.articleUrl && { url: problem.articleUrl, icon: FileText, title: "Article", cls: "text-neutral-400 hover:text-white" },
  ].filter(Boolean);

  if (items.length === 0) return <span className="text-neutral-700">—</span>;

  return (
    <div className="flex items-center gap-2">
      {items.map(({ url, icon: Icon, title, cls }) => (
        <a
          key={title}
          href={url}
          target="_blank"
          rel="noreferrer"
          title={title}
          className={`${cls} transition-colors`}
          onClick={(e) => e.stopPropagation()}
        >
          <Icon className="w-4 h-4" />
        </a>
      ))}
    </div>
  );
}

function ProblemRow({ problem, onUpdate }) {
  const solved = problem.status === "SOLVED";

  const toggleSolved = () =>
    onUpdate(problem.id, { status: solved ? "UNSOLVED" : "SOLVED" });

  const toggleStar = () => onUpdate(problem.id, { starred: !problem.starred });

  return (
    <>
      <div className="grid grid-cols-[40px_1fr_auto_auto_auto] items-center gap-3 px-4 py-3 border-b border-neutral-900/70 hover:bg-neutral-900/30 transition-colors">
        {/* Status */}
        <button
          onClick={toggleSolved}
          title={solved ? "Mark unsolved" : "Mark solved"}
          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
            solved
              ? "bg-[#10B981] border-[#10B981]"
              : "border-neutral-700 hover:border-[#35b9f1]"
          }`}
        >
          {solved && <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />}
        </button>

        {/* Problem title (+ practice link) */}
        <div className="min-w-0">
          {problem.practiceUrl ? (
            <a
              href={problem.practiceUrl}
              target="_blank"
              rel="noreferrer"
              className={`text-sm hover:text-[#35b9f1] transition-colors inline-flex items-center gap-1.5 ${
                solved ? "text-neutral-500 line-through" : "text-neutral-200"
              }`}
            >
              <span className="truncate">{problem.title}</span>
              <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
            </a>
          ) : (
            <span className={`text-sm ${solved ? "text-neutral-500 line-through" : "text-neutral-200"}`}>
              {problem.title}
            </span>
          )}
        </div>

        {/* Resources */}
        <div className="w-14 flex justify-center">
          <ResourceIcons problem={problem} />
        </div>

        {/* Revision (star) */}
        <button
          onClick={toggleStar}
          title="Mark for revision"
          className={`w-8 flex justify-center transition-colors cursor-pointer ${
            problem.starred ? "text-[#F5B14C]" : "text-neutral-600 hover:text-neutral-300"
          }`}
        >
          <Star className="w-4 h-4" fill={problem.starred ? "currentColor" : "none"} />
        </button>

        {/* Difficulty */}
        <span
          className={`text-[11px] font-mono px-2 py-0.5 rounded-md text-center w-16 ${
            DIFF_STYLES[problem.difficulty] || "text-neutral-500 bg-neutral-900"
          }`}
        >
          {diffLabel(problem.difficulty)}
        </span>
      </div>
    </>
  );
}

function SectionNode({ section, onUpdate, depth = 0 }) {
  const [open, setOpen] = useState(depth === 0);
  const hasProblems = section.problems?.length > 0;
  const hasChildren = section.children?.length > 0;

  return (
    <div className={depth === 0 ? "border border-neutral-900 rounded-2xl overflow-hidden bg-[#0D1117]" : ""}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-900/40 transition-colors cursor-pointer ${
          depth > 0 ? "border-t border-neutral-900/70" : ""
        }`}
        style={{ paddingLeft: `${16 + depth * 16}px` }}
      >
        {open ? (
          <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-neutral-500 shrink-0" />
        )}
        <span className={`flex-1 text-left ${depth === 0 ? "text-white font-semibold" : "text-neutral-300 font-medium text-sm"}`}>
          {section.title}
        </span>
        <ProgressBar solved={section.solved || 0} total={section.total || 0} className="max-w-[180px] hidden sm:flex" />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {hasProblems && (
              <div>
                {section.problems.map((p) => (
                  <ProblemRow key={p.id} problem={p} onUpdate={onUpdate} />
                ))}
              </div>
            )}
            {hasChildren &&
              section.children.map((child) => (
                <SectionNode key={child.id} section={child} onUpdate={onUpdate} depth={depth + 1} />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SheetDetail({ slug }) {
  const navigate = useNavigate();
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await sheetService.getSheetBySlug(slug);
        if (!cancelled) setSheet(res.sheet);
      } catch (e) {
        console.error("Failed to load sheet", e);
        if (!cancelled) setError("Failed to load sheet.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Optimistic local update + persist. Recomputes section/sheet solved counts.
  const handleUpdate = useCallback(async (problemId, payload) => {
    setSheet((prev) => {
      if (!prev) return prev;
      const apply = (node) => ({
        ...node,
        problems: node.problems.map((p) =>
          p.id === problemId ? { ...p, ...payload } : p
        ),
        children: node.children?.map(apply) || [],
      });
      const withUpdate = { ...prev, sections: prev.sections.map(apply) };

      // Recompute solved counts
      const recount = (node) => {
        let solved = node.problems.filter((p) => p.status === "SOLVED").length;
        let total = node.problems.length;
        const children = (node.children || []).map(recount);
        for (const c of children) {
          solved += c.solved;
          total += c.total;
        }
        return { ...node, solved, total, children };
      };
      const sections = withUpdate.sections.map(recount);
      const solvedCount = sections.reduce((a, s) => a + s.solved, 0);
      return { ...withUpdate, sections, solvedCount };
    });

    try {
      await sheetService.updateProgress(problemId, payload);
    } catch (e) {
      console.error("Failed to save progress", e);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (error || !sheet) {
    return (
      <div className="text-center py-24">
        <p className="text-neutral-500 font-mono mb-4">{error || "Sheet not found."}</p>
        <button
          onClick={() => navigate("/dashboard/sheets")}
          className="text-[#35b9f1] font-mono text-sm hover:underline cursor-pointer"
        >
          ← Back to sheets
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate("/dashboard/sheets")}
        className="flex items-center gap-2 text-neutral-500 hover:text-white font-mono text-sm mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        All Sheets
      </button>

      <div className="mb-8">
        <h1 className="text-white text-4xl font-normal italic mb-2 font-serif">
          {sheet.name}
        </h1>
        {sheet.author && (
          <p className="text-neutral-500 font-mono text-sm mb-4">by {sheet.author}</p>
        )}
        <div className="max-w-md">
          <ProgressBar solved={sheet.solvedCount || 0} total={sheet.totalProblems || 0} />
        </div>
      </div>

      <div className="space-y-4">
        {sheet.sections.map((section) => (
          <SectionNode key={section.id} section={section} onUpdate={handleUpdate} />
        ))}
      </div>
    </div>
  );
}

export function Sheets() {
  const { slug } = useParams();
  return slug ? <SheetDetail slug={slug} /> : <SheetList />;
}
