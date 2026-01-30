import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Form({ onSubmit, loading }) {
    const [data, setData] = useState({
        start_location: '',
        pickup_location: '',
        dropoff_location: '',
        current_cycle_used: 0,
        driver_id: '',
        co_driver_id: '',
        truck_number: '',
        carrier_name: ''
    });

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(data);
    };

    // Modern, flat input style with subtle borders
    const inputClasses = "w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 placeholder-slate-600 hover:bg-slate-800 hover:border-slate-600 shadow-inner group-hover:bg-slate-800 [&:-webkit-autofill]:shadow-[0_0_0px_1000px_#1e293b_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]";
    const labelClasses = "block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1";

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden"
        >
            {/* Subtle Glow Effect */}
            <div className="absolute top-0 right-0 -m-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>

            <div className="mb-6 relative z-10 text-center">
                <h2 className="text-2xl font-display font-bold text-white mb-1">Trip Settings</h2>
                <p className="text-xs text-slate-400">Configure your route parameters to generate logs.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className={labelClasses}>Carrier</label>
                        <input type="text" name="carrier_name" className={inputClasses} placeholder="Crate Logistics" onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <label className={labelClasses}>Truck #</label>
                        <input type="text" name="truck_number" className={inputClasses} placeholder="Unit 104" onChange={handleChange} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className={labelClasses}>Driver ID</label>
                        <input type="text" name="driver_id" className={inputClasses} placeholder="D-8842" onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <label className={labelClasses}>Co-Driver</label>
                        <input type="text" name="co_driver_id" className={inputClasses} placeholder="Optional" onChange={handleChange} />
                    </div>
                </div>

                <div className="space-y-5 pt-4 border-t border-slate-800/50">
                    <div className="space-y-1">
                        <label className={labelClasses}>Current Location</label>
                        <div className="relative group">
                            <input type="text" name="start_location" className={inputClasses} placeholder="e.g. Dallas, TX" onChange={handleChange} required />
                            <div className="absolute right-3 top-3.5 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className={labelClasses}>Pickup</label>
                            <div className="relative group">
                                <input type="text" name="pickup_location" className={inputClasses} placeholder="e.g. Memphis, TN" onChange={handleChange} required />
                                <div className="absolute right-3 top-3.5 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className={labelClasses}>Dropoff</label>
                            <div className="relative group">
                                <input type="text" name="dropoff_location" className={inputClasses} placeholder="e.g. Chicago, IL" onChange={handleChange} required />
                                <div className="absolute right-3 top-3.5 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <label className={labelClasses}>Hours Used (Cycle)</label>
                    <input type="number" name="current_cycle_used" step="0.1" className={inputClasses} defaultValue={0} onChange={handleChange} />
                </div>

                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-xl font-bold text-white text-sm shadow-lg transition-all relative overflow-hidden group
                        ${loading ? 'bg-slate-800 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25'}
                    `}
                >
                    {/* Button shine effect */}
                    {!loading && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>}

                    {loading ? (
                        <span className="flex items-center justify-center gap-2 opacity-80">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="tracking-wide text-xs uppercase">Processing...</span>
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <span>Launch Route</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </span>
                    )}
                </motion.button>
            </form>
        </motion.div>
    );
}
