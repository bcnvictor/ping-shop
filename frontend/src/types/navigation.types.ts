import type { UserRole } from "./auth.types";

export interface Tab {
  id: number;
  name: string;
  icon: string;
  minRole: UserRole; 
}


export type TabType = 'shop' | 'stocks' | 'stats' | 'logs';