"use client";

import { useNetworkStore } from "../../lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Activity, Zap, Gamepad2, Video, Globe, TrendingUp, History } from "lucide-react";

const THRESHOLDS = {
  GAMING: { 
    label: "GAMING", 
    maxLatency: 50,
    maxJitter: 15,
    windowSize: 180 
  },
  VIDEO: { 
    label: "VIDEO CALL", 
    maxLatency: 250,
    maxJitter: 40,
    windowSize: 300
  },
  BROWSING: { 
    label: "BROWSING", 
    maxLatency: 1500,
    maxJitter: 9999,
    windowSize: 30
  },
};

export function StatGrid() {
  const { liveData, history, selectedSessionId } = useNetworkStore();

  let dataset = liveData;

  if (selectedSessionId) {
    const session = history.find(s => s.id === selectedSessionId);
    if (session) {
      dataset = session.data;
    }
  }

  const getScore = (dataSlice: typeof dataset, config: typeof THRESHOLDS.GAMING) => {
    if (dataSlice.length === 0) return 100;

    const badPoints = dataSlice.filter(d => 
      !d.success || 
      d.latency > config.maxLatency || 
      d.jitter > config.maxJitter
    ).length;

    return ((dataSlice.length - badPoints) / dataSlice.length) * 100;
  };

  const scores = {
    gaming: {
      recent: getScore(dataset.slice(-THRESHOLDS.GAMING.windowSize), THRESHOLDS.GAMING),
      total: getScore(dataset, THRESHOLDS.GAMING)
    },
    video: {
      recent: getScore(dataset.slice(-THRESHOLDS.VIDEO.windowSize), THRESHOLDS.VIDEO),
      total: getScore(dataset, THRESHOLDS.VIDEO)
    },
    web: {
      recent: getScore(dataset.slice(-THRESHOLDS.BROWSING.windowSize), THRESHOLDS.BROWSING),
      total: getScore(dataset, THRESHOLDS.BROWSING)
    }
  };

  const last = dataset[dataset.length - 1];
  const validPoints = dataset.filter(d => d.success);
  
  const currLatency = last?.success ? `${last.latency} ms` : "---";
  const currJitter = last?.success ? `${last.jitter} ms` : "---";

  const avgLat = validPoints.reduce((sum, d) => sum + d.latency, 0) / (validPoints.length || 1);
  const avgJit = validPoints.reduce((sum, d) => sum + d.jitter, 0) / (validPoints.length || 1);
  
  const avgLatDisplay = `${Math.round(avgLat)} ms`;
  const avgJitDisplay = `${Math.round(avgJit)} ms`;

  return (
    <div className="space-y-4 mb-8">
      
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard 
          label="LATENCY" 
          value={currLatency} 
          subValue={avgLatDisplay}
          subLabel="AVG"
          icon={<Zap className="text-blue-500" />} 
        />
        <StatCard 
          label="JITTER" 
          value={currJitter} 
          subValue={avgJitDisplay}
          subLabel="AVG"
          icon={<Activity className="text-purple-500" />} 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ScoreCard 
          label="GAMING RELIABILITY" 
          config={THRESHOLDS.GAMING}
          scores={scores.gaming}
          icon={<Gamepad2 className="text-pink-500" />} 
        />
        <ScoreCard 
          label="VIDEO RELIABILITY" 
          config={THRESHOLDS.VIDEO}
          scores={scores.video}
          icon={<Video className="text-blue-400" />} 
        />
        <ScoreCard 
          label="BROWSING SCORE" 
          config={THRESHOLDS.BROWSING}
          scores={scores.web}
          icon={<Globe className="text-emerald-400" />} 
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, subValue, subLabel, icon }: any) {
  return (
    <Card className="bg-slate-950 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold text-slate-500 tracking-wider">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-2xl font-bold font-mono text-slate-200">{value}</div>
            <p className="text-[10px] text-slate-500 mt-1">Real-Time</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold font-mono text-slate-400">{subValue}</div>
            <p className="text-[10px] text-slate-600 uppercase tracking-wider">{subLabel}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ScoreCard({ label, config, scores, icon }: any) {
  const getColor = (s: number) => {
    if (s < 75) return "text-red-500";
    if (s < 90) return "text-yellow-500";
    return "text-emerald-500";
  };

  return (
    <Card className="bg-slate-950 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xs font-bold text-slate-400 tracking-wider">{label}</CardTitle>
          <div className="flex gap-2 text-[10px] text-slate-600">
             <span>lat &lt; {config.maxLatency}ms</span>
             <span>jit &lt; {config.maxJitter}ms</span>
          </div>
        </div>
        {icon}
      </CardHeader>
      
      <CardContent className="pt-2">
        <div className="flex items-center justify-between">
          
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <TrendingUp size={10} /> Last {config.windowSize} seconds
            </span>
            <span className={`text-2xl font-black font-mono ${getColor(scores.recent)}`}>
              {scores.recent.toFixed(0)}%
            </span>
          </div>

          <div className="h-8 w-[1px] bg-slate-800"></div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <History size={10} /> Total
            </span>
            <span className={`text-xl font-bold font-mono ${getColor(scores.total)}`}>
              {scores.total.toFixed(0)}%
            </span>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}