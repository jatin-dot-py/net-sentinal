import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { generateUUID } from './utils';

export interface DataPoint {
  id: string;
  timestamp: number;
  latency: number;
  jitter: number;
  success: boolean;
}

export interface Session {
  id: string;
  startTime: string;
  endTime: string;
  data: DataPoint[];
  avgLatency: number;
  avgJitter: number;
}

interface NetworkStore {
  isRunning: boolean;
  activeSessionId: string | null;
  liveData: DataPoint[]; 
  history: Session[];    
  selectedSessionId: string | null; 

  setIsRunning: (status: boolean) => void;
  addDataPoint: (point: DataPoint) => void;
  clearHistory: () => void;
  selectSession: (id: string | null) => void;
}

export const useNetworkStore = create<NetworkStore>()(
  persist(
    (set, get) => ({
      isRunning: false,
      activeSessionId: null,
      liveData: [],
      history: [],
      selectedSessionId: null,

      setIsRunning: (status) => {
        const { isRunning, activeSessionId, liveData, history } = get();

        if (isRunning && !status && activeSessionId) {
          const validPoints = liveData.filter(d => d.success);
          const totalLat = validPoints.reduce((acc, curr) => acc + curr.latency, 0);
          const totalJit = validPoints.reduce((acc, curr) => acc + curr.jitter, 0);
          
          const newSession: Session = {
            id: activeSessionId,
            startTime: new Date(liveData[0]?.timestamp || Date.now()).toISOString(),
            endTime: new Date().toISOString(),
            data: [...liveData],
            avgLatency: validPoints.length ? Math.round(totalLat / validPoints.length) : 0,
            avgJitter: validPoints.length ? Math.round(totalJit / validPoints.length) : 0,
          };

          set({ 
            isRunning: false, 
            activeSessionId: null, 
            history: [newSession, ...history],
            liveData: [] 
          });
        } 
        
        else if (!isRunning && status) {
          set({ 
            isRunning: true, 
            activeSessionId: generateUUID(), 
            liveData: [],
            selectedSessionId: null 
          });
        }
      },

      addDataPoint: (point) => set((state) => ({ 
        liveData: [...state.liveData, point]
      })),

      clearHistory: () => set({ history: [] }),
      
      selectSession: (id) => set({ selectedSessionId: id, isRunning: false })
    }),
    {
      name: 'net-sentinel-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);