import Link from 'next/link';
import { Coins, TrendingUp, Shield, Zap, ArrowRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* CP2077 ambient orbs - yellow & cyan */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#55ead4]/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
        
        <div className="relative max-w-6xl mx-auto px-6 md:px-12 pt-20 pb-24">
          <div className="max-w-4xl">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-sm glass mb-10 animate-fade-in"
              style={{ animationDelay: '0.1s' }}
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Live market data</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
              <span className="text-zinc-100">Track crypto</span>
              <br />
              <span className="text-gradient">in real time</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl leading-relaxed animate-slide-up opacity-0" style={{ animationDelay: '0.2s' }}>
              Monitor top cryptocurrencies, market caps, and 24h changes. 
              Data synced every 15 minutes. Works offline.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up opacity-0" style={{ animationDelay: '0.3s' }}>
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-sm bg-accent text-black font-semibold text-lg transition-all duration-300 hover:shadow-glow hover:scale-[1.02]"
              >
                Open Dashboard
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-sm glass text-zinc-300 font-medium hover:border-accent/40 transition-all duration-300"
              >
                <Coins className="w-5 h-5 text-accent" />
                View Prices
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Zap,
                title: 'Fast & reliable',
                desc: 'Data stored in your database. No rate limits, no delays.',
              },
              {
                icon: TrendingUp,
                title: 'Market insights',
                desc: 'Prices, 24h change, and market cap for top coins.',
              },
              {
                icon: Shield,
                title: 'Offline mode',
                desc: 'Cached in your browser. View prices even when you\'re offline.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group glass-card p-8 hover:border-accent/40 transition-all duration-300 hover:shadow-glow-sm"
              >
                <div className="p-3 rounded-sm bg-accent/10 border border-accent/20 w-fit mb-6 group-hover:bg-accent/20 transition-colors">
                  <Icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-semibold text-xl text-zinc-100 mb-3">{title}</h3>
                <p className="text-zinc-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="relative overflow-hidden rounded-sm p-12 md:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-cyan-400/5" />
            <div className="absolute inset-0 glass-card" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
                Ready to explore?
              </h2>
              <p className="text-zinc-400 text-lg mb-10 max-w-md mx-auto">
                Jump into the dashboard to see live prices and sync data from the CoinRanking API.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-sm bg-accent text-black font-semibold transition-all duration-300 hover:shadow-glow hover:scale-[1.02]"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
