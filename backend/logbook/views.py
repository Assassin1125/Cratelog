from rest_framework.views import APIView
from rest_framework.response import Response
from .utils import geocode, get_osrm_route, generate_schedule, draw_log_sheet, get_coord_at_distance
from datetime import datetime, timedelta

class CalculateTripView(APIView):
    def post(self, request):
        start_loc = request.data.get('start_location')
        pickup_loc = request.data.get('pickup_location')
        dropoff_loc = request.data.get('dropoff_location')
        cycle_used = float(request.data.get('current_cycle_used', 0))
        
        # Geocode
        start_coords, start_name = geocode(start_loc)
        pickup_coords, pickup_name = geocode(pickup_loc)
        dropoff_coords, dropoff_name = geocode(dropoff_loc)
        
        if not (start_coords and pickup_coords and dropoff_coords):
            return Response({"error": "Could not geocode one or more locations. Please check inputs."}, status=400)
        
        # Route Leg 1: Current -> Pickup
        route1 = get_osrm_route(start_coords, pickup_coords)
        # Route Leg 2: Pickup -> Dropoff
        route2 = get_osrm_route(pickup_coords, dropoff_coords)
        
        if not (route1 and route2):
             return Response({"error": "Could not calculate route"}, status=500)
             
        # Combine Geometries for Map
        # Flatten simple simulation
        
        current_time = datetime.now()
        events = []
        
        # Shared State Counters
        drive_since_break = 0 # limit 8 hours
        drive_since_daily_reset = 0 # limit 11 hours
        dist_since_fuel = 0 # limit 1000 miles
        
        # Define Legs to process uniformly
        trip_legs = [
            {'route': route1, 'name': 'To Pickup', 'geometry': route1['routes'][0]['geometry']},
            {'route': route2, 'name': 'To Dropoff', 'geometry': route2['routes'][0]['geometry']}
        ]
        
        for i, leg in enumerate(trip_legs):
            r_data = leg['route']['routes'][0]
            leg_duration = r_data['duration']
            leg_distance = r_data['distance']
            leg_geometry = leg['geometry']
            
            print(f"DEBUG: Starting Leg {i+1} ({leg['name']}). Duration: {leg_duration}s")
            
            remaining_time = leg_duration
            covered_dist = 0
            avg_speed_mps = leg_distance / leg_duration if leg_duration > 0 else 0
            
            while remaining_time > 0:
                time_to_8h = 28800 - drive_since_break
                time_to_11h = 39600 - drive_since_daily_reset
                dist_to_fuel = 1609344 - dist_since_fuel
                time_to_fuel = dist_to_fuel / avg_speed_mps if avg_speed_mps > 0 else 999999
                
                dt = min(remaining_time, time_to_8h, time_to_11h, time_to_fuel)
                
                if dt < 1:
                    coord = get_coord_at_distance(leg_geometry, leg_distance, covered_dist)
                    
                    if time_to_11h <= 1:
                        events.append({
                            'type': 'SB', 'status': 'Sleeper Berth',
                            'start': current_time,
                            'end': current_time + timedelta(hours=10),
                            'location': 'Rest Stop', 'remarks': '10-hr Off Duty Reset',
                            'coord': coord
                        })
                        current_time += timedelta(hours=10)
                        drive_since_daily_reset = 0
                        drive_since_break = 0
                        
                    elif time_to_fuel <= 1:
                         events.append({
                            'type': 'ON', 'status': 'On Duty',
                            'start': current_time,
                            'end': current_time + timedelta(minutes=15),
                            'location': 'Gas Station', 'remarks': 'Fuel Stop',
                            'coord': coord
                        })
                         current_time += timedelta(minutes=15)
                         dist_since_fuel = 0
                         
                    elif time_to_8h <= 1:
                        events.append({
                            'type': 'OFF', 'status': 'Off Duty',
                            'start': current_time,
                            'end': current_time + timedelta(minutes=30),
                            'location': 'Rest Area', 'remarks': '30-min Break',
                            'coord': coord
                        })
                        current_time += timedelta(minutes=30)
                        drive_since_break = 0
                    
                    continue

                # Drive for dt
                dd = dt * avg_speed_mps
                events.append({
                    'type': 'D', 'status': 'Driving',
                    'start': current_time,
                    'end': current_time + timedelta(seconds=dt),
                    'location': 'En route', 'remarks': 'Driving',
                    'miles': dd * 0.000621371
                })
                
                current_time += timedelta(seconds=dt)
                remaining_time -= dt
                covered_dist += dd
                drive_since_break += dt
                drive_since_daily_reset += dt
                dist_since_fuel += dd

            # End of Leg Actions
            if i == 0: # After Leg 1 -> Pickup
                events.append({
                    'type': 'ON', 'status': 'On Duty', 
                    'start': current_time, 
                    'end': current_time + timedelta(hours=1), 
                    'location': pickup_name, 'remarks': 'Pickup',
                    'coord': pickup_coords
                })
                current_time += timedelta(hours=1)
                # Note: Pickup is On Duty, so it does NOT reset drive clocks
            
            elif i == 1: # After Leg 2 -> Dropoff
                events.append({
                    'type': 'ON', 'status': 'On Duty', 
                    'start': current_time, 
                    'end': current_time + timedelta(hours=1), 
                    'location': dropoff_name, 'remarks': 'Dropoff',
                    'coord': dropoff_coords
                })
        
        # Generate Logs
        # Identify unique days
        unique_days = sorted(list(set([e['start'].date() for e in events])))
        logs_generated = []
        
        for day in unique_days:
            day_events = [e for e in events if e['start'].date() == day or e['end'].date() == day]
            url = draw_log_sheet(day_events, day.strftime('%Y-%m-%d'))
            logs_generated.append(url)

        return Response({
            "geometry_leg1": route1['routes'][0]['geometry'],
            "geometry_leg2": route2['routes'][0]['geometry'],
            "stops": {
                "start": {"coords": start_coords, "name": start_name},
                "pickup": {"coords": pickup_coords, "name": pickup_name},
                "dropoff": {"coords": dropoff_coords, "name": dropoff_name},
            },
            "events": events,
            "logs": logs_generated
        })
