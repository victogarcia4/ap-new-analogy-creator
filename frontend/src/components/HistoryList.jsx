import { Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HistoryList({ items, onOpen, onDelete }) {
  if (!items || items.length === 0) {
    return (
      <div className="text-slate-500 text-sm py-12 text-center border border-dashed border-slate-800 rounded-md">
        No saved analogies yet. Draft your first one to see it here.
      </div>
    );
  }
  return (
    <ul className="space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto pr-1" data-testid="history-list">
      {items.map((h) => (
        <li
          key={h.id}
          className="group bg-slate-950 border border-slate-800 rounded-lg p-4 hover:border-emerald-500/40 transition-colors"
          data-testid={`history-item-${h.id}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-serif-display text-base text-slate-100 truncate">
                {h.analogyTitle}
              </p>
              <p className="text-xs text-slate-500 mt-1 truncate">{h.concept}</p>
              <p className="text-[10px] uppercase tracking-widest text-emerald-500/70 mt-2 font-mono-data">
                {h.targetDomain}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onOpen(h.id)}
                className="h-7 w-7 text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
                data-testid={`history-open-${h.id}`}
                aria-label="Open"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete(h.id)}
                className="h-7 w-7 text-slate-500 hover:text-red-400 hover:bg-slate-800"
                data-testid={`history-delete-${h.id}`}
                aria-label="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
