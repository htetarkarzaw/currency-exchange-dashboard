'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw, ExternalLink } from 'lucide-react';

interface Coin {
  id: string;
  uuid: string;
  symbol: string;
  name: string;
  description?: string | null;
  color?: string | null;
  iconUrl?: string | null;
  websiteUrl?: string | null;
  price: string;
  btcPrice?: string | null;
  priceAt?: number | null;
  change24h: string;
  marketCap: string;
  volume24h?: string | null;
  fullyDilutedMarketCap?: string | null;
  rank: number;
  numberOfMarkets?: number | null;
  numberOfExchanges?: number | null;
  allTimeHigh?: { price: string; timestamp: number } | null;
  tags?: string[];
  links?: { name: string; url: string; type: string }[];
  supply?: { circulating?: string; total?: string; max?: string; confirmed?: boolean } | null;
  coinrankingUrl?: string | null;
  tier?: number | null;
  listedAt?: number | null;
  lowVolume?: boolean;
  notices?: { type: string; value: string }[];
  contractAddresses?: string[];
  sparkline?: string[] | null;
  isWrappedTrustless?: boolean;
  wrappedTo?: string | null;
  fetchedAt: string;
}

interface PricePoint {
  price: string;
  timestamp: number;
}

export default function CoinDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;

  const [coin, setCoin] = useState<Coin | null>(null);
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(false);
  const [timePeriod, setTimePeriod] = useState('7d');

  const apiBase = '/api';

  useEffect(() => {
    if (!uuid) return;
    fetch(`${apiBase}/coin/${uuid}`)
      .then((res) => {
        if (!res.ok) throw new Error('Coin not found');
        return res.json();
      })
      .then((data) => setCoin(data))
      .catch(() => router.push('/dashboard'))
      .finally(() => setLoading(false));
  }, [uuid, router]);

  useEffect(() => {
    if (!uuid) return;
    setHistoryLoading(true);
    setHistoryError(false);
    fetch(`${apiBase}/coin/${uuid}/history?timePeriod=${timePeriod}`)
      .then((res) => {
        if (!res.ok) throw new Error('History API failed');
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.history)) {
          setHistory(data.history);
          setHistoryError(false);
        } else {
          throw new Error('Invalid history data');
        }
      })
      .catch(() => {
        setHistoryError(true);
        setHistory([]);
      })
      .finally(() => setHistoryLoading(false));
  }, [uuid, timePeriod]);

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

  const formatVolume = (vol: string) => {
    const n = parseFloat(vol);
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toLocaleString()}`;
  };

  const formatSupply = (s: string) => {
    const n = parseFloat(s);
    if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    return n.toLocaleString();
  };

  if (loading || !coin) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-accent/50 border-t-accent rounded-full animate-spin" />
      </main>
    );
  }

  const change = parseFloat(coin.change24h || '0');
  const isPositive = change >= 0;

  const chartData = history
    .map((p) => ({ ...p, priceNum: parseFloat(p.price) }))
    .filter((p) => !isNaN(p.priceNum));
  const minPrice = chartData.length ? Math.min(...chartData.map((p) => p.priceNum)) : 0;
  const maxPrice = chartData.length ? Math.max(...chartData.map((p) => p.priceNum)) : 1;
  const range = maxPrice - minPrice || 1;
  const chartWidth = 600;
  const chartHeight = 220;
  const padding = { top: 15, right: 15, bottom: 15, left: 15 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const points = chartData.map((p, i) => {
    const x = padding.left + (chartData.length > 1 ? (i / (chartData.length - 1)) * innerWidth : innerWidth / 2);
    const y = padding.top + innerHeight - ((p.priceNum - minPrice) / range) * innerHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <main className="min-h-screen overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 w-full min-w-0">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-accent mb-6 sm:mb-8 transition-colors min-h-[44px] items-center"
          aria-label="Back to list"
        >
          <ArrowLeft className="w-5 h-5 shrink-0" />
          Back to list
        </Link>

        {/* Coin header - responsive */}
        <div className="glass-card p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-row items-start sm:items-center gap-3 sm:gap-4 min-w-0">
              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                {coin.iconUrl ? (
                  <img
                    src={coin.iconUrl}
                    alt={coin.symbol}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-contain bg-black/40 p-1 shrink-0"
                    style={coin.color ? { borderColor: coin.color, borderWidth: 2, borderStyle: 'solid' } : undefined}
                  />
                ) : (
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0"
                    style={coin.color ? { borderColor: coin.color } : undefined}
                  >
                    <span className="text-xl sm:text-2xl font-bold text-accent">{coin.symbol.slice(0, 2)}</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-100 break-words">
                      {coin.name} ({coin.symbol})
                    </h1>
                    {coin.lowVolume && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                        Low Volume
                      </span>
                    )}
                    {coin.tier != null && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-700/50 text-zinc-400 shrink-0">
                        Tier {coin.tier}
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-500 mt-1 text-sm sm:text-base">Rank #{coin.rank}</p>
                  {coin.listedAt != null && (
                    <p className="text-zinc-600 text-xs sm:text-sm mt-0.5">
                      Listed {new Date(coin.listedAt * 1000).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {coin.sparkline && coin.sparkline.length > 1 && (() => {
              const values = coin.sparkline.map((p) => parseFloat(p));
              const min = Math.min(...values);
              const max = Math.max(...values);
              const range = max - min || 1;
              const points = values.map((v, i) => `${i},${40 - ((v - min) / range) * 38}`).join(' ');
              return (
                <div className="w-full min-w-0">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">24h Sparkline</p>
                  <div className="h-10 sm:h-12 w-full max-w-full">
                    <svg viewBox={`0 0 ${coin.sparkline!.length} 40`} className="w-full h-full" preserveAspectRatio="none">
                      <polyline
                        fill="none"
                        stroke={coin.color || '#55ead4'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                      />
                    </svg>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Stats grid - responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="glass-card p-4 sm:p-6 col-span-2 sm:col-span-1">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1 sm:mb-2">Price (USD)</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-mono text-[#55ead4] truncate" title={`$${formatPrice(coin.price)}`}>
              ${formatPrice(coin.price)}
            </p>
            {coin.priceAt && (
              <p className="text-xs text-zinc-600 mt-1 truncate">As of {new Date(coin.priceAt * 1000).toLocaleString()}</p>
            )}
          </div>
          {coin.btcPrice && parseFloat(coin.btcPrice) !== 1 && (
            <div className="glass-card p-4 sm:p-6">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1 sm:mb-2">Price (BTC)</p>
              <p className="text-base sm:text-lg font-mono text-zinc-100 truncate">{parseFloat(coin.btcPrice).toFixed(8)} BTC</p>
            </div>
          )}
          <div className="glass-card p-4 sm:p-6">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1 sm:mb-2">24h Change</p>
            <p className={`text-lg sm:text-xl lg:text-2xl font-mono flex items-center gap-2 min-w-0 ${isPositive ? 'text-[#55ead4]' : 'text-[#c5003c]'}`}>
              {isPositive ? <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" /> : <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />}
              <span className="truncate">{change.toFixed(2)}%</span>
            </p>
          </div>
          <div className="glass-card p-4 sm:p-6">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1 sm:mb-2">Market Cap</p>
            <p className="text-base sm:text-lg font-mono text-zinc-100 truncate">{formatMarketCap(coin.marketCap)}</p>
          </div>
          <div className="glass-card p-4 sm:p-6">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1 sm:mb-2">24h Volume</p>
            <p className="text-base sm:text-lg font-mono text-zinc-100 truncate">
              {coin.volume24h ? formatVolume(coin.volume24h) : '—'}
            </p>
          </div>
          {coin.fullyDilutedMarketCap && parseFloat(coin.fullyDilutedMarketCap) > 0 && (
            <div className="glass-card p-4 sm:p-6">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1 sm:mb-2">Fully Diluted MCap</p>
              <p className="text-base sm:text-lg font-mono text-zinc-100 truncate">{formatMarketCap(coin.fullyDilutedMarketCap)}</p>
            </div>
          )}
        </div>

        {/* Supply - from CoinRanking API */}
        {coin.supply && (coin.supply.circulating || coin.supply.total || coin.supply.max) && (
          <div className="glass-card p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-sm font-semibold text-accent uppercase tracking-wider mb-3 sm:mb-4">Supply</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {coin.supply.circulating && (
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Circulating</p>
                  <p className="text-lg font-mono text-zinc-100">{formatSupply(coin.supply.circulating)}</p>
                </div>
              )}
              {coin.supply.total && (
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Total</p>
                  <p className="text-lg font-mono text-zinc-100">{formatSupply(coin.supply.total)}</p>
                </div>
              )}
              {coin.supply.max && (
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Max</p>
                  <p className="text-lg font-mono text-zinc-100">{formatSupply(coin.supply.max)}</p>
                </div>
              )}
            </div>
            {coin.supply.confirmed === false && (
              <p className="text-amber-400/80 text-sm mt-3">Supply not confirmed</p>
            )}
          </div>
        )}

        {/* Wrapped info */}
        {(coin.isWrappedTrustless || coin.wrappedTo) && (
          <div className="glass-card p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-sm font-semibold text-accent uppercase tracking-wider mb-2">Wrapped Asset</h2>
            <p className="text-zinc-400 text-sm">
              {coin.isWrappedTrustless ? 'Trustless wrapped asset' : 'Wrapped asset'}
              {coin.wrappedTo && ` · Wrapped to: ${coin.wrappedTo}`}
            </p>
          </div>
        )}

        {/* Notices */}
        {coin.notices && coin.notices.length > 0 && (
          <div className="glass-card p-4 sm:p-6 mb-6 sm:mb-8 border-amber-500/30">
            <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">Notices</h2>
            <ul className="space-y-2">
              {coin.notices.map((n, i) => (
                <li key={i} className="text-zinc-400 text-sm">
                  <span className="text-amber-400 font-medium">{n.type}:</span> {n.value}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Additional info - from CoinRanking API */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {coin.allTimeHigh && (
            <div className="glass-card p-4 sm:p-6">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">All-Time High</p>
              <p className="text-xl font-mono text-accent">${formatPrice(coin.allTimeHigh.price)}</p>
              <p className="text-sm text-zinc-500 mt-1">
                {new Date(coin.allTimeHigh.timestamp * 1000).toLocaleDateString()}
              </p>
            </div>
          )}
          {(coin.numberOfMarkets != null || coin.numberOfExchanges != null) && (
            <div className="glass-card p-4 sm:p-6">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Markets & Exchanges</p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {coin.numberOfMarkets != null && (
                  <div>
                    <p className="text-lg font-mono text-zinc-100">{coin.numberOfMarkets.toLocaleString()}</p>
                    <p className="text-xs text-zinc-500">Markets</p>
                  </div>
                )}
                {coin.numberOfExchanges != null && (
                  <div>
                    <p className="text-lg font-mono text-zinc-100">{coin.numberOfExchanges.toLocaleString()}</p>
                    <p className="text-xs text-zinc-500">Exchanges</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {coin.description && (
          <div className="glass-card p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">About</h2>
            <p className="text-zinc-400 leading-relaxed break-words">{coin.description}</p>
          </div>
        )}

        {(coin.websiteUrl || (coin.links && coin.links.length > 0)) && (
          <div className="glass-card p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Links</h2>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {coin.websiteUrl && (
                <a
                  href={coin.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-sm bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-colors text-sm min-h-[44px]"
                >
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  Website
                </a>
              )}
              {coin.coinrankingUrl && (
                <a
                  href={coin.coinrankingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-sm bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-colors text-sm min-h-[44px]"
                >
                  <ExternalLink className="w-4 h-4" />
                  CoinRanking
                </a>
              )}
              {coin.links?.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-sm bg-white/5 border border-accent/20 text-zinc-400 hover:text-accent hover:border-accent/30 transition-colors text-sm capitalize min-h-[44px]"
                >
                  <ExternalLink className="w-4 h-4" />
                  {link.name || link.type}
                </a>
              ))}
            </div>
          </div>
        )}

        {coin.tags && coin.tags.length > 0 && (
          <div className="glass-card p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {coin.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-sm bg-accent/10 border border-accent/20 text-accent text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contract addresses */}
        {coin.contractAddresses && coin.contractAddresses.length > 0 && (
          <div className="glass-card p-4 sm:p-6 mb-6 sm:mb-8 overflow-hidden">
            <h2 className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Contract Addresses</h2>
            <div className="space-y-2">
              {coin.contractAddresses.map((addr, i) => {
                const [chain, address] = addr.includes('/') ? addr.split('/') : ['', addr];
                const chainLower = chain?.toLowerCase() ?? '';
                const explorerUrl = chainLower.includes('ethereum')
                  ? `https://etherscan.io/address/${address}`
                  : chainLower.includes('bsc')
                    ? `https://bscscan.com/address/${address}`
                    : chainLower.includes('polygon')
                      ? `https://polygonscan.com/address/${address}`
                      : chainLower.includes('arbitrum')
                        ? `https://arbiscan.io/address/${address}`
                        : chainLower.includes('avalanche')
                          ? `https://snowtrace.io/address/${address}`
                          : null;
                return (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-sm bg-black/30 border border-accent/10 min-w-0">
                    {chain && (
                      <span className="text-xs font-medium text-accent shrink-0 capitalize">{chain}</span>
                    )}
                    <code className="text-xs sm:text-sm font-mono text-zinc-400 break-all flex-1 min-w-0 overflow-hidden">{address}</code>
                    {explorerUrl && (
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-accent hover:underline text-sm shrink-0 min-h-[44px] items-center"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Explorer
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Price history - from CoinRanking price-history API */}
        <div className="glass-card p-4 sm:p-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-accent uppercase tracking-wider">
              Price History
            </h2>
            <div className="flex gap-2 flex-wrap">
              {['24h', '7d', '30d'].map((p) => (
                <button
                  key={p}
                  onClick={() => setTimePeriod(p)}
                  className={`min-h-[44px] min-w-[44px] px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
                    timePeriod === p
                      ? 'bg-accent text-black'
                      : 'bg-white/10 text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {historyLoading ? (
            <div className="h-48 sm:h-56 lg:h-64 flex items-center justify-center border border-accent/20 rounded-sm">
              <RefreshCw className="w-8 h-8 sm:w-10 sm:h-10 text-accent animate-spin" />
            </div>
          ) : historyError ? (
            <div className="h-48 sm:h-56 lg:h-64 flex flex-col items-center justify-center gap-3 border border-accent/20 rounded-sm bg-black/20 p-4">
              <p className="text-zinc-500 text-center text-sm sm:text-base">Price history unavailable</p>
              <p className="text-xs sm:text-sm text-zinc-600 text-center">Chart data could not be loaded</p>
            </div>
          ) : chartData.length > 0 ? (
            <div className="border border-accent/20 rounded-sm p-3 sm:p-4 bg-black/40 overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full min-h-[180px] sm:min-h-[220px] lg:min-h-[256px]"
                preserveAspectRatio="xMidYMid slice"
              >
                <polyline
                  fill="none"
                  stroke="#55ead4"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />
              </svg>
              <div className="flex flex-col sm:flex-row justify-between gap-1 mt-3 text-xs sm:text-sm text-zinc-500 font-mono">
                <span className="truncate">{new Date(chartData[0]?.timestamp * 1000).toLocaleString()}</span>
                <span className="truncate">{new Date(chartData[chartData.length - 1]?.timestamp * 1000).toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="h-48 sm:h-56 lg:h-64 flex items-center justify-center border border-accent/20 rounded-sm text-zinc-500 text-sm sm:text-base">
              No price history available
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
