import requests
import datetime
from datetime import timedelta
from django.conf import settings
import os
from PIL import Image, ImageDraw, ImageFont

OSRM_ROUTE_URL = "http://router.project-osrm.org/route/v1/driving/"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {'User-Agent': 'TruckELDApp/1.0'}

def get_coord_at_distance(geometry, total_distance, target_distance):
    """
    Interpolate coordinates along a LineString geometry based on distance.
    geometry: {'coordinates': [[lon, lat], ...]} (GeoJSON)
    total_distance: meters
    target_distance: meters
    """
    if not geometry or 'coordinates' not in geometry:
        return None
    
    coords = geometry['coordinates']
    if target_distance <= 0:
        return coords[0]
    if target_distance >= total_distance:
        return coords[-1]
    
    # Simple interpolation by index fraction
    # Real OSRM steps would be more accurate but index-based is sufficient for visualization
    # assumption: points are roughly equidistant or dense enough
    
    fraction = target_distance / total_distance
    index = int(fraction * (len(coords) - 1))
    
    return coords[index]

def geocode(location):
    params = {'q': location, 'format': 'json', 'limit': 1}
    try:
        response = requests.get(NOMINATIM_URL, params=params, headers=HEADERS)
        if response.status_code == 200 and response.json():
            data = response.json()[0]
            return (float(data['lon']), float(data['lat'])), data['display_name']
    except Exception as e:
        print(f"Geocode error: {e}")
    return None, None

def get_osrm_route(start_coords, end_coords):
    # start_coords: (lon, lat)
    coords = f"{start_coords[0]},{start_coords[1]};{end_coords[0]},{end_coords[1]}"
    url = f"{OSRM_ROUTE_URL}{coords}?overview=full&geometries=geojson&steps=true"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    return None

def generate_schedule(route_json, start_time_str, pickup_loc, dropoff_loc):
    # Simplified simulation
    # start_time_str expected ISO format or similar. Assume datetime object for now.
    current_time = start_time_str # datetime
    
    events = []
    
    # 1. Pickup (1 hour)
    events.append({
        'type': 'ON',
        'status': 'On Duty',
        'start': current_time,
        'end': current_time + timedelta(hours=1),
        'location': pickup_loc,
        'remarks': 'Pickup'
    })
    current_time += timedelta(hours=1)
    
    # 2. Driving
    routes = route_json.get('routes', [])
    if not routes:
        return []
    
    route = routes[0]
    total_duration_seconds = route['duration']
    total_distance_meters = route['distance']
    
    # Parse steps for granuarity (not managing turn-by-turn for now, just chunking)
    # 11 hours driving max. 
    # Speed assumption: OSRM duration is accurate.
    
    remaining_duration = total_duration_seconds
    
    while remaining_duration > 0:
        # Max drive time in a shift: 11 hours (39600 seconds)
        # But we need to account for breaks if we want to be fancy.
        # Let's do simple chunks of 11 hours max.
        
        drive_chunk = min(remaining_duration, 11 * 3600)
        
        # Check fueling (approx every 1000 miles / 1609 km). 
        # For simplicity, if chunk > 1000 miles, split it. 
        # But here we work with time. 
        # Let's just assume we drive the chunk.
        
        events.append({
            'type': 'D',
            'status': 'Driving',
            'start': current_time,
            'end': current_time + timedelta(seconds=drive_chunk),
            'location': 'En route',
            'remarks': 'Driving'
        })
        current_time += timedelta(seconds=drive_chunk)
        remaining_duration -= drive_chunk
        
        if remaining_duration > 0:
            # Need to rest (10 hours)
            events.append({
                'type': 'SB',
                'status': 'Sleeper Berth',
                'start': current_time,
                'end': current_time + timedelta(hours=10),
                'location': 'Rest Area',
                'remarks': 'Daily Reset'
            })
            current_time += timedelta(hours=10)
            
    # 3. Dropoff (1 hour)
    events.append({
        'type': 'ON',
        'status': 'On Duty',
        'start': current_time,
        'end': current_time + timedelta(hours=1),
        'location': dropoff_loc,
        'remarks': 'Dropoff'
    })
    
    return events

def draw_log_sheet(events, date_str):
    # date_str: YYYY-MM-DD
    # Filter events for this day
    
    template_path = os.path.join(settings.BASE_DIR, 'logbook/templates/log_sheet_template.png')
    
    try:
        img = Image.open(template_path)
    except:
        # Create blank if missing
        img = Image.new('RGB', (1000, 800), 'white')
        
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("Arial.ttf", 15)
    except IOError:
        font = ImageFont.load_default()
    
    # Logic to draw the line on the grid
    # Grid usually: X: 0-24 hours. width approx 80-90% of page.
    # Need to calibrate pixels.
    # For now, I'll just draw a text summary on the image to prove it works
    # realizing detailed grid drawing requires pixel-perfect calibration of the uploaded image.
    
    draw.text((50, 50), f"Log Date: {date_str}", fill="black", font=font)
    
    y = 100
    for e in events:
        # Check if event overlaps with this day
        # Simplified: Just listing functionality
        line = f"{e['start'].strftime('%H:%M')} - {e['end'].strftime('%H:%M')} : {e['status']} ({e['remarks']})"
        draw.text((50, y), line, fill="black", font=font)
        y += 20
        
    # Save to buffer or temp file
    output_filename = f"log_{date_str}.png"
    save_path = os.path.join(settings.MEDIA_ROOT, 'logs', output_filename)
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    img.save(save_path)
    
    return f"logs/{output_filename}"
