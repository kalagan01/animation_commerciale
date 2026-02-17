// GPS Route Optimization API
// Utilise Mapbox Directions API pour optimisation d'itinéraires
// Version: 1.0.0
// Date: 14 février 2026

import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  MAPBOX_ACCESS_TOKEN: string;
};

const app = new Hono<{ Bindings: Bindings }>();
app.use('*', cors());

// Types
interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  priority?: 'high' | 'medium' | 'low';
  estimated_duration?: number; // minutes
  opening_hours?: string;
  closing_hours?: string;
}

interface RouteOptimizationRequest {
  animator_id: string;
  start_location: { latitude: number; longitude: number };
  end_location?: { latitude: number; longitude: number };
  waypoints: Location[];
  optimization_criteria: 'time' | 'distance' | 'priority' | 'balanced';
  departure_time?: string; // ISO 8601
  avoid_traffic?: boolean;
  max_route_duration?: number; // minutes
}

interface OptimizedRoute {
  route_id: string;
  animator_id: string;
  total_distance: number; // meters
  total_duration: number; // seconds
  total_visits: number;
  ordered_waypoints: Location[];
  geometry: string; // GeoJSON LineString
  legs: RouteLeg[];
  optimization_score: number;
  estimated_fuel_cost: number; // MAD
  created_at: string;
}

interface RouteLeg {
  from: Location;
  to: Location;
  distance: number; // meters
  duration: number; // seconds
  instructions: string[];
  geometry: string; // GeoJSON LineString
}

interface GPSTrackingPoint {
  animator_id: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number; // meters
  speed?: number; // km/h
  heading?: number; // degrees
  timestamp: string;
}

interface RouteDeviation {
  route_id: string;
  deviation_distance: number; // meters
  deviation_time: number; // seconds
  recommended_action: 'continue' | 'recalculate' | 'alert';
  alternative_route?: OptimizedRoute;
}

// ==================== ENDPOINTS ====================

/**
 * POST /api/gps/routes/optimize
 * Calcule l'itinéraire optimisé pour une tournée de visites
 */
app.post('/api/gps/routes/optimize', async (c) => {
  try {
    const request: RouteOptimizationRequest = await c.req.json();
    const mapboxToken = c.env.MAPBOX_ACCESS_TOKEN;

    // Validation
    if (!request.animator_id || !request.start_location || !request.waypoints?.length) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    if (request.waypoints.length > 25) {
      return c.json({ error: 'Maximum 25 waypoints allowed' }, 400);
    }

    // 1. Optimiser l'ordre des waypoints selon critère
    const optimizedWaypoints = await optimizeWaypointOrder(
      request.waypoints,
      request.optimization_criteria
    );

    // 2. Construire les coordonnées pour Mapbox
    const coordinates = [
      [request.start_location.longitude, request.start_location.latitude],
      ...optimizedWaypoints.map(wp => [wp.longitude, wp.latitude]),
    ];

    // Si end_location est spécifié, l'ajouter
    if (request.end_location) {
      coordinates.push([request.end_location.longitude, request.end_location.latitude]);
    }

    // 3. Appel Mapbox Directions API (Optimized)
    const mapboxUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates.map(c => c.join(',')).join(';')}`;
    const mapboxParams = new URLSearchParams({
      access_token: mapboxToken,
      geometries: 'geojson',
      steps: 'true',
      overview: 'full',
      annotations: 'distance,duration',
      language: 'fr',
    });

    const mapboxResponse = await fetch(`${mapboxUrl}?${mapboxParams.toString()}`);
    const mapboxData = await mapboxResponse.json();

    if (mapboxData.code !== 'Ok' || !mapboxData.routes?.length) {
      return c.json({ error: 'Route calculation failed', details: mapboxData }, 500);
    }

    const route = mapboxData.routes[0];

    // 4. Construire les legs détaillés
    const legs: RouteLeg[] = route.legs.map((leg: any, index: number) => {
      const from = index === 0 
        ? { id: 'start', name: 'Point de départ', ...request.start_location }
        : optimizedWaypoints[index - 1];
      const to = index < optimizedWaypoints.length 
        ? optimizedWaypoints[index] 
        : (request.end_location ? { id: 'end', name: 'Point d\'arrivée', ...request.end_location } : optimizedWaypoints[index - 1]);

      const instructions = leg.steps?.map((step: any) => step.maneuver.instruction) || [];

      return {
        from,
        to,
        distance: leg.distance,
        duration: leg.duration,
        instructions,
        geometry: JSON.stringify(leg.geometry),
      };
    });

    // 5. Calculer score d'optimisation et coût carburant
    const optimizationScore = calculateOptimizationScore(
      route.distance,
      route.duration,
      optimizedWaypoints,
      request.optimization_criteria
    );

    const fuelCost = calculateFuelCost(route.distance); // MAD

    // 6. Créer l'objet route optimisé
    const optimizedRoute: OptimizedRoute = {
      route_id: crypto.randomUUID(),
      animator_id: request.animator_id,
      total_distance: route.distance,
      total_duration: route.duration,
      total_visits: optimizedWaypoints.length,
      ordered_waypoints: optimizedWaypoints,
      geometry: JSON.stringify(route.geometry),
      legs,
      optimization_score: optimizationScore,
      estimated_fuel_cost: fuelCost,
      created_at: new Date().toISOString(),
    };

    // 7. Sauvegarder dans Supabase
    const supabaseUrl = c.env.SUPABASE_URL;
    const supabaseKey = c.env.SUPABASE_ANON_KEY;

    await fetch(`${supabaseUrl}/rest/v1/gps_routes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        route_id: optimizedRoute.route_id,
        animator_id: optimizedRoute.animator_id,
        total_distance: optimizedRoute.total_distance,
        total_duration: optimizedRoute.total_duration,
        total_visits: optimizedRoute.total_visits,
        ordered_waypoints: optimizedRoute.ordered_waypoints,
        geometry: optimizedRoute.geometry,
        legs: optimizedRoute.legs,
        optimization_score: optimizedRoute.optimization_score,
        estimated_fuel_cost: optimizedRoute.estimated_fuel_cost,
        status: 'planned',
        created_at: optimizedRoute.created_at,
      }),
    });

    return c.json({
      success: true,
      route: optimizedRoute,
      summary: {
        total_distance_km: (route.distance / 1000).toFixed(2),
        total_duration_minutes: Math.round(route.duration / 60),
        total_visits: optimizedWaypoints.length,
        optimization_score: optimizationScore.toFixed(2),
        estimated_fuel_cost_mad: fuelCost.toFixed(2),
      },
    });

  } catch (error: any) {
    console.error('Route optimization error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * POST /api/gps/tracking/update
 * Enregistre un point GPS de tracking en temps réel
 */
app.post('/api/gps/tracking/update', async (c) => {
  try {
    const trackingPoint: GPSTrackingPoint = await c.req.json();

    // Validation
    if (!trackingPoint.animator_id || !trackingPoint.latitude || !trackingPoint.longitude) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Sauvegarder dans Supabase
    const supabaseUrl = c.env.SUPABASE_URL;
    const supabaseKey = c.env.SUPABASE_ANON_KEY;

    await fetch(`${supabaseUrl}/rest/v1/gps_tracking_points`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        animator_id: trackingPoint.animator_id,
        latitude: trackingPoint.latitude,
        longitude: trackingPoint.longitude,
        altitude: trackingPoint.altitude,
        accuracy: trackingPoint.accuracy,
        speed: trackingPoint.speed,
        heading: trackingPoint.heading,
        timestamp: trackingPoint.timestamp || new Date().toISOString(),
      }),
    });

    return c.json({ success: true, message: 'GPS position updated' });

  } catch (error: any) {
    console.error('GPS tracking error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * GET /api/gps/tracking/:animatorId/history
 * Récupère l'historique GPS d'un animateur
 */
app.get('/api/gps/tracking/:animatorId/history', async (c) => {
  try {
    const animatorId = c.req.param('animatorId');
    const startDate = c.req.query('start_date') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = c.req.query('end_date') || new Date().toISOString();

    const supabaseUrl = c.env.SUPABASE_URL;
    const supabaseKey = c.env.SUPABASE_ANON_KEY;

    const response = await fetch(
      `${supabaseUrl}/rest/v1/gps_tracking_points?animator_id=eq.${animatorId}&timestamp=gte.${startDate}&timestamp=lte.${endDate}&order=timestamp.asc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const trackingPoints = await response.json();

    // Calculer statistiques
    const stats = calculateTrackingStats(trackingPoints);

    return c.json({
      success: true,
      animator_id: animatorId,
      period: { start: startDate, end: endDate },
      total_points: trackingPoints.length,
      tracking_points: trackingPoints,
      statistics: stats,
    });

  } catch (error: any) {
    console.error('GPS history error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * POST /api/gps/routes/:routeId/check-deviation
 * Vérifie si l'animateur dévie de l'itinéraire planifié
 */
app.post('/api/gps/routes/:routeId/check-deviation', async (c) => {
  try {
    const routeId = c.req.param('routeId');
    const { current_position } = await c.req.json();

    if (!current_position?.latitude || !current_position?.longitude) {
      return c.json({ error: 'Missing current position' }, 400);
    }

    // Récupérer la route planifiée
    const supabaseUrl = c.env.SUPABASE_URL;
    const supabaseKey = c.env.SUPABASE_ANON_KEY;

    const routeResponse = await fetch(
      `${supabaseUrl}/rest/v1/gps_routes?route_id=eq.${routeId}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const routes = await routeResponse.json();
    if (!routes?.length) {
      return c.json({ error: 'Route not found' }, 404);
    }

    const route = routes[0];
    const geometry = JSON.parse(route.geometry);

    // Calculer distance minimale à la route
    const deviation = calculateDeviationFromRoute(
      current_position,
      geometry.coordinates
    );

    // Seuil de déviation : 500 mètres
    const deviationThreshold = 500; // meters
    let recommendedAction: 'continue' | 'recalculate' | 'alert' = 'continue';

    if (deviation.distance > deviationThreshold) {
      recommendedAction = deviation.distance > 1000 ? 'alert' : 'recalculate';
    }

    const deviationResult: RouteDeviation = {
      route_id: routeId,
      deviation_distance: deviation.distance,
      deviation_time: 0, // TODO: calculer temps de déviation
      recommended_action: recommendedAction,
    };

    // Si déviation importante, recalculer itinéraire alternatif
    if (recommendedAction === 'recalculate') {
      // TODO: Appeler optimize avec position actuelle comme start
      deviationResult.alternative_route = undefined; // Placeholder
    }

    // Enregistrer déviation
    await fetch(`${supabaseUrl}/rest/v1/gps_route_deviations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        route_id: routeId,
        animator_id: route.animator_id,
        deviation_distance: deviation.distance,
        current_position,
        recommended_action: recommendedAction,
        detected_at: new Date().toISOString(),
      }),
    });

    return c.json({
      success: true,
      deviation: deviationResult,
      is_on_route: deviation.distance <= deviationThreshold,
      deviation_distance_meters: deviation.distance.toFixed(0),
      nearest_point_on_route: deviation.nearest_point,
    });

  } catch (error: any) {
    console.error('Deviation check error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * GET /api/gps/routes/:animatorId
 * Liste toutes les routes d'un animateur
 */
app.get('/api/gps/routes/:animatorId', async (c) => {
  try {
    const animatorId = c.req.param('animatorId');
    const status = c.req.query('status'); // planned, active, completed, cancelled
    const limit = parseInt(c.req.query('limit') || '50');

    const supabaseUrl = c.env.SUPABASE_URL;
    const supabaseKey = c.env.SUPABASE_ANON_KEY;

    let url = `${supabaseUrl}/rest/v1/gps_routes?animator_id=eq.${animatorId}&order=created_at.desc&limit=${limit}`;
    if (status) {
      url += `&status=eq.${status}`;
    }

    const response = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    const routes = await response.json();

    return c.json({
      success: true,
      animator_id: animatorId,
      total_routes: routes.length,
      routes: routes.map((r: any) => ({
        route_id: r.route_id,
        total_distance_km: (r.total_distance / 1000).toFixed(2),
        total_duration_minutes: Math.round(r.total_duration / 60),
        total_visits: r.total_visits,
        optimization_score: r.optimization_score,
        estimated_fuel_cost: r.estimated_fuel_cost,
        status: r.status,
        created_at: r.created_at,
        started_at: r.started_at,
        completed_at: r.completed_at,
      })),
    });

  } catch (error: any) {
    console.error('Routes list error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * PUT /api/gps/routes/:routeId/status
 * Met à jour le statut d'une route (démarrer, terminer, annuler)
 */
app.put('/api/gps/routes/:routeId/status', async (c) => {
  try {
    const routeId = c.req.param('routeId');
    const { status } = await c.req.json();

    if (!['planned', 'active', 'completed', 'cancelled'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }

    const supabaseUrl = c.env.SUPABASE_URL;
    const supabaseKey = c.env.SUPABASE_ANON_KEY;

    const updateData: any = { status };
    if (status === 'active') updateData.started_at = new Date().toISOString();
    if (status === 'completed') updateData.completed_at = new Date().toISOString();

    await fetch(`${supabaseUrl}/rest/v1/gps_routes?route_id=eq.${routeId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(updateData),
    });

    return c.json({ success: true, message: `Route status updated to ${status}` });

  } catch (error: any) {
    console.error('Route status update error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Optimise l'ordre des waypoints selon le critère choisi
 */
async function optimizeWaypointOrder(
  waypoints: Location[],
  criteria: 'time' | 'distance' | 'priority' | 'balanced'
): Promise<Location[]> {
  // Algorithme simple : tri par priorité puis proximité
  // Pour production, utiliser TSP (Traveling Salesman Problem) solver

  if (criteria === 'priority') {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    return waypoints.sort((a, b) => {
      const aPrio = priorityOrder[a.priority || 'medium'];
      const bPrio = priorityOrder[b.priority || 'medium'];
      return aPrio - bPrio;
    });
  }

  // Pour time/distance/balanced, retourner ordre original
  // Mapbox Optimization API peut réordonner automatiquement
  return waypoints;
}

/**
 * Calcule le score d'optimisation (0-100)
 */
function calculateOptimizationScore(
  distance: number,
  duration: number,
  waypoints: Location[],
  criteria: string
): number {
  // Score basé sur efficacité (moins de distance/temps = meilleur score)
  const avgDistancePerVisit = distance / waypoints.length;
  const avgTimePerVisit = duration / waypoints.length;

  // Normalisation : 10 km et 20 min par visite = score 70
  const distanceScore = Math.max(0, 100 - (avgDistancePerVisit / 10000) * 30);
  const timeScore = Math.max(0, 100 - (avgTimePerVisit / 1200) * 30);

  const score = (distanceScore + timeScore) / 2;
  return Math.min(100, Math.max(0, score));
}

/**
 * Calcule le coût carburant estimé (MAD)
 * Prix gasoil Maroc : ~12 MAD/litre
 * Consommation moyenne : 7 L/100km
 */
function calculateFuelCost(distanceMeters: number): number {
  const distanceKm = distanceMeters / 1000;
  const fuelPricePerLiter = 12; // MAD
  const consumptionPer100Km = 7; // liters
  const fuelUsed = (distanceKm / 100) * consumptionPer100Km;
  return fuelUsed * fuelPricePerLiter;
}

/**
 * Calcule statistiques de tracking
 */
function calculateTrackingStats(trackingPoints: GPSTrackingPoint[]): any {
  if (!trackingPoints.length) {
    return {
      total_distance_km: 0,
      max_speed_kmh: 0,
      avg_speed_kmh: 0,
      total_duration_hours: 0,
    };
  }

  let totalDistance = 0;
  let maxSpeed = 0;
  let speeds: number[] = [];

  for (let i = 1; i < trackingPoints.length; i++) {
    const prev = trackingPoints[i - 1];
    const curr = trackingPoints[i];

    // Distance entre deux points (formule haversine simplifiée)
    const distance = calculateDistance(
      prev.latitude,
      prev.longitude,
      curr.latitude,
      curr.longitude
    );
    totalDistance += distance;

    if (curr.speed) {
      maxSpeed = Math.max(maxSpeed, curr.speed);
      speeds.push(curr.speed);
    }
  }

  const avgSpeed = speeds.length ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;

  const firstTime = new Date(trackingPoints[0].timestamp).getTime();
  const lastTime = new Date(trackingPoints[trackingPoints.length - 1].timestamp).getTime();
  const durationHours = (lastTime - firstTime) / (1000 * 60 * 60);

  return {
    total_distance_km: (totalDistance / 1000).toFixed(2),
    max_speed_kmh: maxSpeed.toFixed(1),
    avg_speed_kmh: avgSpeed.toFixed(1),
    total_duration_hours: durationHours.toFixed(2),
  };
}

/**
 * Calcule la distance entre deux coordonnées GPS (en mètres)
 * Formule Haversine
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Rayon de la Terre en mètres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calcule la déviation par rapport à une route
 */
function calculateDeviationFromRoute(
  currentPosition: { latitude: number; longitude: number },
  routeCoordinates: [number, number][]
): { distance: number; nearest_point: { latitude: number; longitude: number } } {
  let minDistance = Infinity;
  let nearestPoint = { latitude: 0, longitude: 0 };

  // Trouver le point le plus proche sur la route
  for (const coord of routeCoordinates) {
    const distance = calculateDistance(
      currentPosition.latitude,
      currentPosition.longitude,
      coord[1], // latitude
      coord[0]  // longitude
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestPoint = { latitude: coord[1], longitude: coord[0] };
    }
  }

  return { distance: minDistance, nearest_point: nearestPoint };
}

export default app;
