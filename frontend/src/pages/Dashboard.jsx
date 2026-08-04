import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { History, Moon, Sparkles, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { generateAnalogy, fetchHistory, fetchAnalogy, deleteAnalogy } from "@/lib/api";
import InputPanel from "@/components/InputPanel";
import PreviewCanvas from "@/components/PreviewCanvas";
import HistoryList from "@/components/HistoryList";

const DEFAULT_DOMAIN = "Household & Daily Life";
const DEFAULT_VIBE = "Academic & Highly Precise";

export default function Dashboard() {
  const [concept, setConcept] = useState("");
  const [targetDomain, setTargetDomain] = useState(DEFAULT_DOMAIN);
  const [vibeStyle, setVibeStyle] = useState(DEFAULT_VIBE);
  const [mode, setMode] = useState("standard");
  const [lightTheme, setLightTheme] = useState(true);
  const [loading, setLoading] = useState(false);
  const [analogy, setAnalogy] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const items = await fetchHistory();
      setHistory(items);
    } catch (e) {
      console.error("History load failed", e);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleGenerate = async () => {
    if (concept.trim().length < 5) {
      toast.error("Please describe the biological concept in a bit more detail.");
      return;
    }
    setLoading(true);
    try {
      const result = await generateAnalogy({ concept: concept.trim(), targetDomain, vibeStyle, mode });
      setAnalogy(result);
      toast.success("Analogy drafted", { description: result.payload.analogyTitle });
      loadHistory();
    } catch (e) {
      const detail = e?.response?.data?.detail || e.message || "Generation failed";
      toast.error("Generation failed", { description: String(detail).slice(0, 240) });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSaved = async (id) => {
    try {
      const saved = await fetchAnalogy(id);
      setAnalogy(saved);
      setConcept(saved.concept);
      setTargetDomain(saved.targetDomain);
      setVibeStyle(saved.vibeStyle);
      setMode(saved.mode || "standard");
      setHistoryOpen(false);
    } catch (e) {
      toast.error("Could not load that analogy");
    }
  };

  const handleDeleteSaved = async (id) => {
    try {
      await deleteAnalogy(id);
      loadHistory();
      toast.success("Removed from history");
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  return (
    <div
      className={`h-screen w-full flex overflow-hidden bg-slate-950 text-slate-50 ${lightTheme ? "theme-light" : ""}`}
      data-testid="dashboard-root"
    >
      {/* Left panel */}
      <aside className="w-full md:w-1/3 h-full flex flex-col border-r border-slate-800 bg-slate-900/60 overflow-y-auto">
        <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-slate-800/70">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-emerald-400" strokeWidth={2} />
            </div>
            <div>
              <h1 className="font-serif-display text-xl leading-none text-slate-50">
                Analogy Creator
              </h1>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500 mt-1">
                Anatomy &amp; Physiology
              </p>
            </div>
          </div>
          <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
                data-testid="open-history-btn"
              >
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="bg-slate-900 border-slate-800 text-slate-100 w-full sm:max-w-md"
              data-testid="history-sheet"
            >
              <SheetHeader>
                <SheetTitle className="font-serif-display text-2xl text-slate-50">
                  Saved Analogies
                </SheetTitle>
                <SheetDescription className="text-slate-400">
                  Tap any past draft to reopen it in the canvas.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <HistoryList
                  items={history}
                  onOpen={handleOpenSaved}
                  onDelete={handleDeleteSaved}
                />
              </div>
            </SheetContent>
          </Sheet>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLightTheme((enabled) => !enabled)}
            className="text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
            aria-label={lightTheme ? "Switch to dark mode" : "Switch to light mode"}
            data-testid="theme-toggle-btn"
          >
            {lightTheme ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>

        <InputPanel
          concept={concept}
          setConcept={setConcept}
          targetDomain={targetDomain}
          setTargetDomain={setTargetDomain}
          vibeStyle={vibeStyle}
          setVibeStyle={setVibeStyle}
          mode={mode}
          setMode={setMode}
          lightTheme={lightTheme}
          onGenerate={handleGenerate}
          loading={loading}
        />
      </aside>

      {/* Right panel */}
      <main className="hidden md:flex w-2/3 h-full flex-col bg-slate-950 relative overflow-hidden">
        <PreviewCanvas analogy={analogy} loading={loading} />
      </main>
    </div>
  );
}
