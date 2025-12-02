"use client";

import { useNetworkStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Zap, Gamepad2, Video, Globe, TrendingUp, History, Info } from "lucide-react";

const THRESHOLDS = {
  GAMING: { 
    label: "Gaming", 
    description: "Real-time multiplayer games require low latency and stable connections",
    maxL: 90, 
    maxJ: 20, 
    win: 120,
    icon: Gamepad2,
    color: "pink"
  },
  VIDEO: { 
    label: "Video Streaming", 
    description: "Smooth video playback needs consistent latency",
    maxL: 250, 
    maxJ: 40, 
    win: 200,
    icon: Video,
    color: "blue"
  },
  WEB: { 
    label: "Web Browsing", 
    description: "General web usage is more tolerant of latency variations",
    maxL: 1500, 
    maxJ: 999, 
    win: 30,
    icon: Globe,
    color: "emerald"
  },
};

export function StatGrid() {
  const { liveData, history, viewingSessionId, viewingRegion } = useNetworkStore();

  let dataset = liveData[viewingRegion];

  if (viewingSessionId) {
    const session = history.find(s => s.id === viewingSessionId);
    if (session) {
      dataset = session.regionData[viewingRegion];
    }
  }

  // 2. Logic
  const getScore = (slice: typeof dataset, config: any) => {
    if (!slice || slice.length === 0) return 100;
    const bad = slice.filter(d => !d.s || d.l > config.maxL || d.j > config.maxJ).length;
    return ((slice.length - bad) / slice.length) * 100;
  };

  const scores = {
    gaming: {
      recent: getScore(dataset.slice(-THRESHOLDS.GAMING.win), THRESHOLDS.GAMING),
      total: getScore(dataset, THRESHOLDS.GAMING)
    },
    video: {
      recent: getScore(dataset.slice(-THRESHOLDS.VIDEO.win), THRESHOLDS.VIDEO),
      total: getScore(dataset, THRESHOLDS.VIDEO)
    },
    web: {
      recent: getScore(dataset.slice(-THRESHOLDS.WEB.win), THRESHOLDS.WEB),
      total: getScore(dataset, THRESHOLDS.WEB)
    }
  };

  const valid = dataset.filter(d => d.s);
  const last = dataset[dataset.length - 1];
  const avgL = valid.length ? valid.reduce((a, b) => a + b.l, 0) / valid.length : 0;
  const avgJ = valid.length ? valid.reduce((a, b) => a + b.j, 0) / valid.length : 0;
  const maxL = valid.length ? Math.max(...valid.map(d => d.l)) : 0;
  const maxJ = valid.length ? Math.max(...valid.map(d => d.j)) : 0;

  return (
    <div className="space-y-2">
      <div className="grid gap-1.5 grid-cols-2 lg:grid-cols-5">
        <StatCard 
          label="Current Latency" 
          description="Round-trip time for the latest request"
          val={last?.s ? `${last.l} ms` : "--"} 
          avg={`${Math.round(avgL)} ms`}
          max={maxL > 0 ? `${maxL} ms` : "--"}
          icon={<Zap className="h-6 w-6 text-blue-400"/>}
          color="blue"
          compact
        />
        <StatCard 
          label="Current Jitter" 
          description="Variation in latency between consecutive requests"
          val={last?.s ? `${last.j} ms` : "--"} 
          avg={`${Math.round(avgJ)} ms`}
          max={maxJ > 0 ? `${maxJ} ms` : "--"}
          icon={<Activity className="h-6 w-6 text-purple-400"/>}
          color="purple"
          compact
        />
        <ScoreCard config={THRESHOLDS.GAMING} scores={scores.gaming} compact />
        <ScoreCard config={THRESHOLDS.VIDEO} scores={scores.video} compact />
        <ScoreCard config={THRESHOLDS.WEB} scores={scores.web} compact />
      </div>
    </div>
  );
}

function StatCard({ label, description, val, avg, max, icon, color, compact }: any) {
  const colorClasses = {
    blue: "from-blue-500/10 to-cyan-500/10 border-blue-500/30",
    purple: "from-purple-500/10 to-pink-500/10 border-purple-500/30"
  };

  if (compact) {
    return (
      <Card className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} border backdrop-blur-sm`}>
        <CardHeader className="pb-1 px-2 pt-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              {icon}
              <span className="truncate text-xs">{label}</span>
              <div className="group relative flex-shrink-0">
                <Info className="h-2.5 w-2.5 text-slate-500 cursor-help" />
                <div className="absolute left-0 top-4 w-56 p-2 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                  {description}
                </div>
              </div>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-1 px-2 pb-2">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold font-mono text-slate-100">{val}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/50">
            <div>
              <div className="text-slate-500 text-[10px]">Avg</div>
              <div className="font-mono text-slate-300 text-xs">{avg}</div>
            </div>
            <div className="text-right">
              <div className="text-slate-500 text-[10px]">Peak</div>
              <div className="font-mono text-slate-300 text-xs">{max}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} border backdrop-blur-sm`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              {label}
              <div className="group relative">
                <Info className="h-3.5 w-3.5 text-slate-500 cursor-help" />
                <div className="absolute left-0 top-6 w-64 p-2 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                  {description}
                </div>
              </div>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">{description}</CardDescription>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/50">{icon}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold font-mono text-slate-100">{val}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800/50">
          <div>
            <div className="text-xs text-slate-500 mb-1">Average</div>
            <div className="text-sm font-mono text-slate-300">{avg}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Peak</div>
            <div className="text-sm font-mono text-slate-300">{max}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreCard({ config, scores, compact }: any) {
  const Icon = config.icon;
  const getScoreColor = (s: number) => {
    if (s >= 90) return { text: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30" };
    if (s >= 75) return { text: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30" };
    return { text: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30" };
  };

  const iconColorClasses: Record<string, string> = {
    pink: "text-pink-400",
    blue: "text-blue-400",
    emerald: "text-emerald-400"
  };

  const recentColor = getScoreColor(scores.recent);
  const totalColor = getScoreColor(scores.total);

  if (compact) {
    return (
      <Card className={`bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-slate-800 backdrop-blur-sm hover:border-slate-700 transition-colors`}>
        <CardHeader className="pb-1 px-2 pt-2">
          <CardTitle className="text-xs font-semibold text-slate-200 flex items-center gap-1">
            <Icon className={`h-5 w-5 ${iconColorClasses[config.color] || "text-slate-400"}`} />
            <span className="truncate text-xs">{config.label}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 px-2 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-slate-500" />
              <span className="text-[10px] text-slate-400">Recent</span>
            </div>
            <div className={`px-1 py-0.5 rounded font-bold font-mono text-xs ${recentColor.text} ${recentColor.bg} border ${recentColor.border}`}>
              {scores.recent.toFixed(0)}%
            </div>
          </div>
          <div className="flex items-center justify-between pt-0.5 border-t border-slate-800/50">
            <div className="flex items-center gap-1">
              <History className="h-3 w-3 text-slate-500" />
              <span className="text-[10px] text-slate-400">Overall</span>
            </div>
            <div className={`px-1 py-0.5 rounded font-bold font-mono text-xs ${totalColor.text} ${totalColor.bg} border ${totalColor.border}`}>
              {scores.total.toFixed(0)}%
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-slate-800 backdrop-blur-sm hover:border-slate-700 transition-colors`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Icon className={`h-4 w-4 ${iconColorClasses[config.color] || "text-slate-400"}`} />
              {config.label}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 line-clamp-2">
              {config.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs text-slate-400">Recent</span>
            </div>
            <div className={`px-3 py-1 rounded-md font-bold font-mono text-lg ${recentColor.text} ${recentColor.bg} border ${recentColor.border}`}>
              {scores.recent.toFixed(0)}%
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800">
            <div className="flex items-center gap-2">
              <History className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs text-slate-400">Overall</span>
            </div>
            <div className={`px-3 py-1 rounded-md font-bold font-mono text-base ${totalColor.text} ${totalColor.bg} border ${totalColor.border}`}>
              {scores.total.toFixed(0)}%
            </div>
          </div>
        </div>
        <div className="pt-2 border-t border-slate-800/50">
          <div className="text-xs text-slate-500">
            Threshold: &lt;{config.maxL}ms latency, &lt;{config.maxJ}ms jitter
          </div>
        </div>
      </CardContent>
    </Card>
  );
}