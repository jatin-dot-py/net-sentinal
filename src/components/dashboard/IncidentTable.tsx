"use client";

import { useState } from "react";
import { useNetworkStore } from "../../lib/store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function IncidentTable() {
  const { liveData, history, selectedSessionId } = useNetworkStore();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  let dataset = selectedSessionId 
    ? (history.find(s => s.id === selectedSessionId)?.data || []) 
    : liveData;

  const sortedData = [...dataset].reverse();

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="rounded-md border border-slate-800 bg-slate-950 mt-8">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-200">
          {selectedSessionId ? "Session Logs" : "Live Telemetry Feed"}
        </h3>
        <span className="text-xs text-slate-500">
          Total Records: {dataset.length}
        </span>
      </div>

      <Table>
        <TableHeader className="bg-slate-900">
          <TableRow className="border-slate-800 hover:bg-slate-900">
            <TableHead className="text-slate-400">Time</TableHead>
            <TableHead className="text-slate-400">Latency</TableHead>
            <TableHead className="text-slate-400">Jitter</TableHead>
            <TableHead className="text-slate-400">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((point) => (
            <TableRow key={point.id} className="border-slate-800 hover:bg-slate-900/50">
              <TableCell className="font-mono text-slate-400">
                {new Date(point.timestamp).toLocaleTimeString()}
              </TableCell>
              <TableCell className="font-mono text-blue-400">
                {point.success ? `${point.latency}ms` : '-'}
              </TableCell>
              <TableCell className="font-mono text-purple-400">
                {point.success ? `${point.jitter}ms` : '-'}
              </TableCell>
              <TableCell>
                {!point.success ? (
                  <Badge variant="destructive">Packet Loss</Badge>
                ) : point.latency > 150 ? (
                  <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/50">High Latency</Badge>
                ) : (
                  <Badge variant="outline" className="text-emerald-500 border-emerald-500/20">Stable</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 p-4 border-t border-slate-800">
          <span className="text-xs text-slate-500 mr-2">Page {page} of {totalPages}</span>
          <Button 
            variant="outline" size="sm" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" size="sm" 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}