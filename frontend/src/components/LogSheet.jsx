import React, { useMemo } from 'react';

const GRID_WIDTH = 600;
const GRID_HEIGHT = 160;
const ROW_HEIGHT = 40;
const MARGIN_LEFT = 100;
const MARGIN_TOP = 40;

const STATUS_MAP = {
    'OFF': 0,
    'SB': 1,
    'D': 2,
    'ON': 3
};

const STATUS_LABELS = ['1. OFF DUTY', '2. SLEEPER', '3. DRIVING', '4. ON DUTY'];

export default function LogSheet({ date, events, driverInfo, totalMiles = 0 }) {
    const dayEvents = useMemo(() => {
        const startOfDay = new Date(date).setHours(0, 0, 0, 0);
        const endOfDay = new Date(date).setHours(23, 59, 59, 999);

        return events.map(e => {
            const start = new Date(e.start);
            const end = new Date(e.end);

            let statusKey = 'OFF';
            if (e.type === 'SB') statusKey = 'SB';
            else if (e.type === 'D') statusKey = 'D';
            else if (e.type === 'ON') statusKey = 'ON';

            return {
                ...e,
                startTime: start.getTime(),
                endTime: end.getTime(),
                statusIdx: STATUS_MAP[statusKey]
            };
        }).filter(e => {
            return e.endTime > startOfDay && e.startTime < endOfDay;
        }).map(e => {
            return {
                ...e,
                drawStart: Math.max(e.startTime, startOfDay),
                drawEnd: Math.min(e.endTime, endOfDay)
            };
        }).sort((a, b) => a.drawStart - b.drawStart);
    }, [events, date]);

    const getX = (timestamp) => {
        const startOfDay = new Date(date).setHours(0, 0, 0, 0);
        const ms = timestamp - startOfDay;
        const totalMs = 24 * 60 * 60 * 1000;
        return (ms / totalMs) * GRID_WIDTH;
    };

    const generatePath = () => {
        let path = "";
        if (dayEvents.length === 0) return path;

        let currX = getX(dayEvents[0].drawStart);
        let currY = dayEvents[0].statusIdx * ROW_HEIGHT + (ROW_HEIGHT / 2);

        path += `M ${currX + MARGIN_LEFT} ${currY + MARGIN_TOP} `;

        dayEvents.forEach(e => {
            const startX = getX(e.drawStart);
            const endX = getX(e.drawEnd);
            const y = e.statusIdx * ROW_HEIGHT + (ROW_HEIGHT / 2);

            if (Math.abs(y - currY) > 0.1) path += `L ${startX + MARGIN_LEFT} ${y + MARGIN_TOP} `;
            path += `L ${endX + MARGIN_LEFT} ${y + MARGIN_TOP} `;

            currX = endX;
            currY = y;
        });

        return path;
    };

    const totals = [0, 0, 0, 0];
    let calculatedMiles = 0;

    dayEvents.forEach(e => {
        const durationHours = (e.drawEnd - e.drawStart) / (1000 * 60 * 60);
        totals[e.statusIdx] += durationHours;

        if (e.miles && (e.endTime - e.startTime) > 0) {
            const ratio = (e.drawEnd - e.drawStart) / (e.endTime - e.startTime);
            calculatedMiles += (e.miles * ratio);
        }
    });

    return (
        <div style={{ fontFamily: 'Inter, sans-serif', width: '800px', margin: '0 auto', background: 'white', color: 'black', padding: '20px' }}>
            {/* Header */}
            <div style={{ borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px' }}>DRIVER'S DAILY LOG</div>
                    <div style={{ fontSize: '12px', fontWeight: '500', color: '#444' }}>{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ borderBottom: '1px solid #ddd', paddingBottom: '2px' }}>
                            <span style={{ fontWeight: 'bold', color: '#666', marginRight: '8px' }}>DRIVER ID:</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{driverInfo.driver_id || '___________'}</span>
                        </div>
                        <div style={{ borderBottom: '1px solid #ddd', paddingBottom: '2px' }}>
                            <span style={{ fontWeight: 'bold', color: '#666', marginRight: '8px' }}>CO-DRIVER:</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{driverInfo.co_driver_id || 'N/A'}</span>
                        </div>
                        <div style={{ borderBottom: '1px solid #ddd', paddingBottom: '2px' }}>
                            <span style={{ fontWeight: 'bold', color: '#666', marginRight: '8px' }}>CARRIER:</span>
                            <span style={{ fontWeight: 'bold' }}>{driverInfo.carrier_name || '___________'}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ borderBottom: '1px solid #ddd', paddingBottom: '2px' }}>
                            <span style={{ fontWeight: 'bold', color: '#666', marginRight: '8px' }}>TRUCK #:</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{driverInfo.truck_number || '___________'}</span>
                        </div>
                        <div style={{ borderBottom: '1px solid #ddd', paddingBottom: '2px' }}>
                            <span style={{ fontWeight: 'bold', color: '#666', marginRight: '8px' }}>TOTAL MILES:</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{Math.round(calculatedMiles)} mi</span>
                        </div>
                        <div style={{ borderBottom: '1px solid #ddd', paddingBottom: '2px' }}>
                            <span style={{ fontWeight: 'bold', color: '#666', marginRight: '8px' }}>HEAD OFFICE:</span>
                            <span>123 Logistics Way, NY</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div style={{ position: 'relative', height: '230px', margin: '20px 0' }}>
                <svg width="800" height="220" style={{ overflow: 'visible' }}>
                    <defs>
                        <pattern id="grid" width={GRID_WIDTH / 24} height={GRID_HEIGHT} patternUnits="userSpaceOnUse">
                            <line x1={GRID_WIDTH / 24} y1="0" x2={GRID_WIDTH / 24} y2={GRID_HEIGHT} stroke="#e5e7eb" strokeWidth="1" />
                        </pattern>
                    </defs>

                    {/* Background Grid */}
                    {STATUS_LABELS.map((label, i) => (
                        <g key={i}>
                            <rect
                                x={MARGIN_LEFT}
                                y={MARGIN_TOP + (i * ROW_HEIGHT)}
                                width={GRID_WIDTH}
                                height={ROW_HEIGHT}
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="1"
                            />
                            <text x="10" y={MARGIN_TOP + (i * ROW_HEIGHT) + (ROW_HEIGHT / 2) + 4} fontSize="10" fontWeight="600" fill="#374151" style={{ textTransform: 'uppercase' }}>{label}</text>

                            {/* Summary Box */}
                            <rect
                                x={MARGIN_LEFT + GRID_WIDTH + 15}
                                y={MARGIN_TOP + (i * ROW_HEIGHT) + 5}
                                width="50"
                                height="30"
                                rx="4"
                                fill="#f3f4f6"
                            />
                            <text x={MARGIN_LEFT + GRID_WIDTH + 40} y={MARGIN_TOP + (i * ROW_HEIGHT) + (ROW_HEIGHT / 2) + 5} fontSize="12" fontWeight="bold" textAnchor="middle" fill="#1f2937">
                                {totals[i].toFixed(1)}
                            </text>
                        </g>
                    ))}

                    {/* Vertical Quarter Lines */}
                    {Array.from({ length: 25 }).map((_, i) => (
                        <line
                            key={i}
                            x1={MARGIN_LEFT + (i * (GRID_WIDTH / 24))}
                            y1={MARGIN_TOP}
                            x2={MARGIN_LEFT + (i * (GRID_WIDTH / 24))}
                            y2={MARGIN_TOP + GRID_HEIGHT}
                            stroke="#d1d5db"
                            strokeWidth={i % 4 === 0 ? 1.5 : 0.5}
                            strokeDasharray={i % 4 === 0 ? "" : "2,2"}
                        />
                    ))}

                    {/* Time Labels */}
                    {Array.from({ length: 24 }).map((_, i) => (
                        <text key={i} x={MARGIN_LEFT + (i * (GRID_WIDTH / 24))} y={MARGIN_TOP - 8} fontSize="9" textAnchor="middle" fill="#6b7280" fontWeight="500">
                            {i}
                        </text>
                    ))}

                    {/* Data Line */}
                    <path d={generatePath()} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

                    {/* Points */}
                    {dayEvents.map((e, idx) => {
                        const cx = getX(e.drawStart) + MARGIN_LEFT;
                        const cy = e.statusIdx * ROW_HEIGHT + (ROW_HEIGHT / 2) + MARGIN_TOP;
                        return <circle key={idx} cx={cx} cy={cy} r="3" fill="#2563eb" stroke="white" strokeWidth="1.5" />
                    })}
                </svg>
            </div>

            {/* Remarks */}
            <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Remarks & Annotations</div>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '4px', minHeight: '100px', padding: '12px' }}>
                    {dayEvents.map((e, i) => (
                        <div key={i} style={{ marginBottom: '6px', fontSize: '11px', display: 'flex', gap: '8px' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#1f2937' }}>
                                {new Date(e.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                            <span style={{ fontWeight: '600', color: '#4b5563' }}>{e.location}:</span>
                            <span style={{ color: '#6b7280' }}>{e.remarks}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9ca3af' }}>
                <span>Generated by TruckELD Pro System</span>
                <span>I certify that these entries are true and correct.  ___________________________________</span>
            </div>
        </div>
    );
}
