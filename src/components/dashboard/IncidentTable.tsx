"use client";

import { useState } from "react";
import { useNetworkStore } from "@/lib/store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, List, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

const getStatusBadge = (point: { s: boolean; l: number; j: number }) => {
  if (!point.s) {
    return (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-1.5">
        <AlertCircle className="h-3 w-3" />
        Connection Lost
      </Badge>
    );
  }
  
  if (point.l > 200) {
    return (
      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 flex items-center gap-1.5">
        <Clock className="h-3 w-3" />
        High Latency
      </Badge>
    );
  }
  
  if (point.j > 50) {
    return (
      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 flex items-center gap-1.5">
        <AlertCircle className="h-3 w-3" />
        High Jitter
      </Badge>
    );
  }
  
  return (
    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 flex items-center gap-1.5">
      <CheckCircle2 className="h-3 w-3" />
      Healthy
    </Badge>
  );
};

const getLatencyColor = (latency: number | undefined, success: boolean): string => {
  if (!success || latency === undefined) return "text-slate-600";
  if (latency < 50) return "text-emerald-400";
  if (latency < 100) return "text-blue-400";
  if (latency < 200) return "text-yellow-400";
  return "text-orange-400";
};

const getJitterColor = (jitter: number | undefined, success: boolean): string => {
  if (!success || jitter === undefined) return "text-slate-600";
  if (jitter < 15) return "text-emerald-400";
  if (jitter < 30) return "text-blue-400";
  if (jitter < 50) return "text-yellow-400";
  return "text-orange-400";
};

export function IncidentTable() {
  const { liveData, history, viewingSessionId, viewingRegion } = useNetworkStore();
  const [page, setPage] = useState(1);
  const pageSize = 15;

  let data = liveData[viewingRegion];
  if (viewingSessionId) {
    const s = history.find(x => x.id === viewingSessionId);
    if (s) data = s.regionData[viewingRegion];
  }

  const sorted = [...data].reverse();
  const totalPages = Math.ceil(sorted.length / pageSize);
  const pageData = sorted.slice((page - 1) * pageSize, page * pageSize);

  const successCount = data.filter(d => d.s).length;
  const failureCount = data.length - successCount;
  const highLatencyCount = data.filter(d => d.s && d.l > 200).length;
  const highJitterCount = data.filter(d => d.s && d.j > 50).length;

  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-slate-800 backdrop-blur-sm">
      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              <List className="h-4 w-4 text-slate-400" />
              Connection Logs
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Detailed history of network requests and their performance metrics
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold font-mono text-slate-200">{data.length}</div>
            <div className="text-[10px] text-slate-500">Total Records</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {data.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
              <div className="text-[10px] text-slate-500 mb-0.5">Success Rate</div>
              <div className="text-sm font-mono font-semibold text-emerald-400">
                {((successCount / data.length) * 100).toFixed(1)}%
              </div>
              <div className="text-[9px] text-slate-600 mt-0.5">{successCount} successful</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
              <div className="text-[10px] text-slate-500 mb-0.5">Failures</div>
              <div className="text-sm font-mono font-semibold text-red-400">
                {failureCount}
              </div>
              <div className="text-[9px] text-slate-600 mt-0.5">
                {failureCount > 0 ? `${((failureCount / data.length) * 100).toFixed(1)}%` : 'No issues'}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
              <div className="text-[10px] text-slate-500 mb-0.5">High Latency</div>
              <div className="text-sm font-mono font-semibold text-yellow-400">
                {highLatencyCount}
              </div>
              <div className="text-[9px] text-slate-600 mt-0.5">&gt;200ms</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
              <div className="text-[10px] text-slate-500 mb-0.5">High Jitter</div>
              <div className="text-sm font-mono font-semibold text-orange-400">
                {highJitterCount}
              </div>
              <div className="text-[9px] text-slate-600 mt-0.5">&gt;50ms</div>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-950/50">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-semibold">Timestamp</TableHead>
                  <TableHead className="text-slate-400 font-semibold">Latency</TableHead>
                  <TableHead className="text-slate-400 font-semibold">Jitter</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                      No connection data available
                    </TableCell>
                  </TableRow>
                ) : (
                  pageData.map((p) => (
                    <TableRow 
                      key={p.id} 
                      className="border-slate-800 hover:bg-slate-900/30 transition-colors"
                    >
                      <TableCell className="font-mono text-sm">
                        <div className="space-y-0.5">
                          <div className="text-slate-300">
                            {format(new Date(p.t), 'HH:mm:ss')}
                          </div>
                          <div className="text-xs text-slate-600">
                            {format(new Date(p.t), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-mono font-semibold ${getLatencyColor(p.l, p.s)}`}>
                          {p.s ? `${p.l} ms` : '--'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-mono font-semibold ${getJitterColor(p.j, p.s)}`}>
                          {p.s ? `${p.j} ms` : '--'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {getStatusBadge(p)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800/50">
            <div className="text-sm text-slate-400">
              Page {page} of {totalPages} • Showing {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, sorted.length)} of {sorted.length}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(curr => Math.max(1, curr - 1))} 
                disabled={page === 1}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(curr => Math.min(totalPages, curr + 1))} 
                disabled={page === totalPages}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}