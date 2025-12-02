"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush, ReferenceLine } from 'recharts';
import { useNetworkStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, Clock } from 'lucide-react';
import { format } from 'date-fns';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const timestamp = new Date(label);
    const latency = payload.find((p: any) => p.dataKey === 'l')?.value;
    const jitter = payload.find((p: any) => p.dataKey === 'j')?.value;

    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
        <div className="text-xs text-slate-400 mb-2 font-mono">
          {format(timestamp, 'HH:mm:ss.SSS')}
        </div>
        <div className="space-y-1.5">
          {latency !== undefined && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-slate-200">
                <span className="text-slate-400">Latency:</span> <span className="font-mono font-semibold text-blue-400">{latency} ms</span>
              </span>
            </div>
          )}
          {jitter !== undefined && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-sm text-slate-200">
                <span className="text-slate-400">Jitter:</span> <span className="font-mono font-semibold text-purple-400">{jitter} ms</span>
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex items-center justify-center gap-6 pt-4 pb-2">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="text-sm text-slate-400">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function NetworkChart() {
  const { liveData, history, viewingSessionId, viewingRegion, isRunning } = useNetworkStore();

  let data = liveData[viewingRegion];
  let title = "Live Network Telemetry";
  let description = "Real-time latency and jitter measurements";
  const isLive = !viewingSessionId;

  if (viewingSessionId) {
    const session = history.find(s => s.id === viewingSessionId);
    if (session) {
      data = session.regionData[viewingRegion];
      title = `Historical Session: ${session.name}`;
      description = `Recorded from ${format(new Date(session.startTime), 'MMM d, HH:mm')} to ${format(new Date(session.endTime), 'MMM d, HH:mm')}`;
    }
  }

  const chartDataPoints = data.slice(-60);
  const fullDataLength = data.length;

  const validData = chartDataPoints.filter(d => d.s);
  const avgLatency = validData.length > 0 
    ? validData.reduce((sum, d) => sum + d.l, 0) / validData.length 
    : 0;
  const avgJitter = validData.length > 0 
    ? validData.reduce((sum, d) => sum + d.j, 0) / validData.length 
    : 0;

  const chartData = chartDataPoints.map(d => ({
    ...d,
    timestamp: format(new Date(d.t), 'HH:mm:ss')
  }));

  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-slate-800 backdrop-blur-sm">
      <CardHeader className="pb-2 px-3 pt-3">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              {title}
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {description}
            </CardDescription>
          </div>
          {isLive && isRunning && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-medium text-emerald-400">LIVE</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              
              {avgLatency > 0 && (
                <ReferenceLine 
                  y={avgLatency} 
                  stroke="#3b82f6" 
                  strokeDasharray="5 5" 
                  strokeOpacity={0.5}
                  label={{ value: `Avg: ${Math.round(avgLatency)}ms`, position: "right", fill: "#64748b", fontSize: 11 }}
                />
              )}
              {avgJitter > 0 && (
                <ReferenceLine 
                  y={avgJitter} 
                  stroke="#a855f7" 
                  strokeDasharray="5 5" 
                  strokeOpacity={0.5}
                  label={{ value: `Avg: ${Math.round(avgJitter)}ms`, position: "right", fill: "#64748b", fontSize: 11 }}
                />
              )}

              <XAxis 
                dataKey="t" 
                tickFormatter={(t) => format(new Date(t), 'HH:mm:ss')}
                stroke="#64748b"
                fontSize={11}
                tick={{ fill: '#94a3b8' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#64748b"
                fontSize={11}
                tick={{ fill: '#94a3b8' }}
                label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 12 }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              
              <Line 
                type="monotone" 
                dataKey="l" 
                name="Latency"
                stroke="#3b82f6" 
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 4, fill: '#3b82f6' }}
              />
              <Line 
                type="monotone" 
                dataKey="j" 
                name="Jitter"
                stroke="#a855f7" 
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
                activeDot={{ r: 4, fill: '#a855f7' }}
              />
              
              {viewingSessionId && (
                <Brush 
                  dataKey="t" 
                  height={30} 
                  stroke="#3b82f6" 
                  fill="#1e293b"
                  tickFormatter={(t) => format(new Date(t), 'HH:mm')}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {chartDataPoints.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800/50 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-0.5">Displayed</div>
              <div className="text-base font-mono font-semibold text-slate-200">
                {chartDataPoints.length}{fullDataLength > 60 && ` / ${fullDataLength}`}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-0.5">Success Rate</div>
              <div className="text-base font-mono font-semibold text-emerald-400">
                {((validData.length / chartDataPoints.length) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-0.5">Avg Latency</div>
              <div className="text-base font-mono font-semibold text-blue-400">{Math.round(avgLatency)} ms</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-0.5">Avg Jitter</div>
              <div className="text-base font-mono font-semibold text-purple-400">{Math.round(avgJitter)} ms</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}