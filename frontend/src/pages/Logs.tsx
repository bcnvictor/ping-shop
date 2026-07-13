import React, {useMemo} from "react";
import { LogsFilter } from "../components/logs/LogFilters";
import { LogsTable } from "../components/logs/LogTable";
import { useLogs } from "../utils/useLogs";
import type { Log } from "../types/logs.types";

export const Logs: React.FC = () => {
  const token = localStorage.getItem('token');
  const { logs, isLoading, error, refetch, filters, setFilters } = useLogs(token);

  

  const getSearchContent = (log: Log): string => {
    const parts: string[] = [log.type];

    switch (log.type) {
      case 'shop':
        parts.push(log.buyer, log.seller, log.cart);
        break;
      case 'stock':
        parts.push(log.item, String(log.itemsSold), String(log.stocksRemaining));
        break;
      case 'restock':
        parts.push(log.item, String(log.itemsAdded), String(log.stocksRemaining));
        break;
      case 'create':
        parts.push(log.item);
        break;
      case 'connection':
        parts.push(log.login);
        break;
      case 'backend':
        parts.push(log.str);
    }

    return parts.filter(Boolean).join(' ').toLowerCase();
  }

  const displayedLogs = useMemo(() => {
    let res = [...logs];
    if (filters.type != 'all') {
      res = res.filter(log => log.type == filters.type);
    }

    if (filters.type === 'all') {
      res = logs.filter(log => log.type !== 'backend');
    }

    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const lowerSearch = filters.searchQuery.toLowerCase().trim();
      console.log(lowerSearch);

      res = res.filter(log => {
        const searched = getSearchContent(log);
        return searched.includes(lowerSearch);
      })
    }

    return res.reverse();
  }, [logs, filters.type, filters.searchQuery]);

  const stats = useMemo(() => ({
    displayed: displayedLogs.length,
    shop: logs.filter(l => l.type === 'shop').length,
    stock: logs.filter(l => l.type === 'stock' || l.type === 'restock' || l.type === 'create').length,
    connection: logs.filter(l => l.type === 'connection').length,
    backend: logs.filter(l => l.type === 'backend').length,
    total: logs.length
  }), [logs, displayedLogs]);

  const hasSearch = filters.searchQuery && filters.searchQuery.trim() !== '';

  return (
    <main className="logs-page">
      <div className="logs-container">
        <div className="logs-header-section">
          <div className="logs-title-row">
            <button 
              onClick={refetch} 
              className="refresh-button"
              disabled={isLoading}
            >
              🔄 Reload
            </button>
          </div>
          
          <div className="logs-stats">
            <div className="stat-card">
              <span className="stat-value">{stats.displayed}</span>
              <span className="stat-label">Displayed Logs</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.shop}</span>
              <span className="stat-label">Purchases</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.stock}</span>
              <span className="stat-label">Stock/restock</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.connection}</span>
              <span className="stat-label">Connections</span>
            </div>
          </div>

          <LogsFilter filters={filters} onFiltersChange={setFilters} />
          {hasSearch && (
            <div className="search-result-info">
              <span className="search-icon">🔍</span>
              <span>
                {displayedLogs.length > 0
                ? `${displayedLogs.length} result${displayedLogs.length > 1 ? 's' : ''}`
                  : `No result for "${filters.searchQuery}"`
                }
              </span>
              {displayedLogs.length === 0 && (
                <button 
                  className="clear-search-button"
                  onClick={() => setFilters({ ...filters, searchQuery: '' })}
                >
                  Clear search
                </button>
              )}
            </div>
          )}
          {filters.type === 'all' && stats.backend > 0 && (
            <div className="info-message">
              <span className="info-icon">ℹ️</span>
              <span>Backend logs are filtered. Select "backend" to show them.</span>
            </div>
          )}
        </div>
        
        <div className="logs-scroll-container">
          {error ? (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <p>Erreur : {error}</p>
              <button onClick={refetch} className="retry-button">
                Retry
              </button>
            </div>
          ) : isLoading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Loading logs...</p>
            </div>
          ) : (
            <LogsTable logs={displayedLogs} />
          )}
        </div>
      </div>
    </main>
  );
};