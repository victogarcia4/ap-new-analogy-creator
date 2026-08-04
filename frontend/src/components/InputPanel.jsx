import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2, Wand2 } from "lucide-react";

const DOMAINS = [
  "Household & Daily Life",
  "Technology & Computing",
  "Business & Factory Logistics",
  "Sports & Athletics",
  "Pop Culture/Wildcard",
];

const VIBES = ["Academic & Highly Precise", "Casual & Humorous"];

export default function InputPanel({
  concept,
  setConcept,
  targetDomain,
  setTargetDomain,
  vibeStyle,
  setVibeStyle,
  mode,
  setMode,
  lightTheme,
  onGenerate,
  loading,
}) {
  const vibeIndex = VIBES.indexOf(vibeStyle);

  return (
    <div className="flex-1 flex flex-col gap-8 px-8 py-8">
      {/* Concept textarea */}
      <div className="space-y-3">
        <label
          htmlFor="concept-input"
          className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400"
        >
          Biological Concept or Pathway
        </label>
        <Textarea
          id="concept-input"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="e.g., The countercurrent multiplier system in the nephron loop, or the propagation of an action potential along an axon."
          className="min-h-[160px] bg-slate-950 border-slate-700 focus:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-500/40 text-slate-100 placeholder:text-slate-500 rounded-md resize-none leading-relaxed"
          data-testid="concept-textarea"
        />
      </div>

      {/* Target domain */}
      <div className="space-y-3">
        <label className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
          Analogy Target Domain
        </label>
        <Select value={targetDomain} onValueChange={setTargetDomain}>
          <SelectTrigger
            className="h-11 bg-slate-950 border-slate-700 text-slate-100 hover:border-slate-600 focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500"
            data-testid="domain-select-trigger"
          >
            <SelectValue placeholder="Choose a domain" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
            {DOMAINS.map((d) => (
              <SelectItem
                key={d}
                value={d}
                className="focus:bg-emerald-500/10 focus:text-emerald-300 data-[state=checked]:text-emerald-400"
                data-testid={`domain-option-${d.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              >
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Vibe toggle slider */}
      <div className="space-y-4">
        <label className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
          Lecture Vibe &amp; Delivery Style
        </label>
        <div className="px-1">
          <Slider
            value={[vibeIndex === -1 ? 0 : vibeIndex]}
            onValueChange={(vals) => setVibeStyle(VIBES[vals[0]])}
            min={0}
            max={1}
            step={1}
            className="[&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-400 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-emerald-500/30 [&>span:first-child]:h-1.5 [&>span:first-child]:bg-slate-800 [&>span:first-child_span]:bg-emerald-500"
            data-testid="vibe-slider"
          />
          <div className="flex justify-between mt-3 text-xs">
            <button
              type="button"
              onClick={() => setVibeStyle(VIBES[0])}
              className={`transition-colors text-left ${
                vibeStyle === VIBES[0]
                  ? "text-emerald-400 font-semibold"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              data-testid="vibe-academic-btn"
            >
              Academic &amp; Highly Precise
            </button>
            <button
              type="button"
              onClick={() => setVibeStyle(VIBES[1])}
              className={`transition-colors text-right ${
                vibeStyle === VIBES[1]
                  ? "text-emerald-400 font-semibold"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              data-testid="vibe-casual-btn"
            >
              Casual &amp; Humorous
            </button>
          </div>
        </div>
      </div>

      {/* Generation mode */}
      <div className="space-y-3">
        <label className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
          Generation Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[['standard', 'Detailed'], ['light', 'Light / economical']].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`rounded-md border px-3 py-2 text-xs transition-colors ${mode === value ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300' : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          Light mode uses a shorter prompt and the lower-cost model.
        </p>
      </div>

      {/* CTA */}
      <div className="mt-auto pt-4">
        <Button
          onClick={onGenerate}
          disabled={loading}
          className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold text-base tracking-wide rounded-md shadow-lg shadow-emerald-500/20 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          data-testid="generate-analogy-btn"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Drafting…
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5 mr-2" strokeWidth={2} />
              Draft Teaching Analogy
            </>
          )}
        </Button>
        <p className="text-xs text-slate-500 mt-3 text-center">
          OpenRouter · {mode === "light" ? "economical Light mode" : "structured lecture assets"}
        </p>
        <p className="text-[11px] text-slate-600 mt-2 text-center">
          Built by Dr. Victor Garcia M @{" "}
          <a
            href="https://48hours.live"
            target="_blank"
            rel="noreferrer"
            className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
          >
            48hours.live
          </a>
          {lightTheme ? " · Light theme enabled" : ""}
        </p>
      </div>
    </div>
  );
}
