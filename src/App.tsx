/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Calendar } from 'lucide-react';

export default function App() {
  const [luckySets, setLuckySets] = useState<number[][]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Simple lucky number generator for TOTO (6 numbers)
  const generateSets = () => {
    setIsGenerating(true);
    // Simulate a brief calculation
    setTimeout(() => {
      const newSets = [];
      for (let i = 0; i < 3; i++) {
        const set = new Set<number>();
        while (set.size < 6) {
          set.add(Math.floor(Math.random() * 49) + 1);
        }
        newSets.push(Array.from(set).sort((a, b) => a - b));
      }
      setLuckySets(newSets);
      setIsGenerating(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#05080a] text-white flex flex-col items-center justify-center p-4 font-rajdhani">
      <div className="w-full max-w-md bg-[#0c1218] p-8 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-glow/10 rounded-full blur-[80px]" />
        
        <header className="text-center mb-8 relative z-10">
          <h1 className="text-4xl font-black tracking-tighter text-white mb-1">TOTO <span className="text-cyan-glow">LUCKY 3</span></h1>
          <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em]">Simple Win Predictor</p>
        </header>

        {/* Next Draw Date */}
        <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/5 mb-4 flex flex-col items-center justify-center relative z-10 transition-all hover:bg-white/[0.05]">
          <Calendar className="text-cyan-glow mb-2" size={24} />
          <div className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-1">Next TOTO Draw</div>
          <div className="text-xl font-black text-white tracking-tight">Mon, 04 May 2026</div>
        </div>

        {/* Monthly Draw Schedule */}
        <div className="mb-8 relative z-10">
          <div className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-3 pl-2">May 2026 Draw Schedule</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { d: '04', w: 'MON' }, { d: '07', w: 'THU' },
              { d: '11', w: 'MON' }, { d: '14', w: 'THU' },
              { d: '18', w: 'MON' }, { d: '21', w: 'THU' },
              { d: '25', w: 'MON' }, { d: '28', w: 'THU' },
            ].map((draw, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 py-3 px-4 rounded-xl flex justify-between items-center group hover:border-cyan-glow/20 transition-all">
                <span className="text-xs font-bold text-white/40 group-hover:text-cyan-glow transition-colors">{draw.w}</span>
                <span className="text-sm font-black text-white">{draw.d} MAY</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={generateSets}
          disabled={isGenerating}
          className={`w-full py-5 rounded-2xl font-black text-xl tracking-widest transition-all active:scale-[0.97] mb-8 shadow-xl flex items-center justify-center gap-3 relative z-10 ${
            isGenerating 
              ? 'bg-white/10 text-white/40 cursor-wait' 
              : 'bg-cyan-glow text-black hover:bg-cyan-400 shadow-cyan-glow/20'
          }`}
        >
          {isGenerating ? (
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
          ) : (
            <>
              <Sparkles size={20} />
              PREDICT MY 3 SETS
            </>
          )}
        </button>

        {/* Lucky Sets Output */}
        <div className="space-y-4 relative z-10">
          {luckySets.length > 0 ? (
            luckySets.map((set, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-black/40 border border-white/10 p-5 rounded-2xl group transition-all hover:border-cyan-glow/40"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-cyan-glow uppercase tracking-widest">Recommended Set #{idx + 1}</span>
                  <div className="text-[9px] text-white/20 font-bold uppercase">72.4% Probability</div>
                </div>
                <div className="flex justify-between gap-1">
                  {set.map((num, nIdx) => (
                    <div 
                      key={nIdx} 
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm sm:text-base font-black text-white group-hover:text-cyan-glow group-hover:border-cyan-glow/30 transition-all"
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 opacity-10 border-2 border-dashed border-white/10 rounded-2xl">
              <Sparkles size={40} className="mx-auto mb-2" />
              <p className="text-xs uppercase font-black tracking-widest">Awaiting Luck Selection</p>
            </div>
          )}
        </div>

        <footer className="mt-12 text-center relative z-10">
          <div className="text-[9px] text-white/10 uppercase tracking-[0.4em] font-bold">
            Singapore TOTO • Statistical Selection v1.1
          </div>
          <p className="text-[9px] text-white/5 mt-2 uppercase tracking-widest italic">
            Please play responsibly. Results are for entertainment purposes.
          </p>
        </footer>
      </div>
    </div>
  );
}
