import React, { useState } from 'react';
import { Clock, MapPin, Truck, Coffee, CheckCircle, Printer, Calendar, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LogSheet from './LogSheet';

export default function Results({ data, driverInfo }) {
    const { events } = data;
    const [viewMode, setViewMode] = useState('logs'); // logs | schedule

    const logsByDay = React.useMemo(() => {
        const uniqueDates = new Set();
        events.forEach(e => {
            uniqueDates.add(new Date(e.start).toDateString());
            uniqueDates.add(new Date(e.end).toDateString());
        });
        return Array.from(uniqueDates).sort((a, b) => new Date(a) - new Date(b));
    }, [events]);

    return (
        <div className="space-y-8">
            {/* Elegant Tab Switcher */}
            <div className="flex justify-center">
                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-1.5 rounded-xl flex gap-1 shadow-2xl">
                    <button
                        onClick={() => setViewMode('logs')}
                        className={`relative px-6 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-2 overflow-hidden
                            ${viewMode === 'logs' ? 'text-white' : 'text-slate-400 hover:text-white'}
                        `}
                    >
                        {viewMode === 'logs' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-indigo-600 shadow-lg shadow-indigo-500/30"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5" />
                            Log Sheets
                        </span>
                    </button>
                    <button
                        onClick={() => setViewMode('schedule')}
                        className={`relative px-6 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-2 overflow-hidden
                            ${viewMode === 'schedule' ? 'text-white' : 'text-slate-400 hover:text-white'}
                        `}
                    >
                        {viewMode === 'schedule' && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-indigo-600 shadow-lg shadow-indigo-500/30"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            Trip Timeline
                        </span>
                    </button>
                </div>
            </div>

            <AnimatePresence mode='wait'>
                {viewMode === 'logs' ? (
                    <motion.div
                        key="logs"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Print Header */}
                        <div className="flex items-center justify-between bg-slate-900/50 border border-slate-800 p-3 rounded-2xl backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                    <FileText size={16} />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Digital Logbook</h3>
                                    <p className="text-[10px] text-slate-500">{logsByDay.length} Daily Logs Generated</p>
                                </div>
                            </div>
                            <button
                                onClick={() => window.print()}
                                className="group relative px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 overflow-hidden text-xs"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
                                <Printer size={14} />
                                <span>Print All</span>
                            </button>
                        </div>

                        {/* Logs Container */}
                        <div className="max-h-[800px] overflow-y-auto custom-scrollbar space-y-6 pr-2 print-content">
                            {logsByDay.map((dateStr, idx) => (
                                <div key={idx} className="bg-white rounded-xl overflow-hidden shadow-2xl ring-1 ring-slate-200/50 print:ring-0 print:shadow-none print:break-after-page">
                                    <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between print:hidden">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Master Driver Daily Log</span>
                                        </div>
                                        <span className="text-[10px] font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                                            DAY {idx + 1}
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <LogSheet
                                            date={dateStr}
                                            events={events}
                                            driverInfo={driverInfo || {}}
                                            totalMiles={0}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="schedule"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800 overflow-hidden shadow-2xl"
                    >
                        <div className="p-6 border-b border-slate-800/50 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-display font-bold text-white mb-0.5">Trip Itinerary</h2>
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Sequential Event Timeline</p>
                            </div>
                            <div className="flex -space-x-2">
                                {['Start', 'Drive', 'Stop'].map((_, i) => (
                                    <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] text-slate-500">{i + 1}</div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 relative">
                            {/* Vertical Line */}
                            <div className="absolute left-[42px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-indigo-500 via-slate-700 to-slate-800/0"></div>

                            <div className="space-y-6 relative z-10">
                                {events.map((evt, idx) => {
                                    let iconColor = 'bg-slate-800 text-slate-400 border-slate-700';
                                    let Icon = Clock;

                                    if (evt.type === 'D') { iconColor = 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/30'; Icon = Truck; }
                                    if (evt.type === 'SB' || evt.type === 'OFF') { iconColor = 'bg-violet-600 text-white border-violet-500'; Icon = Coffee; }
                                    if (evt.type === 'ON') { iconColor = 'bg-emerald-600 text-white border-emerald-500'; Icon = CheckCircle; }

                                    return (
                                        <div key={idx} className="flex gap-4 group">
                                            {/* Timeline Node */}
                                            <div className={`
                                                relative w-10 h-10 rounded-xl border-[3px] border-slate-900 shadow-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 z-10
                                                ${iconColor}
                                            `}>
                                                <Icon size={16} />
                                            </div>

                                            {/* Content Card */}
                                            <div className="flex-1 bg-slate-800/30 border border-slate-700/50 rounded-xl p-3 hover:bg-slate-800/50 transition-colors">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-bold text-white tracking-tight">{evt.status}</span>
                                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900/50 px-2 py-0.5 rounded border border-slate-700/50">
                                                        {new Date(evt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-slate-400">{evt.remarks}</p>
                                                    {evt.location && (
                                                        <div className="flex items-center gap-1 text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                                                            <MapPin size={10} />
                                                            {evt.location}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
