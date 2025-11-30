"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Brush } from 'recharts';
import { useNetworkStore } from '../../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export function NetworkChart() {
  const { liveData, history, selectedSessionId, isRunning } = useNetworkStore();

  let displayData = [];
  let title = "Real-Time Telemetry";

  if (selectedSessionId) {
    const session = history.find(s => s.id === selectedSessionId);
    displayData = session ? session.data : [];
    title = `History Analysis: ${new Date(session?.startTime || "").toLocaleString()}`;
  } else {
    displayData = liveData.slice(-60);
    title = "Live Network Heartbeat";
  }

  return (
    <Card className="col-span-4 bg-slate-950 border-slate-800">
      <CardHeader>
        <CardTitle className="text-slate-200 flex justify-between items-center">
          {title}
          {!selectedSessionId && isRunning && <span className="text-xs text-emerald-500 animate-pulse">● LIVE</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(unix) => new Date(unix).toLocaleTimeString([], {minute:'2-digit', second:'2-digit'})}
              minTickGap={30}
              stroke="#475569"
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
              labelFormatter={(label) => new Date(label).toLocaleTimeString()}
            />
            <Line type="monotone" dataKey="latency" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="jitter" stroke="#a855f7" strokeWidth={2} dot={false} isAnimationActive={false} />
            
            {(selectedSessionId || displayData.length > 60) && (
              <Brush 
                dataKey="timestamp" 
                height={30} 
                stroke="#3b82f6"
                fill="#0f172a"
                tickFormatter={() => ""}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}