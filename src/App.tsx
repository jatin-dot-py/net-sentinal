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
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-200 font-sans flex flex-col">
      {/* Header Section */}
      <header className="flex-shrink-0 border-b border-slate-800/50 bg-slate-900/30 backdrop-blur-sm z-50">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                  <Activity className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    Net-Sentinel
                    <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Network Monitor
                    </span>
                  </h1>
                  <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5" />
                    Real-time multi-region latency & jitter analysis
                  </p>
                </div>
              </div>
            </div>
            <ControlPanel />
          </div>
        </div>
      </header>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
        {/* Left Sidebar - Region Selector */}
        <aside className="w-full lg:w-72 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-slate-800/50 bg-slate-900/20 backdrop-blur-sm">
          <div className="p-3 lg:p-4">
            <RegionSidebar />
          </div>
        </aside>

        {/* Main Content Area - Chart Centered */}
        <div className="flex-1 min-w-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
              {/* Performance Metrics - Above Chart */}
              <StatGrid />

              {/* Chart - Centerpiece */}
              <NetworkChart />

              {/* Connection Logs - Below Chart */}
              <IncidentTable />
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}