export type LogType = 'shop' | 'stock' | 'restock' | 'connection' | 'backend' | 'create';

export interface ShopLog {
  id: string;
  type: 'shop';
  buyer: string;
  seller: string;
  cart: string;
  time: string;
}

export interface StockLog {
  id: string;
  type: 'stock';
  item: string;
  itemsSold: number;
  stocksRemaining: number;
  time: string;
}

export interface RestockLog {
  id: string;
  type: 'restock';
  item: string;
  itemsAdded: number;
  stocksRemaining: number;
  time: string;
}

export interface ConnectionLog {
  id: string;
  type: 'connection';
  login: string;
  time: string;
}

export interface BackendLog {
  id: string;
  type: 'backend';
  str: string;
  time: string;
}

export interface CreateLog {
  id: string;
  type: 'create';
  item: string;
  time: string;
}

export type Log = ShopLog | StockLog | RestockLog | ConnectionLog | BackendLog | CreateLog;

export interface LogsFilters {
  type: LogType | 'all';
  searchQuery: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}