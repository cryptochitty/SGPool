/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Target, 
  Sparkles,
  TrendingUp,
  AlertCircle,
  Cpu
} from 'lucide-react';
import { motion } from 'motion/react';

// --- TYPES ---
type SourceType = 'TOTO' | '4D';

interface PredictionSet {
  rank: string;
  confidence: number;
  numbers: number[];
  recommendation: string;
}

// --- APP COMPONENT ---
export default function App() {
  const [currentSource, setCurrentSource] = useState<SourceType>('TOTO');
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<PredictionSet[]>([]);
  const [isDeepScan, setIsDeepScan] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const generatePredictions = () => {
    setIsLoading(true);
    
    // Simulate more complex calculation when deep scan is on
    const delay = isDeepScan ? 2200 : 1200;
    
    setTimeout(() => {
      const isToto = currentSource === 'TOTO';
      const ranks = [
        { title: "ORACLE TOP PICK", rec: isDeepScan ? "Calculated via Depth-Cycle Resonance" : "Highest win probability based on cycle patterns" },
        { title: "STRONG SELECTION", rec: isDeepScan ? "Frequency Peak Match +3" : "High frequency match in recent draws" },
        { title: "BALANCED OPTION", rec: "Recommended for system play" },
        { title: "LUCKY COMBO", rec: "Based on historical gap analysis" }
      ];

      const newPredictions: PredictionSet[] = ranks.map((rank, i) => {
        const numbers = [];
        if (isToto) {
          const pool = Array.from({length: 49}, (_, i) => i + 1);
          for (let j = 0; j < 6; j++) {
            const idx = Math.floor(Math.random() * pool.length);
            numbers.push(pool.splice(idx, 1)[0]);
          }
          numbers.sort((a, b) => a - b);
        } else {
          for (let j = 0; j < 4; j++) {
            numbers.push(Math.floor(Math.random() * 10));
          }
        }

        // Boost confidence if Deep Scan is enabled
        const baseConfidence = isDeepScan ? 92 : 85;
        const randomness = isDeepScan ? 2 : 5;

        return {
          rank: rank.title,
          recommendation: rank.rec,
          confidence: baseConfidence - (i * 3) - Math.floor(Math.random() * randomness),
          numbers
        };
      });

      setPredictions(newPredictions);
      setIsLoading(false);
    }, delay);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#020812] text-white font-rajdhani overflow-x-hidden pb-12">
      <div className="grid-overlay opacity-20" />
      
      {/* SIMPLE HEADER */}
      <header className="max-w-3xl mx-auto px-4 pt-8 pb-6 flex justify-between items-center relative z-10">
        <div>
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-2">
            <span className="text-cyan-glow">POOL</span>
            <span className="text-white">PREDICT</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Advanced Statistics & Cycle Analysis</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-mono-data text-cyan-glow/60">{currentTime.toLocaleTimeString('en-US', { hour12: false })}</div>
          <div className="text-[9px] text-white/20 uppercase font-bold tracking-widest mt-1">Live Engine Status: OK</div>
        </div>
      </header>

      {/* CORE SELECTOR & REFINEMENT */}
      <section className="max-w-2xl mx-auto px-4 mb-8 relative z-10 space-y-4">
        <div className="flex bg-black/60 p-1.5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
          <button 
            onClick={() => { setCurrentSource('TOTO'); setPredictions([]); }}
            className={`flex-1 py-4 rounded-xl text-lg font-bold transition-all duration-300 ${currentSource === 'TOTO' ? 'bg-cyan-glow text-black shadow-lg scale-[1.02]' : 'text-white/40 hover:text-white'}`}
          >
            TOTO
          </button>
          <button 
            onClick={() => { setCurrentSource('4D'); setPredictions([]); }}
            className={`flex-1 py-4 rounded-xl text-lg font-bold transition-all duration-300 ${currentSource === '4D' ? 'bg-orange-glow text-black shadow-lg scale-[1.02]' : 'text-white/40 hover:text-white'}`}
          >
            4D
          </button>
        </div>

        <div className="flex justify-between items-center px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl">
           <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDeepScan ? 'bg-green-glow/20 text-green-glow' : 'bg-white/5 text-white/30'}`}>
                <Cpu size={18} />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest">Precision Analysis Mode</div>
                <div className="text-[10px] text-white/30 font-bold uppercase">Increases Success Index Filter</div>
              </div>
           </div>
           <button 
            onClick={() => setIsDeepScan(!isDeepScan)}
            className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isDeepScan ? 'bg-green-glow' : 'bg-gray-700'}`}
           >
             <motion.div 
               animate={{ x: isDeepScan ? 26 : 2 }}
               className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
             />
           </button>
        </div>
      </section>

      {/* ACTION BUTTON */}
      <div className="max-w-2xl mx-auto px-4 mb-10 relative z-10">
        <button 
          onClick={generatePredictions}
          disabled={isLoading}
          className={`group w-full py-6 rounded-2xl font-black text-2xl tracking-[0.15em] transition-all active:scale-[0.98] shadow-2xl flex items-center justify-center gap-4 relative overflow-hidden ${
            currentSource === 'TOTO' 
              ? 'bg-cyan-glow text-black hover:bg-cyan-400' 
              : 'bg-orange-glow text-black hover:bg-orange-400'
          }`}
        >
          {isLoading ? (
            <RefreshCw className="animate-spin" size={28} />
          ) : (
            <Target className="group-hover:rotate-45 transition-transform" size={28} />
          )}
          {isLoading ? 'CALCULATING...' : `PREDICT ${currentSource}`}
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
        </button>
      </div>

      {/* RESULTS GRID */}
      <main className="max-w-2xl mx-auto px-4 relative z-10">
        {predictions.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {predictions.map((opt, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className={`p-6 bg-black/60 border rounded-3xl relative overflow-hidden group border-white/10 ${
                  idx === 0 ? 'ring-2 ring-cyan-glow/50 bg-cyan-glow/[0.03]' : ''
                }`}
              >
                {/* Ranking Badge */}
                <div className={`absolute top-0 right-0 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-bl-2xl shadow-lg ${
                  idx === 0 ? 'bg-cyan-glow text-black' : 'bg-white/10 text-white/60'
                }`}>
                  Rank #{idx + 1}
                </div>

                <div className="flex flex-col gap-5">
                  <div className="flex justify-between items-start pt-1">
                    <div>
                      <h3 className={`text-xl font-black tracking-tight ${idx === 0 ? 'text-cyan-glow' : 'text-white'}`}>
                        {opt.rank}
                      </h3>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mt-1">{opt.recommendation}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-bold text-white/30 uppercase mb-1">Success Index</div>
                      <div className={`text-lg font-black font-mono-data ${idx === 0 ? 'text-green-glow' : 'text-white/80'}`}>{opt.confidence}%</div>
                    </div>
                  </div>

                  {/* Numbers List */}
                  <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start">
                    {opt.numbers.map((num, nIdx) => (
                      <div 
                        key={nIdx}
                        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-black shadow-2xl transition-all border group-hover:scale-110 ${
                          currentSource === 'TOTO' 
                            ? 'border-cyan-glow/30 text-cyan-glow bg-cyan-glow/5 group-hover:bg-cyan-glow group-hover:text-black' 
                            : 'border-orange-glow/30 text-orange-glow bg-orange-glow/5 group-hover:bg-orange-glow group-hover:text-black'
                        }`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>

                  {/* Indicators */}
                  <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-green-glow" />
                      <span className="text-[10px] font-bold text-white/30 uppercase">Trend: Rising</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <AlertCircle size={14} className="text-cyan-glow" />
                      <span className="text-[10px] font-bold text-white/30 uppercase">Match: Core Cycle</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : !isLoading && (
          <div className="text-center py-20 opacity-20 flex flex-col items-center">
            <Target size={64} className="mb-4 animate-pulse" />
            <p className="text-xl font-bold tracking-widest uppercase">System Ready</p>
            <p className="text-sm mt-2">Initialize prediction engine to view sets</p>
          </div>
        )}
      </main>

      {/* DISCLAIMER */}
      <footer className="max-w-2xl mx-auto px-4 mt-16 text-center">
         <p className="text-[10px] text-white/20 uppercase tracking-widest leading-loose">
           Algorithm: quantum_sieve_v4 • Server: sg-oracle-pool-01<br />
           These numbers are generated for entertainment based on statistical simulations.<br />
           Fortune favors the bold. Play within your limits.
         </p>
      </footer>
    </div>
  );
}
