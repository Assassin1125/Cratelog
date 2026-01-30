import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Popup, Polyline, useMap, CircleMarker, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Utility: Create a robust SVG Triangle Icon
// Points down to the exact coordinate (12, 22)
const createTriangleIcon = (color) => L.divIcon({
    className: 'custom-triangle-marker',
    html: `<svg viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); width: 100%; height: 100%; overflow: visible;">
            <path d="M12 22 L22 2 L2 2 Z" stroke-linejoin="round"/>
           </svg>`,
    iconSize: [28, 28],      // Slightly larger for visibility
    iconAnchor: [14, 28],    // Tip (bottom center) corresponds to coordinate. Width 28 -> center 14. Height 28 -> bottom 28.
    popupAnchor: [0, -30]    // Popup appears above the triangle
});

const startIcon = createTriangleIcon('#22c55e'); // Green
const pickupIcon = createTriangleIcon('#3b82f6'); // Blue
const dropoffIcon = createTriangleIcon('#ef4444'); // Red

function FitBounds({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords && coords.length > 0) {
            map.fitBounds(coords, { padding: [50, 50] });
        }
    }, [coords, map]);
    return null;
}

export default function Map({ geometry1, geometry2, stops, events = [] }) {
    const processGeo = (geo) => {
        if (!geo || !geo.coordinates) return [];
        return geo.coordinates.map(c => [c[1], c[0]]);
    };

    const path1 = processGeo(geometry1);
    const path2 = processGeo(geometry2);
    const allPoints = [...path1, ...path2];
    const center = allPoints.length > 0 ? allPoints[0] : [39.8283, -98.5795];

    // Filter events for special HOS markers
    const safeEvents = Array.isArray(events) ? events : [];
    const specialStops = safeEvents.filter(e => {
        if (!e.coord) return false;
        if (e.type === 'OFF') return true;
        if (e.type === 'SB') return true;
        if (e.type === 'ON' && (e.remarks && e.remarks.includes('Fuel'))) return true;
        return false;
    });

    return (
        <MapContainer center={center} zoom={4} style={{ height: '400px', width: '100%', background: '#0f172a' }}>
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            {path1.length > 0 && <Polyline positions={path1} pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.8 }} />}
            {path2.length > 0 && <Polyline positions={path2} pathOptions={{ color: '#10b981', weight: 4, opacity: 0.8 }} />}

            {/* Start - Green Triangle */}
            {stops?.start && (
                <Marker position={[stops.start.coords[1], stops.start.coords[0]]} icon={startIcon}>
                    <Popup className="font-sans">
                        <div className="font-bold">Start Location</div>
                        <div className="text-xs">{stops.start.name}</div>
                    </Popup>
                </Marker>
            )}

            {/* Pickup - Blue Triangle */}
            {stops?.pickup && (
                <Marker position={[stops.pickup.coords[1], stops.pickup.coords[0]]} icon={pickupIcon}>
                    <Popup className="font-sans">
                        <div className="font-bold">Pickup</div>
                        <div className="text-xs">{stops.pickup.name}</div>
                    </Popup>
                </Marker>
            )}

            {/* Dropoff - Red Triangle */}
            {stops?.dropoff && (
                <Marker position={[stops.dropoff.coords[1], stops.dropoff.coords[0]]} icon={dropoffIcon}>
                    <Popup className="font-sans">
                        <div className="font-bold">Dropoff</div>
                        <div className="text-xs">{stops.dropoff.name}</div>
                    </Popup>
                </Marker>
            )}

            {/* Events - Small Dots */}
            {specialStops.map((evt, idx) => {
                let color = '#3b82f6'; // Default Blue (Break)
                let radius = 6;
                let label = evt.remarks || evt.status;

                if ((evt.remarks && evt.remarks.includes("10-hr")) || evt.type === 'SB') {
                    color = '#8b5cf6'; // Purple (Rest)
                    radius = 8;
                }
                else if ((evt.remarks && evt.remarks.includes("Fuel")) || evt.type === 'ON-FUEL') {
                    color = '#f59e0b'; // Amber (Fuel)
                    radius = 7;
                }

                return (
                    <CircleMarker key={idx} center={[evt.coord[1], evt.coord[0]]} pathOptions={{ color: 'white', fillColor: color, fillOpacity: 1, weight: 2 }} radius={radius}>
                        <Popup className="font-sans">
                            <div className="text-slate-800">
                                <strong className="block text-sm mb-1">{label}</strong>
                                <span className="text-xs text-slate-500">
                                    Time: {new Date(evt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </Popup>
                    </CircleMarker>
                );
            })}

            <FitBounds coords={allPoints} />
        </MapContainer>
    );
}
