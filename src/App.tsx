"use client";

import { useNetworkEngine } from "@/hooks/useNetworkEngine";
import { RegionSidebar } from "@/components/dashboard/RegionSidebar";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { NetworkChart } from "@/components/dashboard/NetworkChart";
import { IncidentTable } from "@/components/dashboard/IncidentTable";
import { ControlPanel } from "@/components/dashboard/ControlPanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Globe } from "lucide-react";

export default function Dashboard() {
  useNetworkEngine();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200 font-sans flex flex-col">
      {/* Header Section */}
      <header className="flex-shrink-0 border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-sm z-50 sticky top-0">
        <div className="px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4">
            <div className="space-y-1 w-full lg:w-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex-shrink-0">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span>Net-Sentinel</span>
                    <span className="text-[10px] sm:text-xs font-normal px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Network Monitor
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5 flex items-center gap-1.5 sm:gap-2">
                    <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                    <span className="truncate">Real-time multi-region latency & jitter analysis</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-auto">
              <ControlPanel />
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Left Sidebar - Region Selector */}
        <aside className="w-full lg:w-72 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-slate-800/50 bg-slate-900/20 backdrop-blur-sm lg:max-h-[calc(100vh-80px)] lg:overflow-y-auto">
          <div className="p-3 lg:p-4">
            <RegionSidebar />
          </div>
        </aside>

        {/* Main Content Area - Chart Centered */}
        <div className="flex-1 min-w-0 w-full overflow-x-hidden">
          <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Performance Metrics - Above Chart */}
            <StatGrid />

            {/* Chart - Centerpiece */}
            <NetworkChart />

            {/* Connection Logs - Below Chart */}
            <IncidentTable />
          </div>
        </div>
      </div>
    </div>
  );
}