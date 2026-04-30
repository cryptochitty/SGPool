/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Activity, 
  Cpu, 
  Database, 
  Globe, 
  Terminal as TerminalIcon, 
  RefreshCw, 
  Clock, 
  Search, 
  ChevronRight,
  TrendingUp,
  Award,
  Zap,
  Info,
  ShieldCheck,
  Target,
  Trophy,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- TYPES ---
interface Fixture {
  id: string;
  home: string;
  away: string;
  league: string;
  h2hCount: number;
  history: string[]; // e.g. ["2:1", "0:0", "1:3", "2:0", "1:1"]
  odds: {
    home: number;
    draw: number;
    away: number;
  };
  score?: string; // For LIVE games
  minute?: string; // For LIVE games
  lean: 'home' | 'away' | 'draw' | 'neutral';
}

interface LogEntry {
  timestamp: string;
  type: 'info' | 'ok' | 'warn' | 'err';
  message: string;
}

type SourceType = 'LIVE' | 'EPL' | 'LA LIGA' | 'UCL' | 'POOLS';

// --- CONSTANTS & DATA ---
const SOURCES_URLS: Record<SourceType, string> = {
  LIVE: 'https://api.livescore.com/v2/matches/live',
  EPL: 'https://stats.premierleague.com/fixtures/latest',
  'LA LIGA': 'https://www.laliga.com/en-GB/stats/data',
  UCL: 'https://www.uefa.com/uefachampionsleague/fixtures',
  POOLS: 'https://www.singaporepools.com.sg/en/product/Pages/4d_results.aspx',
};

const FIXTURES_DATA: Record<SourceType, Fixture[]> = {
  LIVE: [
    { id: 'l1', home: 'Arsenal', away: 'Chelsea', league: 'EPL', h2hCount: 42, history: ["2:1", "1:1", "0:2", "3:1", "2:2"], odds: { home: 1.85, draw: 3.4, away: 4.2 }, score: '2-1', minute: "64'", lean: 'home' },
    { id: 'l2', home: 'Bayern Munich', away: 'Real Madrid', league: 'UCL', h2hCount: 26, history: ["1:1", "2:1", "2:2", "0:1", "1:2"], odds: { home: 2.1, draw: 3.6, away: 3.1 }, score: '0-0', minute: "12'", lean: 'neutral' },
    { id: 'l3', home: 'Inter Milan', away: 'Juventus', league: 'Serie A', h2hCount: 58, history: ["1:0", "0:0", "1:1", "2:1", "0:1"], odds: { home: 2.05, draw: 3.2, away: 3.8 }, score: '1-0', minute: "88'", lean: 'home' },
    { id: 'l4', home: 'Liverpool', away: 'Man City', league: 'EPL', h2hCount: 48, history: ["1:1", "2:3", "1:0", "4:1", "2:2"], odds: { home: 2.6, draw: 3.8, away: 2.4 }, score: '2-2', minute: "75'", lean: 'away' },
  ],
  EPL: [
    { id: 'e1', home: 'Newcastle', away: 'Aston Villa', league: 'EPL', h2hCount: 34, history: ["5:1", "0:3", "0:0", "1:0", "2:0"], odds: { home: 1.95, draw: 3.5, away: 3.6 }, lean: 'home' },
    { id: 'e2', home: 'Tottenham', away: 'Man Utd', league: 'EPL', h2hCount: 62, history: ["2:0", "2:2", "0:2", "0:3", "1:6"], odds: { home: 2.4, draw: 3.6, away: 2.8 }, lean: 'neutral' },
    { id: 'e3', home: 'Brighton', away: 'Everton', league: 'EPL', h2hCount: 18, history: ["1:1", "1:5", "4:1", "0:2", "0:0"], odds: { home: 1.65, draw: 4.1, away: 4.8 }, lean: 'home' },
    { id: 'e4', home: 'West Ham', away: 'Wolves', league: 'EPL', h2hCount: 22, history: ["3:0", "0:1", "2:0", "1:0", "3:2"], odds: { home: 2.1, draw: 3.3, away: 3.5 }, lean: 'home' },
    { id: 'e5', home: 'Fulham', away: 'Brentford', league: 'EPL', h2hCount: 12, history: ["0:3", "3:2", "0:0", "1:0", "1:1"], odds: { home: 2.5, draw: 3.2, away: 2.9 }, lean: 'draw' },
    { id: 'e6', home: 'Nottm Forest', away: 'Bournemouth', league: 'EPL', h2hCount: 8, history: ["2:3", "1:1", "0:1", "0:1", "2:0"], odds: { home: 2.3, draw: 3.2, away: 3.2 }, lean: 'neutral' },
  ],
  'LA LIGA': [
    { id: 'la1', home: 'Barcelona', away: 'Girona', league: 'La Liga', h2hCount: 8, history: ["2:4", "0:0", "1:0", "2:0", "2:2"], odds: { home: 1.55, draw: 4.5, away: 5.4 }, lean: 'home' },
    { id: 'la2', home: 'Atletico Madrid', away: 'Sevilla', league: 'La Liga', h2hCount: 44, history: ["1:0", "6:1", "2:0", "1:1", "0:1"], odds: { home: 1.7, draw: 3.7, away: 4.9 }, lean: 'home' },
    { id: 'la3', home: 'Valencia', away: 'Real Sociedad', league: 'La Liga', h2hCount: 38, history: ["0:1", "1:0", "0:0", "0:0", "0:1"], odds: { home: 2.8, draw: 3.1, away: 2.6 }, lean: 'away' },
    { id: 'la4', home: 'Real Betis', away: 'Villarreal', league: 'La Liga', h2hCount: 32, history: ["2:3", "1:0", "1:1", "0:2", "2:1"], odds: { home: 2.4, draw: 3.4, away: 2.9 }, lean: 'neutral' },
  ],
  UCL: [
    { id: 'u1', home: 'PSG', away: 'Dortmund', league: 'UCL', h2hCount: 6, history: ["2:0", "1:1", "2:0", "1:2", "0:0"], odds: { home: 1.6, draw: 4.4, away: 4.8 }, lean: 'home' },
    { id: 'u2', home: 'Man City', away: 'Inter Milan', league: 'UCL', h2hCount: 1, history: ["1:0"], odds: { home: 1.45, draw: 4.8, away: 6.2 }, lean: 'home' },
    { id: 'u3', home: 'AC Milan', away: 'Newcastle', league: 'UCL', h2hCount: 2, history: ["2:1", "0:0"], odds: { home: 2.2, draw: 3.6, away: 3.2 }, lean: 'neutral' },
    { id: 'u4', home: 'Lazio', away: 'Celtic', league: 'UCL', h2hCount: 4, history: ["2:0", "2:1", "1:2", "1:2"], odds: { home: 1.75, draw: 3.8, away: 4.5 }, lean: 'home' },
  ],
  POOLS: [
    { id: 'p1', home: 'Cerezo Osaka', away: 'Albirex Niigata', league: 'J-League', h2hCount: 18, history: ["2:2", "0:1", "1:1", "2:0", "1:0"], odds: { home: 2.0, draw: 3.25, away: 3.4 }, lean: 'home' },
    { id: 'p2', home: 'Sydney FC', away: 'Melbourne City', league: 'A-League', h2hCount: 24, history: ["1:1", "0:0", "2:1", "1:2", "3:0"], odds: { home: 2.3, draw: 3.5, away: 2.8 }, lean: 'neutral' },
    { id: 'p3', home: 'HNK Rijeka', away: 'Osijek', league: 'Prva HNL', h2hCount: 30, history: ["3:0", "0:0", "1:1", "2:1", "1:0"], odds: { home: 1.8, draw: 3.5, away: 4.2 }, lean: 'home' },
    { id: 'p4', home: 'Malmo FF', away: 'AIK', league: 'Allsvenskan', h2hCount: 40, history: ["5:0", "0:0", "3:0", "1:1", "1:0"], odds: { home: 1.5, draw: 4.0, away: 6.0 }, lean: 'home' },
    { id: 'p5', home: 'Hammarby', away: 'IFK Goteborg', league: 'Allsvenskan', h2hCount: 38, history: ["1:1", "1:1", "3:0", "1:2", "0:0"], odds: { home: 2.1, draw: 3.4, away: 3.2 }, lean: 'neutral' },
    { id: 'p6', home: 'Gremio', away: 'Flamengo', league: 'Serie A', h2hCount: 45, history: ["3:2", "0:3", "0:4", "2:2", "0:2"], odds: { home: 2.9, draw: 3.2, away: 2.4 }, lean: 'away' },
    { id: 'p7', home: 'Columbus Crew', away: 'LAFC', league: 'MLS', h2hCount: 5, history: ["2:1", "0:2", "1:0", "0:3", "1:0"], odds: { home: 2.2, draw: 3.5, away: 2.9 }, lean: 'neutral' },
    { id: 'p8', home: 'Vissel Kobe', away: 'Kawasaki Frontale', league: 'J-League', h2hCount: 28, history: ["1:0", "2:2", "1:2", "1:3", "1:1"], odds: { home: 2.5, draw: 3.4, away: 2.6 }, lean: 'draw' },
  ],
};

const LOG_STEPS = [
  { message: "Resolving DNS for target host...", type: "info" as const },
  { message: "Connection established (TLS 1.3 | AES-256-GCM)", type: "ok" as const },
  { message: "Sending GET request with stealth headers", type: "info" as const },
  { message: "HTTP 200 OK | Content-Type: text/html", type: "ok" as const },
  { message: "Parsing HTML DOM... injecting bypass scripts", type: "info" as const },
  { message: "Extracting match containers from Shadow DOM", type: "info" as const },
  { message: "Resolving normalized team names", type: "ok" as const },
  { message: "Scraping market odds from embedded JSON blobs", type: "info" as const },
  { message: "Fetching H2H history from internal Stats API", type: "ok" as const },
  { message: "Calling Prediction Engine for preliminary analysis", type: "info" as const },
  { message: "Scraping complete.", type: "ok" as const },
];

const PREDICTION_ANALYSIS_TEMPLATES = [
  "Comprehensive tactical analysis reveals a significant advantage for {team}. Their recent high-intensity pressing and quick transitions are likely to overwhelm the {opponent} backline. xG trends suggest a dominant performance.",
  "Expect a cagey affair at {team}'s home ground. Both teams have shown defensive resilience in their last 5 outings. The historical H2H data points towards a low-scoring stalemate, with {team} potentially edging it on a set-piece.",
  "Statistical model detects high volatility in {team} vs {opponent}. {team}'s attack strength is at an all-time high, but defensive lapses are still evident. {opponent} has a 42% strike rate on counter-attacks. Recommend caution.",
  "The 'PoolOracle' algorithm indicates a clear value bet on {team}. Their form rating of {form}/100 is significantly above league average. Expect a high-scoring game (Over 2.5 goals) with {team} controlling 60%+ possession."
];

// --- COMPONENTS ---

export default function App() {
  const [currentSource, setCurrentSource] = useState<SourceType>('LIVE');
  const [urlInput, setUrlInput] = useState(SOURCES_URLS['LIVE']);
  const [isScraping, setIsScraping] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [foundFixtures, setFoundFixtures] = useState<Fixture[]>([]);
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionData, setPredictionData] = useState<any>(null);
  const [typedAnalysis, setTypedAnalysis] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const logEndRef = useRef<HTMLDivElement>(null);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll terminal logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getTimeString = () => {
    return currentTime.toLocaleTimeString('en-US', { hour12: false });
  };

  const addLog = (message: string, type: 'info' | 'ok' | 'warn' | 'err') => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, { timestamp, type, message }]);
  };

  const handleSourceTab = (source: SourceType) => {
    if (isScraping) return;
    setCurrentSource(source);
    setUrlInput(SOURCES_URLS[source]);
    setFoundFixtures([]);
    setSelectedFixture(null);
  };

  const runScrape = async () => {
    if (isScraping) return;
    setIsScraping(true);
    setLogs([]);
    setFoundFixtures([]);
    setSelectedFixture(null);

    for (let i = 0; i < LOG_STEPS.length; i++) {
      const step = LOG_STEPS[i];
      await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 800));
      addLog(step.message, step.type);
    }

    // Final log
    const fixtures = FIXTURES_DATA[currentSource];
    // Randomize odds slightly on each scrape
    const randomizedFixtures = fixtures.map(f => ({
      ...f,
      odds: {
        home: +(Math.random() * (3.5 - 1.5) + 1.5).toFixed(2),
        draw: +(Math.random() * (4.0 - 2.8) + 2.8).toFixed(2),
        away: +(Math.random() * (4.8 - 1.8) + 1.8).toFixed(2),
      }
    }));

    addLog(`Success: ${randomizedFixtures.length} fixtures extracted and indexed.`, 'ok');
    setFoundFixtures(randomizedFixtures);
    setIsScraping(false);

    // Auto-predict the first match
    if (randomizedFixtures.length > 0) {
      const firstFixture = randomizedFixtures[0];
      setSelectedFixture(firstFixture);
      runPrediction(firstFixture);
    }
  };

  const handleMatchSelect = (fixture: Fixture) => {
    if (isPredicting) return;
    setSelectedFixture(fixture);
    runPrediction(fixture);
  };

  const runPrediction = async (f: Fixture) => {
    setIsPredicting(true);
    setTypedAnalysis("");
    
    // Simulate thinking
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Prediction Logic
    const homeAtk = Math.random() * (2.2 - 1.0) + 1.0;
    const awayAtk = Math.random() * (2.2 - 1.0) + 1.0;
    const homeDef = Math.random() * (1.5 - 1.0) + 1.0;
    const awayDef = Math.random() * (1.5 - 1.0) + 1.0;

    const xGHome = (homeAtk / awayDef) * 1.1;
    const xGAway = (awayAtk / homeDef) * 0.9;

    const homeWinProb = Math.floor(Math.random() * (60 - 30) + 30);
    const awayWinProb = Math.floor(Math.random() * (43 - 15) + 15);
    const drawProb = 100 - homeWinProb - awayWinProb;

    const confidence = Math.floor(Math.random() * (85 - 55) + 55);
    
    let verdict = "DRAW LIKELY";
    let verdictTeam = "";
    if (homeWinProb > awayWinProb && homeWinProb > drawProb) {
      verdict = `${f.home.toUpperCase()} WIN`;
      verdictTeam = f.home;
    } else if (awayWinProb > homeWinProb && awayWinProb > drawProb) {
      verdict = `${f.away.toUpperCase()} WIN`;
      verdictTeam = f.away;
    }

    const data = {
      score: { home: Math.round(xGHome), away: Math.round(xGAway) },
      xG: { home: xGHome.toFixed(2), away: xGAway.toFixed(2) },
      probs: { home: homeWinProb, draw: drawProb, away: awayWinProb },
      confidence,
      verdict,
      factors: {
        advantage: Math.floor(Math.random() * 40 + 60),
        strength: Math.floor(Math.random() * 30 + 50),
        form: Math.floor(Math.random() * 50 + 40),
        edge: Math.floor(Math.random() * 20 + 70),
      }
    };

    setPredictionData(data);
    setIsPredicting(false);

    // AI Analysis Typewriter
    const template = PREDICTION_ANALYSIS_TEMPLATES[Math.floor(Math.random() * PREDICTION_ANALYSIS_TEMPLATES.length)];
    const analysis = template
      .replace(/{team}/g, verdictTeam || f.home)
      .replace(/{opponent}/g, verdictTeam === f.home ? f.away : f.home)
      .replace(/{form}/g, data.factors.form.toString());

    let i = 0;
    const interval = setInterval(() => {
      setTypedAnalysis(analysis.slice(0, i));
      i++;
      if (i > analysis.length) clearInterval(interval);
    }, 18);
  };

  return (
    <div className="relative w-full h-screen flex flex-col p-4 z-10">
      <div className="grid-overlay" />
      
      {/* HEADER */}
      <header className="flex justify-between items-center mb-4 bg-black/40 p-4 rounded-lg border-b border-cyan-glow/30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex text-2xl font-black">
            <span className="text-cyan-glow drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]">POOL</span>
            <span className="text-orange-glow drop-shadow-[0_0_8px_rgba(255,109,0,0.6)] ml-1">ORACLE</span>
          </div>
          <div className="flex items-center bg-black/60 px-3 py-1 rounded border border-red-glow/30">
            <div className="w-2 h-2 bg-red-glow rounded-full animate-pulse-red mr-2" />
            <span className="text-xs font-bold text-red-glow uppercase">Live</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-cyan-glow/70 font-mono-data text-lg">
            <Clock size={16} />
            {getTimeString()}
          </div>
          <div className="flex items-center gap-4 border-l border-white/10 pl-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-white/40 uppercase tracking-widest">System Load</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`w-1 h-3 rounded-full ${i < 4 ? 'bg-green-glow/60' : 'bg-gray-700'}`} />
                ))}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-cyan-glow/30 flex items-center justify-center bg-cyan-glow/5">
              <Activity size={20} className="text-cyan-glow" />
            </div>
          </div>
        </div>
      </header>

      {/* STATUS BAR */}
      <section className="flex gap-3 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        <StatusChip icon={<Globe size={12}/>} label="SCRAPE ENGINE" value="ONLINE" color="text-cyan-glow" />
        <StatusChip icon={<Cpu size={12}/>} label="PRED MODEL" value="ORACLE-X.2" color="text-purple-glow" />
        <StatusChip icon={<Database size={12}/>} label="MATCHES FOUND" value={foundFixtures.length.toString()} color="text-orange-glow" />
        <StatusChip icon={<RefreshCw size={12}/>} label="DATA FRESHNESS" value="REAL-TIME" color="text-green-glow" />
        <StatusChip icon={<ShieldCheck size={12}/>} label="API STATUS" value="STRICT-AUTH" color="text-cyan-glow" />
      </section>

      {/* MAIN GRID */}
      <main className="flex-1 grid grid-cols-[380px,1fr] gap-4 min-h-0">
        
        {/* LEFT PANEL */}
        <div className="bento-panel">
          <div className="panel-header-alt">⟩ WEB SCRAPING AGENT</div>
          <div className="flex flex-col gap-4 p-4 flex-1 min-h-0">
            {/* Source Tabs */}
            <div className="bg-black/60 p-1 rounded-lg border border-white/10 flex gap-1">
            {(['LIVE', 'EPL', 'LA LIGA', 'UCL', 'POOLS'] as SourceType[]).map(tab => (
              <button
                key={tab}
                onClick={() => handleSourceTab(tab)}
                className={`flex-1 py-2 rounded text-[10px] font-bold tracking-tighter transition-all duration-300 ${
                  currentSource === tab 
                    ? 'bg-cyan-glow text-black shadow-[0_0_10px_rgba(0,229,255,0.4)]' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab === 'LIVE' && '⚡ '}
                {tab === 'EPL' && '🏴 '}
                {tab === 'LA LIGA' && '🇪🇸 '}
                {tab === 'UCL' && '🏆 '}
                {tab === 'POOLS' && '🎱 '}
                {tab}
              </button>
            ))}
          </div>

          {/* URL Input */}
          <div className="terminal-box p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[10px] text-cyan-glow/60 uppercase">
              <Search size={12} /> Target Scraping URL
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                readOnly
                className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-xs font-mono-data text-white/80 focus:outline-none focus:border-cyan-glow/50"
              />
              <button 
                onClick={runScrape}
                disabled={isScraping}
                className="bg-cyan-glow hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-black font-black px-4 rounded text-xs flex items-center gap-2 active:scale-95"
              >
                {isScraping ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                {isScraping ? 'SCRAPING...' : 'SCRAPE'}
              </button>
            </div>
          </div>

          {/* Terminal Log */}
          <div className="terminal-box flex flex-col min-h-[220px]">
            <div className="flex justify-between items-center px-3 py-2 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-white/50">
                <TerminalIcon size={12} /> SCRAPE_AGENT_TERMINAL
              </div>
              <button onClick={() => setLogs([])} className="text-[10px] text-white/30 hover:text-white/60">CLR</button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto custom-scrollbar font-mono-data text-[11px] space-y-1">
              {logs.length === 0 ? (
                <div className="text-white/20 italic">No output. Awaiting scrape instruction...</div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-white/30">[{log.timestamp}]</span>
                    <span className={log.type === 'ok' ? 'text-green-glow' : log.type === 'err' ? 'text-red-glow' : log.type === 'warn' ? 'text-orange-glow' : 'text-cyan-glow'}>
                      {log.type.toUpperCase()}:
                    </span>
                    <span className="text-white/80">{log.message}</span>
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>
          </div>

          {/* Match List */}
          <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
             <div className="text-[10px] font-bold text-white/40 uppercase px-1 flex justify-between">
                <span>Discovered Fixtures</span>
                <span>{foundFixtures.length} Results</span>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
               {foundFixtures.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center border border-dashed border-white/10 rounded-lg opacity-20">
                    <Database size={40} className="mb-2" />
                    <span className="text-sm">Database Empty</span>
                 </div>
               ) : (
                 foundFixtures.map(fixture => (
                   <MatchCard 
                    key={fixture.id} 
                    fixture={fixture} 
                    isSelected={selectedFixture?.id === fixture.id}
                    onClick={() => handleMatchSelect(fixture)}
                   />
                 ))
               )}
             </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - PREDICTION ENGINE */}
        <div className="bento-panel flex flex-col overflow-hidden">
          <div className="panel-header-alt">⟩ PREDICTION ENGINE v2.8</div>
          <AnimatePresence mode="wait">
            {!selectedFixture ? (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-32 h-32 mb-6 rounded-full bg-cyan-glow/5 border border-cyan-glow/20 flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-glow/10 to-transparent animate-pulse" />
                  <Target size={60} className="text-cyan-glow/20 group-hover:text-cyan-glow/60 transition-colors duration-500 scale-110" />
                </div>
                <h2 className="text-2xl font-black text-white/50 mb-2">AWAITING SELECTION</h2>
                <p className="text-white/30 max-w-sm leading-relaxed">
                  Scrape the target website then select a fixture from the directory to initialize the <span className="text-cyan-glow/40">Oracle Prediction Pipeline</span>.
                </p>
                <div className="mt-8 flex gap-2">
                  {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-glow/20 animate-bounce" style={{ animationDelay: `${i*0.2}s` }} />)}
                </div>
              </motion.div>
            ) : isPredicting ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center"
              >
                <RefreshCw size={48} className="text-cyan-glow animate-spin mb-4" />
                <div className="font-header text-xl text-cyan-glow tracking-[0.2em] animate-pulse">ANALYZING PARAMETERS...</div>
                <div className="mt-2 text-white/40 font-mono-data text-xs uppercase tracking-widest">Simulating xG Variables & Momentum Vectors</div>
              </motion.div>
            ) : (
                <motion.div 
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar"
                >
                  {/* PREDICTED SCORE */}
                  <div className="flex flex-col items-center mb-10">
                    <div className="text-[10px] font-bold text-cyan-glow bg-cyan-glow/10 px-3 py-1 rounded-full mb-6 border border-cyan-glow/20 tracking-widest uppercase">Oracle Predicted Scoreline</div>
                    <div className="flex items-center gap-12 sm:gap-20">
                      <div className="text-center group">
                        <div className="text-xs text-white/40 uppercase mb-2 font-mono-data">HOME TEAM</div>
                        <div className="font-header text-lg text-white group-hover:text-cyan-glow transition-colors">{selectedFixture.home}</div>
                        <div className="text-7xl sm:text-8xl font-black text-cyan-glow drop-shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-transform group-hover:scale-110">{predictionData.score.home}</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                        <div className="font-header text-2xl text-white/20 my-2">VS</div>
                        <div className="w-px h-16 bg-gradient-to-b from-white/20 via-white/20 to-transparent" />
                      </div>
                      <div className="text-center group">
                        <div className="text-xs text-white/40 uppercase mb-2 font-mono-data">AWAY TEAM</div>
                        <div className="font-header text-lg text-white group-hover:text-orange-glow transition-colors">{selectedFixture.away}</div>
                        <div className="text-7xl sm:text-8xl font-black text-orange-glow drop-shadow-[0_0_20px_rgba(255,109,0,0.4)] transition-transform group-hover:scale-110">{predictionData.score.away}</div>
                      </div>
                    </div>
                  </div>

                  {/* PROBABILITY & VERDICT */}
                  <div className="grid grid-cols-[1fr,300px] gap-8 mb-8">
                    <div className="space-y-4">
                      <ProbabilityBar label="HOME WIN" percent={predictionData.probs.home} color="from-cyan-glow to-blue-600" />
                      <ProbabilityBar label="DRAW" percent={predictionData.probs.draw} color="from-purple-glow to-indigo-600" />
                      <ProbabilityBar label="AWAY WIN" percent={predictionData.probs.away} color="from-orange-glow to-red-600" />
                      
                      {currentSource === 'POOLS' && (
                        <div className="p-3 bg-cyan-glow/5 border border-cyan-glow/20 rounded-lg mt-2">
                           <div className="text-[9px] font-bold text-cyan-glow uppercase tracking-[0.2em] mb-2">Live Pools Numbers (Forecast)</div>
                           <div className="flex gap-2">
                             {[1,2,3,4].map(i => (
                               <div key={i} className="flex-1 bg-black/60 border border-cyan-glow/30 p-2 rounded text-center text-lg font-black text-cyan-glow font-header">
                                 {Math.floor(Math.random() * 10)}
                               </div>
                             ))}
                           </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <div className={`p-5 rounded-lg border flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-500 ${
                        predictionData.verdict.includes('WIN') 
                          ? predictionData.verdict.startsWith(selectedFixture.home.toUpperCase()) ? 'bg-cyan-glow/10 border-cyan-glow/40 glow-cyan' : 'bg-orange-glow/10 border-orange-glow/40 glow-orange'
                          : 'bg-purple-glow/10 border-purple-glow/40 shadow-[0_0_15px_rgba(213,0,249,0.2)]'
                      }`}>
                         <Award className={`mb-2 w-10 h-10 drop-shadow-lg ${
                            predictionData.verdict.includes('WIN') 
                              ? predictionData.verdict.startsWith(selectedFixture.home.toUpperCase()) ? 'text-cyan-glow' : 'text-orange-glow'
                              : 'text-purple-glow'
                         }`} />
                         <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Expert Verdict</div>
                         <div className="text-xl font-black text-white drop-shadow-md">{predictionData.verdict}</div>
                         <div className="text-[10px] text-white/60 mt-1 font-mono-data uppercase">Estimated xG {predictionData.xG.home} - {predictionData.xG.away}</div>
                         <div className="absolute top-0 right-0 p-1">
                            <Target size={40} className="opacity-5 scale-150 rotate-12" />
                         </div>
                      </div>

                      <div className="bg-white/5 border border-white/10 p-4 rounded-lg shadow-inner">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] font-bold text-white/40 uppercase">System Confidence</span>
                           <span className={`text-xs font-bold font-mono-data px-2 rounded border ${
                             predictionData.confidence >= 75 ? 'text-green-glow border-green-glow/30 bg-green-glow/5' : 
                             predictionData.confidence >= 60 ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5' : 
                             'text-red-glow border-red-glow/30 bg-red-glow/5'
                           }`}>{predictionData.confidence}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${predictionData.confidence}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-full rounded-full ${
                              predictionData.confidence >= 75 ? 'bg-green-glow' : 
                              predictionData.confidence >= 60 ? 'bg-yellow-400' : 
                              'bg-red-glow'
                            }`} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FACTORS GRID */}
                  <div className="grid grid-cols-4 gap-4 mb-8">
                    <FactorCard icon={<TrendingUp size={14}/>} label="Home Adv." value={predictionData.factors.advantage} color="text-cyan-glow" />
                    <FactorCard icon={<Zap size={14}/>} label="Atk Strength" value={predictionData.factors.strength} color="text-orange-glow" />
                    <FactorCard icon={<Activity size={14}/>} label="Form Rating" value={predictionData.factors.form} color="text-green-glow" />
                    <FactorCard icon={<Target size={14}/>} label="H2H Edge" value={predictionData.factors.edge} color="text-purple-glow" />
                  </div>

                  {/* AI ANALYSIS AI analysis streams in typing effect */}
                  <div className="bg-purple-glow/5 border border-purple-glow/30 rounded-lg mb-8 overflow-hidden shadow-[0_0_20px_rgba(213,0,249,0.05)]">
                    <div className="bg-purple-glow/10 border-b border-purple-glow/20 px-4 py-2 flex items-center justify-between">
                      <div className="text-[10px] font-bold text-purple-glow flex items-center gap-2 tracking-[0.2em]"> 
                        <ChevronRight size={14} className="animate-pulse" /> AI_STRATEGY_ANALYSIS
                      </div>
                      <div className="flex gap-1 pr-1">
                        <TerminalIcon size={12} className="text-purple-glow/40" />
                      </div>
                    </div>
                    <div className="p-4 min-h-[80px] text-sm leading-relaxed text-purple-glow/80 font-mono-data">
                      {typedAnalysis}
                      <span className="w-2 h-4 inline-block bg-purple-glow ml-1 animate-pulse" />
                    </div>
                  </div>

                  {/* BOTTOM ROW (H2H + Recent Form) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase mb-4 tracking-widest">
                        <History size={14} className="text-cyan-glow" /> H2H Historical Meetings
                      </div>
                      <div className="flex justify-between items-center mb-4 px-2 py-1 bg-white/5 rounded">
                        <div className="text-center font-mono-data">
                          <div className="text-[10px] text-white/30">H WIN</div>
                          <div className="text-sm font-bold text-cyan-glow">26</div>
                        </div>
                        <div className="text-center font-mono-data">
                          <div className="text-[10px] text-white/30">DRAW</div>
                          <div className="text-sm font-bold text-purple-glow">12</div>
                        </div>
                        <div className="text-center font-mono-data">
                          <div className="text-[10px] text-white/30">A WIN</div>
                          <div className="text-sm font-bold text-orange-glow">14</div>
                        </div>
                      </div>
                      <table className="w-full text-xs text-left text-white/60">
                        <thead>
                          <tr className="border-b border-white/5 font-mono-data">
                            <th className="pb-2 font-normal">Scoreline</th>
                            <th className="pb-2 font-normal text-right">Result</th>
                          </tr>
                        </thead>
                        <tbody className="font-mono-data">
                          {selectedFixture.history.map((h, i) => {
                            const [hScore, aScore] = h.split(':').map(Number);
                            const res = hScore > aScore ? 'H' : hScore < aScore ? 'A' : 'D';
                            return (
                              <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 cursor-default transition-colors">
                                <td className="py-2 text-white/80 uppercase">{selectedFixture.home} <span className="font-bold text-white mx-1">{h}</span> {selectedFixture.away}</td>
                                <td className="py-2 text-right">
                                  <span className={`inline-block w-5 h-5 text-center leading-5 rounded text-[10px] font-bold ${
                                    res === 'H' ? 'bg-cyan-glow text-black' : res === 'A' ? 'bg-orange-glow text-black' : 'bg-gray-700 text-white'
                                  }`}>{res}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase mb-6 tracking-widest">
                        <Trophy size={14} className="text-orange-glow" /> Recent League Form
                      </div>
                      <div className="space-y-6">
                        <div>
                          <div className="text-[10px] text-white/30 font-mono-data mb-2 uppercase flex justify-between">
                            <span>{selectedFixture.home}</span>
                            <span className="text-cyan-glow">3rd Position</span>
                          </div>
                          <div className="flex gap-2">
                            {['W', 'W', 'D', 'L', 'W'].map((f, i) => <FormDot key={i} letter={f} />)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-white/30 font-mono-data mb-2 uppercase flex justify-between">
                            <span>{selectedFixture.away}</span>
                            <span className="text-orange-glow">6th Position</span>
                          </div>
                          <div className="flex gap-2">
                            {['D', 'L', 'W', 'W', 'D'].map((f, i) => <FormDot key={i} letter={f} />)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 p-3 rounded bg-white/5 border border-white/10 flex items-center gap-3">
                         <Info size={16} className="text-cyan-glow flex-shrink-0" />
                         <p className="text-[10px] text-white/50 leading-relaxed italic">
                           Form indices are calculated based on offensive efficiency and defensive clean-sheet streaks over the last 30 calendar days.
                         </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

interface StatusChipProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

function StatusChip({ icon, label, value, color }: StatusChipProps) {
  return (
    <div className="flex items-center gap-3 bg-bento-card border border-bento-border px-3 py-2 rounded-full backdrop-blur-sm min-w-fit transition-all hover:border-cyan-glow/30">
      <div className={`${color} bg-current/10 p-1.5 rounded-full`}>{icon}</div>
      <div className="flex flex-col">
        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-0.5">{label}</span>
        <span className={`text-xs font-mono-data font-bold ${color}`}>{value}</span>
      </div>
    </div>
  );
}

interface MatchCardProps {
  key?: React.Key;
  fixture: Fixture;
  isSelected: boolean;
  onClick: () => void;
}

function MatchCard({ fixture, isSelected, onClick }: MatchCardProps) {
  const borderClass = fixture.lean === 'home' ? 'border-l-cyan-glow' : fixture.lean === 'away' ? 'border-l-orange-glow' : 'border-l-white/20';
  const isHotPick = fixture.id.endsWith('1'); // Mock logic for "Hot Pick"

  return (
    <div 
      onClick={onClick}
      className={`group relative p-3 rounded border border-white/5 cursor-pointer transition-all duration-300 border-l-4 ${borderClass} ${
        isSelected ? 'bg-white/10 border-white/30 glow-cyan' : 'bg-black/60 hover:bg-white/5'
      }`}
    >
      {isHotPick && (
        <div className="absolute -top-1.5 -right-1 bg-orange-glow text-black text-[8px] font-black px-1.5 py-0.5 rounded shadow-lg z-20 animate-bounce">
          ORACLE PICK
        </div>
      )}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">{fixture.league} • {fixture.h2hCount} H2H</span>
          {fixture.minute && (
            <span className="text-[9px] font-bold text-red-glow animate-pulse">{fixture.minute}</span>
          )}
        </div>
        <div className="flex justify-between items-center my-1">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white group-hover:text-cyan-glow transition-colors">{fixture.home}</span>
            <span className="text-sm font-bold text-white group-hover:text-orange-glow transition-colors">{fixture.away}</span>
          </div>
          {fixture.score && (
            <div className="font-header text-lg text-red-glow tracking-widest bg-red-glow/10 px-2 rounded">{fixture.score}</div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1 mt-1">
          <OddsChip label="1" val={fixture.odds.home} highlight={fixture.lean === 'home'} />
          <OddsChip label="X" val={fixture.odds.draw} highlight={fixture.lean === 'draw'} />
          <OddsChip label="2" val={fixture.odds.away} highlight={fixture.lean === 'away'} />
        </div>
      </div>
    </div>
  );
}

interface OddsChipProps {
  label: string;
  val: number;
  highlight?: boolean;
}

function OddsChip({ label, val, highlight }: OddsChipProps) {
  return (
    <div className={`flex items-center justify-between px-2 py-1 rounded text-[10px] font-mono-data border ${
      highlight ? 'bg-green-glow/20 border-green-glow/40 text-green-glow font-bold' : 'bg-black/40 border-white/5 text-white/50'
    }`}>
      <span>{label}</span>
      <span>{val.toFixed(2)}</span>
    </div>
  );
}

interface ProbabilityBarProps {
  label: string;
  percent: number;
  color: string;
}

function ProbabilityBar({ label, percent, color }: ProbabilityBarProps) {
  return (
    <div className="space-y-1.5 p-2 bg-white/[0.02] rounded-lg">
      <div className="flex justify-between text-[11px] font-bold tracking-widest uppercase">
        <span className="text-white/40">{label}</span>
        <span className="text-white font-mono-data">{percent}%</span>
      </div>
      <div className="h-4 w-full bg-black/40 rounded-sm overflow-hidden relative border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          className={`h-full bg-gradient-to-r ${color} relative`}
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-[shimmer_2s_infinite] pointer-events-none" />
        </motion.div>
      </div>
    </div>
  );
}

interface FactorCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

function FactorCard({ icon, label, value, color }: FactorCardProps) {
  return (
    <div className="bg-black/40 border border-white/5 p-3 rounded-lg flex flex-col gap-2 group hover:border-white/20 transition-colors">
      <div className="flex items-center gap-2">
        <div className={color}>{icon}</div>
        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest leading-none">{label}</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="text-lg font-black font-header text-white leading-none">{value}</div>
        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden mb-1">
          <div className={`h-full ${color.replace('text-', 'bg-')} opacity-60`} style={{ width: `${value}%` }} />
        </div>
      </div>
    </div>
  );
}

interface FormDotProps {
  key?: React.Key;
  letter: string;
}

function FormDot({ letter }: FormDotProps) {
  const color = letter === 'W' ? 'bg-green-glow' : letter === 'D' ? 'bg-yellow-400' : 'bg-red-glow';
  return (
    <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black text-black ${color} shadow-[0_2px_5px_rgba(0,0,0,0.4)] hover:scale-110 cursor-default transition-transform`}>
      {letter}
    </div>
  );
}
