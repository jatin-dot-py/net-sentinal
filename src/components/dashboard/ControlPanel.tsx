"use client";

import { useNetworkStore } from "../../lib/store";
import { generateSessionPDF } from "../../lib/pdf-generator";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Play, Square, Trash2, Download } from "lucide-react";

export function ControlPanel() {
  const { isRunning, setIsRunning, clearHistory, history, selectedSessionId, selectSession } = useNetworkStore();
  const selectedSession = history.find(s => s.id === selectedSessionId);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-[220px]">
        <Select 
          value={selectedSessionId || "live"} 
          onValueChange={(val) => selectSession(val === "live" ? null : val)}
          disabled={isRunning}
        >
          <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-200">
            <SelectValue placeholder="Select Session" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
            <SelectItem value="live">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 
                Live Monitor
              </span>
            </SelectItem>
            {history.map((session) => (
              <SelectItem key={session.id} value={session.id}>
                {new Date(session.startTime).toLocaleString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedSessionId && (
        !isRunning ? (
          <Button onClick={() => setIsRunning(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
            <Play className="mr-2 h-4 w-4" /> START
          </Button>
        ) : (
          <Button onClick={() => setIsRunning(false)} variant="destructive" className="font-bold animate-pulse">
            <Square className="mr-2 h-4 w-4 fill-current" /> STOP
          </Button>
        )
      )}

      {selectedSessionId && (
        <Button 
          onClick={() => selectedSession && generateSessionPDF(selectedSession)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Download className="mr-2 h-4 w-4" /> EXPORT PDF
        </Button>
      )}

      <Button variant="outline" onClick={clearHistory} className="border-slate-700 hover:bg-slate-800 text-slate-400" disabled={isRunning}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}