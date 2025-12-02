"use client";

import { useNetworkStore } from "@/lib/store";
import { generateSessionPDF } from "@/lib/pdf-generator";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Square, Trash2, Download, History, Clock } from "lucide-react";
import { format } from "date-fns";

export function ControlPanel() {
  const { isRunning, setIsRunning, clearHistory, history, viewingSessionId, setViewingSession } = useNetworkStore();
  const selectedSession = history.find(s => s.id === viewingSessionId);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleExportPDF = () => {
    if (selectedSession) {
      generateSessionPDF(selectedSession);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-[280px]">
        <Select 
          value={viewingSessionId || "live"} 
          onValueChange={(v) => setViewingSession(v === "live" ? null : v)} 
          disabled={isRunning}
        >
          <SelectTrigger className="bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-900 hover:border-slate-600 transition-colors">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-slate-400" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
            <SelectItem value="live">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Monitor</span>
                <span className="text-xs text-slate-500 ml-auto">Real-time</span>
              </div>
            </SelectItem>
            {history.length === 0 ? (
              <div className="px-2 py-4 text-sm text-slate-500 text-center">
                No saved sessions
              </div>
            ) : (
              history.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm">{s.name}</span>
                    <span className="text-xs text-slate-500">
                      {format(new Date(s.startTime), 'MMM d, HH:mm')} - {format(new Date(s.endTime), 'HH:mm')}
                    </span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {!viewingSessionId && (
        <Button 
          onClick={handleStartStop} 
          className={`font-semibold transition-all ${
            isRunning 
              ? "bg-red-600/90 hover:bg-red-600 text-white shadow-lg shadow-red-500/20" 
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
          }`}
          size="default"
        >
          {isRunning ? (
            <>
              <Square className="mr-2 h-4 w-4" />
              Stop Monitoring
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Monitoring
            </>
          )}
        </Button>
      )}

      {viewingSessionId && selectedSession && (
        <Button 
          onClick={handleExportPDF} 
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
          size="default"
        >
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      )}

      <Button 
        variant="outline" 
        onClick={clearHistory} 
        disabled={isRunning || history.length === 0} 
        className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-300 hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        size="default"
        title={history.length === 0 ? "No history to clear" : "Clear all saved sessions"}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Clear History
      </Button>

      {history.length > 0 && (
        <div className="px-3 py-1.5 rounded-md bg-slate-900/50 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
          <Clock className="h-3.5 w-3.5" />
          {history.length} {history.length === 1 ? 'session' : 'sessions'}
        </div>
      )}
    </div>
  );
}