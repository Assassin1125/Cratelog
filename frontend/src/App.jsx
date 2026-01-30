import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Form from './components/Form';
import Map from './components/Map';
import Results from './components/Results';

function App() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [view, setView] = useState('landing'); // 'landing' | 'form' | 'results'

  const handleSubmit = async (searchData) => {
    setLoading(true);
    setData(null);
    setFormData(searchData);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://cratelog-1.onrender.com';
      const response = await axios.post(`${API_BASE}/api/calculate/?t=${Date.now()}`, searchData);
      setData(response.data);
      if (response.data) {
        setView('results');
      }
    } catch (err) {
      console.error(err);
      setError('Error calculating trip. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
    transition: { type: "spring", stiffness: 100, damping: 20 }
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* 1. Base Gradient */}
        <div className="absolute inset-0 bg-slate-950"></div>

        {/* 2. Purple Grid with Fade (Vignette) */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            opacity: 0.15,
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)'
          }}
        ></div>

        {/* 3. Ambient Glows (Subtler) */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6 md:py-12">

        {/* Header - Static */}
        <header className="text-center mb-4 space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
            Crate<span className="text-indigo-500">Log</span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto">
            Professional ELD route planning and log generation.
            <br className="hidden md:block" />
            Simplified compliance for modern trucking.
          </p>
        </header>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 flex items-center justify-center gap-3 backdrop-blur-md max-w-2xl mx-auto"
          >
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </motion.div>
        )}

        {/* Main Content Area - Animated Views */}
        <AnimatePresence mode="wait">

          {/* VIEW: LANDING */}
          {view === 'landing' && (
            <motion.div
              key="landing"
              variants={variants}
              initial="initial"
              animate="animate"
              exit={{ x: "-100%", opacity: 0 }} // Slide OUT to Left
              className="w-full flex justify-center"
            >
              <div className="w-full h-[600px] flex flex-col items-center justify-start pt-2 text-center relative z-10">

                <div className="flex flex-col items-center gap-6 mb-10">
                  {/* Truck Icon with Glow */}
                  <div className="relative group shrink-0">
                    <div className="absolute inset-0 bg-indigo-500/60 blur-[60px] rounded-full opacity-100 transition-opacity duration-500 scale-[1.8]"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-tr from-slate-800 to-slate-900 rounded-3xl flex items-center justify-center shadow-2xl border border-slate-700/50 rotate-3 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                      <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                    </div>
                  </div>

                  <div className="text-center max-w-lg">
                    <h3 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">Ready to start?</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">
                      Generate compliant ELD logbooks and calculate optimal trucking routes in seconds.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setView('form')}
                  className="mb-10 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 text-sm"
                >
                  <span>Generate Logs</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                  {/* Stat 1 */}
                  <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1.5 hover:bg-slate-800 transition-colors cursor-default">
                    <span className="text-2xl font-bold text-white font-display">DOT</span>
                    <span className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Fully Compliant</span>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Automatic handling of 30-min breaks & 10-hr resets per FMCSA rules.</p>
                  </div>
                  {/* Stat 2 */}
                  <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1.5 hover:bg-slate-800 transition-colors cursor-default">
                    <span className="text-2xl font-bold text-white font-display">Fast</span>
                    <span className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Smart Routing</span>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Optimized OSRM paths designed specifically for heavy trucking.</p>
                  </div>
                  {/* Stat 3 */}
                  <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1.5 hover:bg-slate-800 transition-colors cursor-default">
                    <span className="text-2xl font-bold text-white font-display">PDF</span>
                    <span className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Print Ready</span>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Instant generation of inspection-ready digital daily log sheets.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW: FORM */}
          {view === 'form' && (
            <motion.div
              key="form"
              variants={variants}
              initial="initial"
              animate="animate"
              exit={{ x: "-100%", opacity: 0 }}
              className="w-full flex justify-center"
            >
              <div className="w-full max-w-2xl">
                <Form onSubmit={handleSubmit} loading={loading} />
                <div className="text-center mt-6">
                  <button onClick={() => setView('landing')} className="text-sm text-slate-500 hover:text-white transition-colors">
                    &larr; Back to Home
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW: RESULTS */}
          {view === 'results' && (
            <motion.div
              key="results"
              variants={variants}
              initial="initial"
              animate="animate"
              exit={{ x: "-100%", opacity: 0 }}
              className="w-full"
            >
              <div className="max-w-7xl mx-auto flex flex-col gap-6">

                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-display font-bold text-white">Trip Results</h2>
                  <button onClick={() => setView('form')} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
                    New Calculation
                  </button>
                </div>

                {loading ? (
                  <div className="h-[600px] flex items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/20 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-6">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
                        </div>
                      </div>
                      <p className="text-slate-400 font-display font-medium animate-pulse tracking-wide">Calculating optimal path...</p>
                    </div>
                  </div>
                ) : data ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/50 relative group">
                      <Map
                        key={Date.now()}
                        geometry1={data.geometry_leg1}
                        geometry2={data.geometry_leg2}
                        stops={data.stops}
                        events={data.events}
                      />
                      <div className="absolute top-6 left-6 pointer-events-none">
                        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-xs font-medium text-white shadow-xl">
                          Wait: {new Date(data.events[0].start).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <Results data={data} driverInfo={formData} />
                  </motion.div>
                ) : (
                  // Fallback if results view is active but no data (e.g., error cleared, or direct navigation)
                  <div className="h-[600px] flex items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/20 backdrop-blur-sm">
                    <p className="text-slate-400">No trip data to display. Please start a new calculation.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}

export default App;
