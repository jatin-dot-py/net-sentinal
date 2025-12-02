"use client";

import { useNetworkStore, type RegionID } from "@/lib/store";
import { WifiOff, Network } from "lucide-react";

const META: Record<RegionID, { name: string; location: string; flag: string }> = {
  default: { name: "Local Edge", location: "CDN", flag: "🌐" },
  mumbai: { name: "Mumbai", location: "Asia Pacific", flag: "🇮🇳" },
  washington: { name: "Washington DC", location: "North America", flag: "🇺🇸" },
  stockholm: { name: "Stockholm", location: "Europe", flag: "🇸🇪" }
};

const getLatencyStatus = (latency: number | undefined, success: boolean): { color: string; label: string; bgColor: string } => {
  if (!success || latency === undefined) return { color: "text-red-400", label: "Offline", bgColor: "bg-red-500/10" };
  if (latency < 50) return { color: "text-emerald-400", label: "Excellent", bgColor: "bg-emerald-500/10" };
  if (latency < 100) return { color: "text-blue-400", label: "Good", bgColor: "bg-blue-500/10" };
  if (latency < 200) return { color: "text-yellow-400", label: "Fair", bgColor: "bg-yellow-500/10" };
  return { color: "text-orange-400", label: "Poor", bgColor: "bg-orange-500/10" };
};

export function RegionSidebar() {
  const { liveData, history, viewingRegion, viewingSessionId, setViewingRegion, isRunning } = useNetworkStore();

  let dataSource = liveData;
  if (viewingSessionId) {
    const s = history.find(h => h.id === viewingSessionId);
    if (s) dataSource = s.regionData;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Network className="h-4 w-4 text-slate-400" />
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Regions</h2>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-1.5 lg:space-y-0">
        {(Object.keys(META) as RegionID[]).map((r) => {
          const regionData = dataSource[r];
          const last = regionData.slice(-1)[0];
          const active = viewingRegion === r;
          const isLive = !viewingSessionId && isRunning;
          const successRate = regionData.length > 0 
            ? (regionData.filter(d => d.s).length / regionData.length) * 100 
            : 0;
          
          const status = getLatencyStatus(last?.l, last?.s ?? false);
          
          return (
            <div
              key={r}
              onClick={() => setViewingRegion(r)}
              className={`group relative cursor-pointer border rounded-md transition-all duration-200 ${
                active 
                  ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/50 ring-1 ring-blue-500/30" 
                  : "bg-slate-900/30 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50"
              }`}
            >
              <div className="p-2.5">
                <div className="flex items-center justify-between gap-2">
                  {/* Left: Flag + Name */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-base flex-shrink-0">{META[r].flag}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-100 text-sm truncate">{META[r].name}</div>
                      <div className="text-xs text-slate-500 truncate">{META[r].location}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <div className={`text-xl font-bold font-mono ${status.color}`}>
                        {last?.s ? last.l : "--"}
                      </div>
                      <div className="text-xs text-slate-500">ms</div>
                    </div>
                    {isLive && last?.s && (
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    )}
                    {isLive && !last?.s && (
                      <WifiOff className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50">
                  <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                  {regionData.length > 0 && (
                    <span className="text-xs text-slate-500 font-mono">{successRate.toFixed(0)}%</span>
                  )}
                </div>
              </div>
              
              {active && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-l-md"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}