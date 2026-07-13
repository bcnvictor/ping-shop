import { getRequest } from "./apiRequest";
import type { Log } from "../types/logs.types";

interface LogsApiResponse {
  logs: Array<{
    timestamp: string;
    message: string;
    type: string;
    userId?: string;
    projectId?: string;
    details?: string;
  }>;
}

export const logsService = {
  getAllLogs: async (token?: string | null): Promise<Log[]> => {
    const response = await getRequest<LogsApiResponse>('logs/app', token);
    console.log(response);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch logs');
    }

    return transformBackendLogs(response.data.logs);
  },

  getFilteredLogs: async (filters: {
    type?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
    searchQuery?: string;
  }, token?: string | null): Promise<Log[]> => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.searchQuery) params.append('search', filters.searchQuery);

    const endpoint = `logs/app${params.toString() ? '?' + params.toString() : ''}`;
    const response = await getRequest<LogsApiResponse>(endpoint, token);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch filtered logs');
    }

    return transformBackendLogs(response.data.logs);
  }
};

function transformBackendLogs(backendLogs: any[]): Log[] {
  return backendLogs.map((log, index) => {
    console.log(log);
    const parsed = parseLogMessage(log);    
    const logType = determineLogType(parsed);
    
    switch (logType) {
      case 'shop':
        console.log(parsed);
        return {
          id: `log-${index}-${Date.now()}`,
          type: 'shop',
          buyer: parsed.buyer || 'Unknown',
          seller: parsed.seller || 'scrooge.mcduck',
          cart: parsed.cart || parsed.details || '',
          time: formatTimestamp(log.timestamp)
        };
        
      case 'stock':
        return {
          id: `log-${index}-${Date.now()}`,
          type: 'stock',
          item: parsed.item || parsed.details || '',
          itemsSold: parsed.itemsSold || 0,
          stocksRemaining: parsed.stocksRemaining || 0,
          time: formatTimestamp(log.timestamp)
        };
        
      case 'restock':
        return {
          id: `log-${index}-${Date.now()}`,
          type: 'restock',
          item: parsed.item || parsed.details || '',
          itemsAdded: parsed.itemsAdded || 0,
          stocksRemaining: parsed.stocksRemaining || 0,
          time: formatTimestamp(log.timestamp)
        };
        
      case 'connection':
        return {
          id: `log-${index}-${Date.now()}`,
          type: 'connection',
          login: parsed.login || parsed.userId || 'Unknown',
          time: formatTimestamp(log.timestamp)
        };
      
      case 'create':
        return {
          id: `log-${index}-${Date.now()}`,
          type: 'create',
          item: parsed.item || '',
          time: formatTimestamp(log.timestamp)
        };
        
      default:
        return {
          id: `log-${index}-${Date.now()}`,
          type: 'backend',
          str: 'System',
          time: formatTimestamp(log.timestamp)
        };
    }
  });
}

function parseLogMessage(message: string): any {
  const result: any = {};
  

  const cleanMessage = message.replace(/\u001B\[[0-9;]*m/g, '');
  
  const patterns = {
    userId: /User\[([^\]]+)\]/,
    projectId: /Project\[([^\]]+)\]/,
    action: /- ([A-Z_]+) -/,
    login: /Login: ([^\s]+)/,
    auth: /Auth - Login: ([^\s]+) - (SUCCESS|FAILED)/,
    purchase: /PURCHASE - (.+)/,
    create: /STOCK - Created item: ([^,]+)/,
    stock: /STOCK - Item: ([^,]+), Sold: (\d+), Remaining: (\d+)/,
    restock: /RESTOCK - Item: ([^,]+), Added: (\d+), Remaining: (\d+)/
  };
  
  const userMatch = cleanMessage.match(patterns.userId);
  if (userMatch) result.userId = userMatch[1];
  
  const projectMatch = cleanMessage.match(patterns.projectId);
  if (projectMatch) result.projectId = projectMatch[1];
  
  const authMatch = cleanMessage.match(patterns.auth);
  if (authMatch) {
    result.login = authMatch[1];
    result.authSuccess = authMatch[2] === 'SUCCESS';
  }
  
  const purchaseMatch = cleanMessage.match(patterns.purchase);
  if (purchaseMatch) {
    const details = purchaseMatch[1];
    const buyerMatch = details.match(/Buyer: ([^,]+)/);
    const sellerMatch = details.match(/Seller: ([^,]+)/);
    const cartMatch = details.match(/Cart: (.+)/);
    
    if (buyerMatch) result.buyer = buyerMatch[1].trim();
    if (sellerMatch) result.seller = sellerMatch[1].trim();
    if (cartMatch) result.cart = cartMatch[1].trim();
  }
  
  const stockMatch = cleanMessage.match(patterns.stock);
  if (stockMatch) {
    result.item = stockMatch[1];
    result.itemsSold = parseInt(stockMatch[2]);
    result.stocksRemaining = parseInt(stockMatch[3]);
  }
  
  const restockMatch = cleanMessage.match(patterns.restock);
  if (restockMatch) {
    result.item = restockMatch[1];
    result.itemsAdded = parseInt(restockMatch[2]);
    result.stocksRemaining = parseInt(restockMatch[3]);
  }

  const createMatch = cleanMessage.match(patterns.create);
  if (createMatch) {
    result.item = createMatch[1];
  }
  
  result.details = cleanMessage;
  return result;
}

function determineLogType(parsed: any): 'shop' | 'stock' | 'restock' | 'connection' | 'backend' | 'create' {
  if (parsed.buyer && parsed.cart) return 'shop';
  if (parsed.itemsSold !== undefined) return 'stock';
  if (parsed.itemsAdded !== undefined) return 'restock';
  if (parsed.login || parsed.authSuccess !== undefined) return 'connection';
  if (parsed.item !== undefined) return 'create';
  
  const message = parsed.details.toLowerCase();
  if (message.includes('purchase') || message.includes('buy')) return 'shop';
  if (message.includes('stock') && !message.includes('restock')) return 'stock';
  if (message.includes('restock') || message.includes('added')) return 'restock';
  
  return 'backend';
}

function formatTimestamp(timestamp: string): string {
  return timestamp;
}