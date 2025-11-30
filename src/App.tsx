"use client";

import { useNetworkEngine } from "./hooks/useNetworkEngine";
import { StatGrid } from "./components/dashboard/StatGrid";
import { NetworkChart } from "./components/dashboard/NetworkChart";
import { IncidentTable } from "./components/dashboard/IncidentTable";
import { ControlPanel } from "./components/dashboard/ControlPanel";
import { Activity } from "lucide-react";

export default function Dashboard() {
  // 1. Initialize the background engine
  useNetworkEngine();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-500" />
              Net-Sentinel
            </h1>
            <p className="text-slate-500 mt-1">
              Client-Side Network Jitter & Latency Forensics
            </p>
          </div>
          <ControlPanel />
        </div>

        <div className="space-y-8">
          {/* Top Stats */}
          <StatGrid />

          {/* Main Chart Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3">
              <NetworkChart />
            </div>
          </div>

          {/* Logs */}
          <IncidentTable />
        </div>

      </div>
    </main>
  );
}