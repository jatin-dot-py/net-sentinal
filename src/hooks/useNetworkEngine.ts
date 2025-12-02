import { useEffect, useRef } from 'react';
import { useNetworkStore, type RegionID } from '@/lib/store';
import { generateShortID } from '@/lib/utils';

const TARGETS: { id: RegionID; url: string; name: string }[] = [
  { 
    id: 'default', 
    name: 'Local Edge', 
    url: "https://cdn.jsdelivr.net/npm/react@18.2.0/package.json" 
  },
  { 
    id: 'mumbai', 
    name: 'Mumbai', 
    url: "https://ping-asia.vercel.app/api/" 
  },
  { 
    id: 'washington', 
    name: 'Washington DC', 
    url: "https://ping-us.vercel.app/api/" 
  },
  { 
    id: 'stockholm', 
    name: 'Stockholm', 
    url: "https://ping-eu.vercel.app/api/" 
  }
];

async function measureLatency(url: string): Promise<{ latency: number; success: boolean }> {
  const uniqueUrl = `${url}?t=${Date.now()}`;
  const start = performance.now();
  
  let resolveMatch: (entry: PerformanceResourceTiming | null) => void;
  const matchPromise = new Promise<PerformanceResourceTiming | null>((resolve) => { resolveMatch = resolve; });

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntriesByName(uniqueUrl);
    if (entries.length > 0) {
      resolveMatch(entries[0] as PerformanceResourceTiming);
    }
  });
  
  observer.observe({ type: 'resource', buffered: true });

  try {
    await fetch(uniqueUrl, { cache: 'no-store', method: 'GET', mode: 'cors' });
  } catch (e) {
    observer.disconnect();
    return { latency: 0, success: false };
  }

  const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 500));
  
  const timingEntry = await Promise.race([matchPromise, timeoutPromise]);
  observer.disconnect();
  if (timingEntry) {
    if (timingEntry.requestStart > 0 && timingEntry.responseStart > 0) {
      return { 
        latency: Math.round(timingEntry.responseStart - timingEntry.requestStart), 
        success: true 
      };
    } 
    return { 
      latency: Math.round(timingEntry.duration), 
      success: true 
    };
  }

  const end = performance.now();
  return { 
    latency: Math.round(end - start), 
    success: true 
  };
}

export function useNetworkEngine() {
  const { isRunning, addRegionPoint } = useNetworkStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      TARGETS.forEach(async (target) => {
        const result = await measureLatency(target.url);

        const currentData = useNetworkStore.getState().liveData[target.id];
        const prev = currentData[currentData.length - 1];
        const jitter = (prev && result.success && prev.s) 
          ? Math.abs(result.latency - prev.l) 
          : 0;

        addRegionPoint(target.id, {
          id: generateShortID(),
          t: Date.now(),
          l: result.latency,
          j: jitter,
          s: result.success
        });
      });
    }, 1500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, addRegionPoint]);
}