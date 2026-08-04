import { useState } from "react";
import { toast } from "sonner";
import { Copy, Download, FileText, TableProperties, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { downloadMarkdown, tableToClipboard } from "@/lib/exportMarkdown";
import { exportPdf } from "@/lib/exportPdf";

const LOADING_MESSAGES = [
  "Synthesizing anatomical metaphor…",
  "Aligning structural functions…",
  "Composing clicker questions…",
];

export default function PreviewCanvas({ analogy, loading }) {
  const [msgIdx, setMsgIdx] = useState(0);

  // Rotate loading message
  if (loading) {
    setTimeout(() => setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length), 1600);
  }

  const copyStory = async () => {
    if (!analogy) return;
    await navigator.clipboard.writeText(analogy.payload.narrative);
    toast.success("Story text copied to clipboard");
  };

  const copyTable = async () => {
    if (!analogy) return;
    await navigator.clipboard.writeText(tableToClipboard(analogy.payload.mapping));
    toast.success("Structural table copied", {
      description: "Paste directly into slides or a spreadsheet.",
    });
  };

  const exportMd = () => {
    if (!analogy) return;
    downloadMarkdown(analogy);
    toast.success("Markdown export downloaded");
  };

  const exportAsPdf = () => {
    if (!analogy) return;
    exportPdf();
  };

  return (
    <>
      {/* Sticky toolbar */}
      <div
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800"
        data-testid="preview-toolbar"
      >
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500 font-mono-data">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-ring" />
          Live Preview Canvas
        </div>
        <div className="flex items-center gap-2">
          <ToolbarButton
            onClick={copyStory}
            disabled={!analogy}
            icon={<Copy className="h-4 w-4" />}
            label="Copy Story Text"
            testId="copy-story-btn"
          />
          <ToolbarButton
            onClick={copyTable}
            disabled={!analogy}
            icon={<TableProperties className="h-4 w-4" />}
            label="Copy Structural Table"
            testId="copy-table-btn"
          />
          <ToolbarButton
            onClick={exportMd}
            disabled={!analogy}
            icon={<Download className="h-4 w-4" />}
            label="Export Presentation"
            testId="export-md-btn"
            primary
          />
          <ToolbarButton
            onClick={exportAsPdf}
            disabled={!analogy}
            icon={<FileText className="h-4 w-4" />}
            label="Export PDF"
            testId="export-pdf-btn"
          />
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div
          className="absolute inset-0 top-[57px] z-30 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-6"
          data-testid="canvas-loading"
        >
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-2 border-emerald-500/20" />
            <Loader2 className="absolute inset-0 m-auto h-20 w-20 text-emerald-500 animate-spin" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <p className="font-serif-display text-2xl text-slate-100">
              {LOADING_MESSAGES[msgIdx]}
            </p>
            <p className="text-sm text-slate-500 mt-2 font-mono-data uppercase tracking-widest">
              OpenRouter · Structured JSON
            </p>
          </div>
        </div>
      )}

      {/* Canvas content */}
      <div className="flex-1 overflow-y-auto" data-testid="canvas-content">
        {analogy ? (
          <RenderedAnalogy analogy={analogy} />
        ) : (
          <EmptyState />
        )}
      </div>
    </>
  );
}

function ToolbarButton({ onClick, disabled, icon, label, testId, primary }) {
  const base =
    "h-9 px-3 text-xs font-medium rounded-md flex items-center gap-2 transition-colors border";
  const style = primary
    ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:border-emerald-400"
    : "bg-slate-800/70 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600";
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${style} disabled:opacity-40 disabled:cursor-not-allowed`}
      data-testid={testId}
    >
      {icon}
      <span className="hidden lg:inline">{label}</span>
    </Button>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex items-center justify-center px-12 py-16">
      <div className="max-w-lg text-center relative">
        <div
          className="absolute inset-0 -z-10 opacity-[0.06] bg-center bg-no-repeat bg-contain pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1725399078936-0b3a854a502f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTF8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMG1vZGVybiUyMGFuYXRvbXklMjBibHVlcHJpbnR8ZW58MHx8fHwxNzg1NzkzNDMxfDA&ixlib=rb-4.1.0&q=85')",
          }}
        />
        <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-400/80 mb-4 font-mono-data">
          Awaiting instruction
        </p>
        <h2 className="font-serif-display text-4xl sm:text-5xl leading-tight text-slate-100">
          Turn dense pathways into memorable metaphors.
        </h2>
        <p className="text-slate-400 mt-6 leading-relaxed">
          Describe a biological concept, choose a target domain, and let the engine draft a
          coherent teaching narrative, a structural blueprint, and two ready-to-project clicker
          questions&mdash;in seconds.
        </p>
      </div>
    </div>
  );
}

function RenderedAnalogy({ analogy }) {
  const { payload } = analogy;
  return (
    <div className="px-8 md:px-12 py-10 max-w-5xl mx-auto space-y-12 animate-fade-up" data-testid="rendered-analogy">
      {/* Section 1: Title & narrative */}
      <section>
        <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-400 font-mono-data mb-3">
          {analogy.targetDomain} · {analogy.vibeStyle}
        </p>
        <h1
          className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-slate-50"
          data-testid="analogy-title"
        >
          {payload.analogyTitle}
        </h1>

        <div
          className="mt-8 relative bg-slate-900/70 border border-slate-800 rounded-xl p-8 shadow-2xl overflow-hidden"
          data-testid="narrative-card"
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 10%, #10b981 0, transparent 40%), radial-gradient(circle at 80% 90%, #334155 0, transparent 45%)",
            }}
          />
          <div className="relative space-y-5 text-slate-200 leading-[1.75] text-[15px]">
            {payload.narrative
              .split(/\n{2,}|\n/g)
              .map((p) => p.trim())
              .filter(Boolean)
              .map((para, i) => (
                <p key={i}>{para}</p>
              ))}
          </div>
        </div>
      </section>

      {/* Section 2: Blueprint table */}
      <section>
        <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-slate-100 mb-4">
          The Blueprint
        </h2>
        <p className="text-slate-400 text-sm mb-6 max-w-2xl">
          Side-by-side mapping between the everyday metaphor and its anatomical counterpart.
        </p>
        <div
          className="rounded-lg border border-slate-800 overflow-hidden shadow-lg"
          data-testid="blueprint-table"
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-300 font-mono-data text-[11px] uppercase tracking-[0.15em]">
                <th className="text-left py-4 px-6 border-b border-slate-800 w-1/3">
                  Metaphor Counterpart
                </th>
                <th className="text-left py-4 px-6 border-b border-slate-800 w-1/3">
                  Anatomical Structure / Process
                </th>
                <th className="text-left py-4 px-6 border-b border-slate-800">
                  Functional Match
                </th>
              </tr>
            </thead>
            <tbody>
              {payload.mapping.map((row, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? "bg-slate-950" : "bg-slate-900/50"}
                  data-testid={`mapping-row-${i}`}
                >
                  <td className="py-4 px-6 border-b border-slate-800/70 font-mono-data text-sm text-emerald-300">
                    {row.analogyComponent}
                  </td>
                  <td className="py-4 px-6 border-b border-slate-800/70 font-mono-data text-sm text-slate-100">
                    {row.biologicalComponent}
                  </td>
                  <td className="py-4 px-6 border-b border-slate-800/70 text-sm text-slate-400 leading-relaxed">
                    {row.functionalMatch}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 3: Clicker questions */}
      <section>
        <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-slate-100 mb-4">
          Formative Assessment
        </h2>
        <p className="text-slate-400 text-sm mb-6 max-w-2xl">
          Two Kahoot-style clickers designed to probe where the metaphor breaks down.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {payload.clickerQuestions.map((q, i) => (
            <ClickerCard key={i} index={i} question={q} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ClickerCard({ index, question }) {
  const [picked, setPicked] = useState(null);

  const correctLetter = (question.correctAnswer || "").trim().charAt(0).toUpperCase();

  return (
    <div
      className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-md"
      data-testid={`clicker-card-${index}`}
    >
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.2em] text-emerald-400 font-mono-data">
          Clicker {index + 1}
        </span>
      </div>
      <div className="px-5 py-5 space-y-4">
        <p className="text-slate-100 font-medium leading-snug">{question.question}</p>
        <div className="space-y-2">
          {question.options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            const isPicked = picked === letter;
            const isCorrect = correctLetter === letter;
            let cls = "border-slate-800 hover:border-slate-600 bg-slate-950 text-slate-200";
            if (picked !== null) {
              if (isCorrect) cls = "border-emerald-500/60 bg-emerald-500/10 text-emerald-200";
              else if (isPicked) cls = "border-red-500/50 bg-red-500/10 text-red-200";
              else cls = "border-slate-800 bg-slate-950/60 text-slate-500";
            }
            return (
              <button
                key={i}
                type="button"
                onClick={() => setPicked(letter)}
                className={`w-full text-left text-sm px-4 py-3 rounded-md border transition-colors ${cls}`}
                data-testid={`clicker-${index}-option-${letter}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        <Accordion type="single" collapsible className="border-t border-slate-800 -mx-5 mt-4">
          <AccordionItem value="reveal" className="border-0">
            <AccordionTrigger
              className="px-5 py-3 text-[12px] uppercase tracking-[0.18em] text-emerald-400 hover:no-underline hover:text-emerald-300 font-mono-data"
              data-testid={`reveal-answer-trigger-${index}`}
            >
              Reveal Answer &amp; Lecture Explanation
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5 text-sm text-slate-300 leading-relaxed">
              <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-md p-4">
                <span className="font-mono-data text-xs uppercase tracking-widest text-emerald-400">
                  Correct
                </span>
                <p className="mt-2 text-slate-200">{question.correctAnswer}</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
