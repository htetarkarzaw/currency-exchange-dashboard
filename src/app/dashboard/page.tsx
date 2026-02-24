'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RefreshCw, TrendingUp, TrendingDown, Coins, ArrowLeft, WifiOff, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';

const CACHE_KEY = 'currency-exchange-coins-cache';
const PAGE_SIZE = 10;

interface Coin {
  id: string;
  uuid: string;
  symbol: string;
  name: string;
  iconUrl?: string | null;
  price: string;
  change24h: string;
  marketCap: string;
  rank: number;
  fetchedAt: string;
}

interface Pagination {
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor: string | null;
  previousCursor: string | null;
  total: number | null;
}

function loadFromCache(): { coins: Coin[]; fetchedAt: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { coins, fetchedAt } = JSON.parse(raw);
    return Array.isArray(coins) ? { coins, fetchedAt } : null;
  } catch {
    return null;
  }
}

function saveToCache(coins: Coin[], fetchedAt: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ coins, fetchedAt }));
  } catch {
    // ignore quota errors
  }
}

export default function DashboardPage() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [allCoins, setAllCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastFetch, setLastFetch] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    tiers: [] as string[],
    tags: [] as string[],
    orderBy: 'marketCap',
    orderDirection: 'desc' as 'asc' | 'desc',
    timePeriod: '24h',
  });
  const router = useRouter();

  const TAGS_OPTIONS = ['defi', 'stablecoin', 'nft', 'dex', 'exchange', 'staking', 'dao', 'meme', 'privacy', 'metaverse', 'gaming', 'wrapped', 'layer-1', 'layer-2', 'web3', 'social'];

  const listTotalPages = pagination?.total ? Math.max(1, Math.ceil(pagination.total / PAGE_SIZE)) : 1;
  const apiUrl = '/api';

  const fetchPaginatedCoins = useCallback(async (cursor?: string | null, offset?: number, filterOverrides?: typeof filters) => {
    const f = filterOverrides ?? filters;
    try {
      setLoading(true);
      setError(null);
      setIsOffline(false);
      let url = `${apiUrl}/coins-paginated?limit=${PAGE_SIZE}`;
      if (cursor) {
        url += `&cursor=${encodeURIComponent(cursor)}`;
      } else {
        url += `&offset=${offset ?? 0}`;
      }
      if (f.tiers.length > 0) url += `&tiers=${f.tiers.join(',')}`;
      if (f.tags.length > 0) url += `&tags=${encodeURIComponent(f.tags.join(','))}`;
      if (f.orderBy) url += `&orderBy=${f.orderBy}`;
      if (f.orderDirection) url += `&orderDirection=${f.orderDirection}`;
      if (f.timePeriod) url += `&timePeriod=${f.timePeriod}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch coins');
      const data = await res.json();
      setCoins(data.coins ?? []);
      const pag = data.pagination ?? null;
      setPagination(pag);
      if (!cursor && offset === 0) setCurrentPage(1);
      if (data.coins?.length > 0 && data.coins[0].fetchedAt) {
        setLastFetch(data.coins[0].fetchedAt);
      }
    } catch (err) {
      const cached = loadFromCache();
      if (cached && cached.coins.length > 0) {
        setCoins(cached.coins.slice(0, PAGE_SIZE));
        setLastFetch(cached.fetchedAt);
        setIsOffline(true);
        setError(null);
        setPagination({
          limit: PAGE_SIZE,
          hasNextPage: cached.coins.length > PAGE_SIZE,
          hasPreviousPage: false,
          nextCursor: null,
          previousCursor: null,
          total: cached.coins.length,
        });
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setCoins([]);
        setPagination(null);
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchAllCoins = useCallback(async () => {
    try {
      setSearchLoading(true);
      setError(null);
      setIsOffline(false);
      const res = await fetch(`${apiUrl}/coins`);
      if (!res.ok) throw new Error('Failed to fetch coins');
      const data = await res.json();
      setAllCoins(data);
      if (data.length > 0 && data[0].fetchedAt) {
        saveToCache(data, data[0].fetchedAt);
      }
    } catch {
      const cached = loadFromCache();
      if (cached && cached.coins.length > 0) {
        setAllCoins(cached.coins);
      } else {
        setAllCoins([]);
      }
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const filteredCoins = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase().trim();
    return allCoins.filter(
      (c) =>
        c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [allCoins, search]);

  const searchTotalPages = Math.max(1, Math.ceil(filteredCoins.length / PAGE_SIZE));
  const [searchCurrentPage, setSearchCurrentPage] = useState(1);
  const paginatedSearchCoins = useMemo(() => {
    const start = (searchCurrentPage - 1) * PAGE_SIZE;
    return filteredCoins.slice(start, start + PAGE_SIZE);
  }, [filteredCoins, searchCurrentPage]);

  const displayCoins = search.trim() ? paginatedSearchCoins : coins;
  const isSearchMode = search.trim().length > 0;

  const goToNextPage = useCallback(() => {
    if (isSearchMode) {
      setSearchCurrentPage((p) => Math.min(searchTotalPages, p + 1));
    } else if (pagination?.nextCursor) {
      setCurrentPage((p) => p + 1);
      fetchPaginatedCoins(pagination.nextCursor);
    } else if (pagination?.hasNextPage) {
      setCurrentPage((p) => p + 1);
      fetchPaginatedCoins(null, coins.length);
    }
  }, [isSearchMode, pagination, searchTotalPages, fetchPaginatedCoins, coins.length]);

  const goToPrevPage = useCallback(() => {
    if (isSearchMode) {
      setSearchCurrentPage((p) => Math.max(1, p - 1));
    } else if (pagination?.previousCursor) {
      setCurrentPage((p) => Math.max(1, p - 1));
      fetchPaginatedCoins(pagination.previousCursor);
    }
  }, [isSearchMode, pagination, fetchPaginatedCoins]);

  const goToPage = useCallback((pageNum: number) => {
    if (isSearchMode) {
      setSearchCurrentPage(Math.max(1, Math.min(searchTotalPages, pageNum)));
    } else {
      const target = Math.max(1, Math.min(listTotalPages, pageNum));
      if (target === currentPage) return;
      setCurrentPage(target);
      fetchPaginatedCoins(null, (target - 1) * PAGE_SIZE);
    }
  }, [isSearchMode, searchTotalPages, listTotalPages, currentPage, fetchPaginatedCoins]);

  const triggerSync = async () => {
    try {
      setSyncing(true);
      const res = await fetch(`${apiUrl}/coins/sync`);
      if (!res.ok) throw new Error('Sync failed');
      await fetchAllCoins();
      await fetchPaginatedCoins(null, 0);
    } catch {
      await fetchPaginatedCoins(null, 0);
    } finally {
      setSyncing(false);
    }
  };

  const clearFilters = useCallback(() => {
    setFilters({
      tiers: [],
      tags: [],
      orderBy: 'marketCap',
      orderDirection: 'desc',
      timePeriod: '24h',
    });
    setShowFilters(false);
  }, []);

  useEffect(() => {
    fetchPaginatedCoins(null, 0);
  }, [fetchPaginatedCoins]);

  useEffect(() => {
    if (search.trim()) {
      fetchAllCoins();
    }
  }, [search, fetchAllCoins]);

  useEffect(() => {
    if (search.trim()) {
      setSearchCurrentPage(1);
    }
  }, [search]);

  const formatPrice = (price: string) => {
    const n = parseFloat(price);
    if (n >= 1) return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return n.toFixed(6);
  };

  const formatMarketCap = (cap: string) => {
    const n = parseFloat(cap);
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toLocaleString()}`;
  };

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2.5 rounded-sm glass hover:border-accent/40 transition-all duration-200 text-zinc-400 hover:text-accent"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-sm bg-accent/10 border border-accent/30">
                <Coins className="w-9 h-9 text-accent" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">
                  Currency Exchange
                </h1>
                <p className="text-sm text-zinc-500 mt-0.5">
                  {isOffline ? 'Offline · Cached data' : 'Live prices · Updates every 15 min'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {lastFetch && (
              <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
                {isOffline ? 'Cached' : 'Updated'} {new Date(lastFetch).toLocaleString()}
              </span>
            )}
            <button
              onClick={triggerSync}
              disabled={syncing}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-sm bg-accent text-black font-semibold hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Refresh'}
            </button>
          </div>
        </header>

        {/* Alerts */}
        {isOffline && (
          <div className="mb-6 p-4 rounded-sm glass border-accent/30 flex items-center gap-3 text-accent">
            <WifiOff className="w-5 h-5 shrink-0" />
            <span>You&apos;re offline. Showing cached data from your last visit.</span>
          </div>
        )}

        {error && !isOffline && (
          <div className="mb-6 p-4 rounded-sm glass border-red-500/40 text-red-400">
            {error}
          </div>
        )}

        {/* Search and filters - always visible */}
        <div className="mb-6 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <input
                    type="text"
                    placeholder="Search by symbol or name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="cyber-input w-full pr-24 py-3 min-w-0"
                  />
                  {search && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono pointer-events-none">
                      {filteredCoins.length} / {allCoins.length || '—'}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowFilters((s) => !s)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-sm border transition-all ${
                    showFilters || filters.tiers.length > 0 || filters.tags.length > 0 || filters.orderBy !== 'marketCap' || filters.orderDirection !== 'desc' || filters.timePeriod !== '24h'
                      ? 'bg-accent/20 border-accent/50 text-accent'
                      : 'glass hover:border-accent/40 text-zinc-400'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>

              {showFilters && (
                <div className="p-4 rounded-sm glass border border-accent/20 space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Tiers</label>
                      <div className="flex gap-2">
                        {['1', '2', '3'].map((t) => (
                          <label key={t} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.tiers.includes(t)}
                              onChange={(e) => {
                                setFilters((prev) => ({
                                  ...prev,
                                  tiers: e.target.checked ? [...prev.tiers, t] : prev.tiers.filter((x) => x !== t),
                                }));
                              }}
                              className="rounded border-accent/50 bg-black/40 text-accent focus:ring-accent"
                            />
                            <span className="text-sm text-zinc-300">Tier {t}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Order by</label>
                      <select
                        value={filters.orderBy}
                        onChange={(e) => setFilters((prev) => ({ ...prev, orderBy: e.target.value }))}
                        className="cyber-input py-2 px-3 text-sm min-w-[140px]"
                      >
                        <option value="marketCap">Market Cap</option>
                        <option value="price">Price</option>
                        <option value="24hVolume">24h Volume</option>
                        <option value="change">Change %</option>
                        <option value="listedAt">Listed At</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Direction</label>
                      <select
                        value={filters.orderDirection}
                        onChange={(e) => setFilters((prev) => ({ ...prev, orderDirection: e.target.value as 'asc' | 'desc' }))}
                        className="cyber-input py-2 px-3 text-sm min-w-[100px]"
                      >
                        <option value="desc">Desc</option>
                        <option value="asc">Asc</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Time period (change %)</label>
                      <select
                        value={filters.timePeriod}
                        onChange={(e) => setFilters((prev) => ({ ...prev, timePeriod: e.target.value }))}
                        className="cyber-input py-2 px-3 text-sm min-w-[100px]"
                      >
                        <option value="1h">1h</option>
                        <option value="3h">3h</option>
                        <option value="12h">12h</option>
                        <option value="24h">24h</option>
                        <option value="7d">7d</option>
                        <option value="30d">30d</option>
                        <option value="3m">3m</option>
                        <option value="1y">1y</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-3 py-2 rounded-sm border border-zinc-600 text-zinc-400 hover:border-red-500/50 hover:text-red-400 text-sm transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Clear
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {TAGS_OPTIONS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setFilters((prev) => ({
                              ...prev,
                              tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
                            }));
                          }}
                          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                            filters.tags.includes(tag)
                              ? 'bg-accent/30 border border-accent/50 text-accent'
                              : 'bg-zinc-800/60 border border-zinc-600/50 text-zinc-400 hover:border-accent/30'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

        {/* List area - only this part refreshes on load/filter/search */}
        <div className="glass-card overflow-hidden relative">
          {loading || (searchLoading && search.trim()) ? (
            <div className="flex flex-col items-center justify-center py-24">
              <RefreshCw className="w-10 h-10 text-accent animate-spin" />
              <p className="mt-4 text-sm text-zinc-500">Loading...</p>
            </div>
          ) : coins.length === 0 && !search.trim() ? (
            <div className="text-center py-24">
              <Coins className="w-14 h-14 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500 mb-2">No coins yet</p>
              <p className="text-zinc-600 text-sm">Click Refresh to sync from CoinRanking API</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-accent/30">
                      <th className="text-left py-4 px-6 text-xs font-semibold text-accent/90 uppercase tracking-wider">#</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-accent/90 uppercase tracking-wider">Coin</th>
                      <th className="text-right py-4 px-6 text-xs font-semibold text-accent/90 uppercase tracking-wider">Price</th>
                      <th className="text-right py-4 px-6 text-xs font-semibold text-accent/90 uppercase tracking-wider">{filters.timePeriod}</th>
                      <th className="text-right py-4 px-6 text-xs font-semibold text-accent/90 uppercase tracking-wider">Market Cap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isSearchMode && filteredCoins.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-zinc-500">
                          No coins match &quot;{search}&quot;
                        </td>
                      </tr>
                    ) : displayCoins.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-zinc-500">
                          No coins to display
                        </td>
                      </tr>
                    ) : (
                      displayCoins.map((coin) => {
                        const change = parseFloat(coin.change24h || '0');
                        const isPositive = change >= 0;
                        const coinId = coin.uuid || coin.id;
                        return (
                          <tr
                            key={coin.id}
                            onClick={() => router.push(`/dashboard/coin/${coinId}`)}
                            className="border-b border-accent/10 hover:bg-accent/5 transition-colors duration-150 cursor-pointer"
                          >
                            <td className="py-4 px-6 text-zinc-500 font-mono text-sm">{coin.rank}</td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                {coin.iconUrl ? (
                                  <img
                                    src={coin.iconUrl}
                                    alt={coin.symbol}
                                    className="w-8 h-8 rounded-full object-contain shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-accent">{coin.symbol.slice(0, 2)}</span>
                                  </div>
                                )}
                                <div>
                                  <span className="font-semibold text-zinc-100">{coin.symbol}</span>
                                  <span className="text-zinc-500 text-sm ml-2">{coin.name}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right font-mono text-[#55ead4]">${formatPrice(coin.price)}</td>
                            <td className="py-4 px-6 text-right">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-sm font-medium ${
                                  isPositive
                                    ? 'bg-[#55ead4]/20 text-[#55ead4] border border-[#55ead4]/30'
                                    : 'bg-[#c5003c]/20 text-[#c5003c] border border-[#c5003c]/40'
                                }`}
                              >
                                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {change.toFixed(2)}%
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right font-mono text-zinc-400 text-sm">{formatMarketCap(coin.marketCap)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination - UI-UX Pro Max */}
              {(isSearchMode ? filteredCoins.length > PAGE_SIZE : (pagination?.hasNextPage || pagination?.hasPreviousPage || listTotalPages > 1)) && (
                <div className="flex justify-center px-6 py-6 border-t border-accent/10">
                  <nav
                    className="inline-flex items-center gap-0.5 p-1 rounded-xl bg-black/40 backdrop-blur-sm border border-accent/20 shadow-[0_0_40px_-12px_rgba(243,230,0,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={goToPrevPage}
                      disabled={isSearchMode ? searchCurrentPage <= 1 : !pagination?.hasPreviousPage}
                      className="pagination-btn flex items-center justify-center w-10 h-10 rounded-lg text-accent/90 hover:bg-accent/10 hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-accent/90"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                    <div className="w-px h-6 bg-accent/20 mx-0.5" aria-hidden />
                    <button
                      onClick={() => goToPage(1)}
                      disabled={(isSearchMode ? searchCurrentPage : currentPage) === 1}
                      className="pagination-btn min-w-[2.5rem] h-10 px-3 rounded-lg text-xs font-semibold tracking-wide uppercase text-zinc-400 hover:bg-accent/10 hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-zinc-400 transition-colors"
                    >
                      First
                    </button>
                    {(() => {
                      const cur = isSearchMode ? searchCurrentPage : currentPage;
                      const total = isSearchMode ? searchTotalPages : listTotalPages;
                      const start = Math.max(1, cur - 2);
                      const end = Math.min(total, cur + 2);
                      const pages: number[] = [];
                      for (let i = start; i <= end; i++) pages.push(i);
                      return pages.map((p) => (
                        <button
                          key={p}
                          onClick={() => goToPage(p)}
                          className={`pagination-btn min-w-[2.5rem] h-10 rounded-lg font-mono text-sm font-semibold transition-all duration-300 ${
                            p === cur
                              ? 'bg-gradient-to-b from-accent to-accent/90 text-black shadow-[0_0_20px_-4px_rgba(243,230,0,0.5)] ring-1 ring-accent/50'
                              : 'text-zinc-400 hover:bg-white/5 hover:text-accent'
                          }`}
                        >
                          {p}
                        </button>
                      ));
                    })()}
                    <button
                      onClick={() => goToPage(isSearchMode ? searchTotalPages : listTotalPages)}
                      disabled={(isSearchMode ? searchCurrentPage : currentPage) === (isSearchMode ? searchTotalPages : listTotalPages)}
                      className="pagination-btn min-w-[2.5rem] h-10 px-3 rounded-lg text-xs font-semibold tracking-wide uppercase text-zinc-400 hover:bg-accent/10 hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-zinc-400 transition-colors"
                    >
                      Last
                    </button>
                    <div className="w-px h-6 bg-accent/20 mx-0.5" aria-hidden />
                    <button
                      onClick={goToNextPage}
                      disabled={isSearchMode ? searchCurrentPage >= searchTotalPages : !pagination?.hasNextPage}
                      className="pagination-btn flex items-center justify-center w-10 h-10 rounded-lg text-accent/90 hover:bg-accent/10 hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-accent/90"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
