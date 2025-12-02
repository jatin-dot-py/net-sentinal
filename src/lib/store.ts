import { create } from 'zustand';
import { generateShortID } from '@/lib/utils';

export interface DataPoint {
  id: string;
  t: number; 
  l: number; 
  j: number; 
  s: boolean;
}

export type RegionID = 'default' | 'mumbai' | 'washington' | 'stockholm';

export interface Session {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  regionData: Record<RegionID, DataPoint[]>;
}

interface NetworkStore {
  isRunning: boolean;
  activeSessionId: string | null;
  
  liveData: Record<RegionID, DataPoint[]>;
  
  history: Session[];
  
  viewingSessionId: string | null;
  viewingRegion: RegionID;

  setIsRunning: (status: boolean) => void;
  addRegionPoint: (region: RegionID, point: DataPoint) => void;
  setViewingRegion: (region: RegionID) => void;
  setViewingSession: (id: string | null) => void;
  clearHistory: () => void;
}

const INITIAL_DATA: Record<RegionID, DataPoint[]> = {
  default: [],
  mumbai: [],
  washington: [],
  stockholm: []
};

export const useNetworkStore = create<NetworkStore>((set, get) => ({
  isRunning: false,
  activeSessionId: null,
  liveData: INITIAL_DATA,
  history: [],
  viewingSessionId: null,
  viewingRegion: 'default',

  setIsRunning: (status) => {
    const { isRunning, activeSessionId, liveData, history } = get();

    if (isRunning && !status && activeSessionId) {
      const startTime = new Date(liveData.default[0]?.t || Date.now());
      const endTime = new Date();
      
      const newSession: Session = {
        id: activeSessionId,
        name: `Scan ${startTime.toLocaleTimeString()}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        regionData: { ...liveData }
      };

      set({ 
        isRunning: false, 
        activeSessionId: null, 
        history: [newSession, ...history],
        liveData: INITIAL_DATA 
      });
    } 
    else if (!isRunning && status) {
      set({ 
        isRunning: true, 
        activeSessionId: generateShortID(),
        liveData: INITIAL_DATA,
        viewingSessionId: null 
      });
    }
  },

  addRegionPoint: (region, point) => set((state) => ({
    liveData: {
      ...state.liveData,
      [region]: [...state.liveData[region], point]
    }
  })),

  setViewingRegion: (region) => set({ viewingRegion: region }),
  
  setViewingSession: (id) => set({ viewingSessionId: id }),

  clearHistory: () => set({ history: [] }),
}));