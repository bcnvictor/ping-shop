import { useState, useEffect, useCallback } from 'react';
import type { Log, LogsFilters } from '../types/logs.types';
import { logsService } from './logs';

interface UseLogsReturn {
  logs: Log[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  filters: LogsFilters;
  setFilters: (filters: LogsFilters) => void;
}

export const useLogs = (token?: string | null): UseLogsReturn => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LogsFilters>({
    type: 'all',
    searchQuery: '',
    dateRange: {
      start: null,
      end: null
    }
  });
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let fetchedLogs: Log[];
      
      const hasActiveFilters = 
        filters.type !== 'all' || 
        filters.searchQuery;
      
      if (hasActiveFilters) {
        fetchedLogs = await logsService.getFilteredLogs({
          type: filters.type !== 'all' ? filters.type : 'all',
          searchQuery: filters.searchQuery || undefined,
          startDate: filters.dateRange.start?.toISOString() || undefined,
          endDate: filters.dateRange.end?.toISOString() || undefined
        }, token);
      } else {
        fetchedLogs = await logsService.getAllLogs(token);
      }
      
      setLogs(fetchedLogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, token]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  return {
    logs,
    isLoading,
    error,
    refetch: fetchLogs,
    filters,
    setFilters
  };
};