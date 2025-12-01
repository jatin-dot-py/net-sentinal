import { useEffect, useRef } from 'react';
import { useNetworkStore } from '../lib/store';
import { generateUUID } from '../lib/utils';

const TARGET_URL = "https://ping-asia.vercel.app/api/";

export function useNetworkEngine() {
  const { isRunning, addDataPoint } = useNetworkStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(async () => {
      let success = false;
      let latency = 0;
      
      const uniqueUrl = `${TARGET_URL}?t=${Date.now()}`;
      
      const start = performance.now();

      try {
        await fetch(uniqueUrl, { 
          cache: 'no-store',
          method: 'HEAD'
        });
        
        const end = performance.now();
        
        const resources = performance.getEntriesByName(uniqueUrl);
        
        if (resources.length > 0) {
          const timing = resources[0] as PerformanceResourceTiming;
          
          // "responseStart" is when the first byte arrived.
          // "requestStart" is when the browser finished the SSL handshake and sent the request.
          // The difference is pure Network Latency (Time on Wire).
          // Note: If requestStart is 0 (browser quirk), fall back to Total Duration.
          if (timing.requestStart > 0) {
             latency = Math.round(timing.responseStart - timing.requestStart);
          } else {
             latency = Math.round(timing.duration);
          }
          
          performance.clearResourceTimings();
        } else {
          latency = Math.round(end - start);
        }

        latency = Math.max(1, latency);
        success = true;

      } catch (e) {
        success = false;
        latency = 0;
      }

      const currentHistory = useNetworkStore.getState().liveData;
      const prev = currentHistory[currentHistory.length - 1];

      const jitter = (prev && success && prev.success) 
        ? Math.abs(latency - prev.latency) 
        : 0;

      addDataPoint({
        id: generateUUID(),
        timestamp: Date.now(),
        latency,
        jitter,
        success
      });

    }, 1000); 

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, addDataPoint]);
}