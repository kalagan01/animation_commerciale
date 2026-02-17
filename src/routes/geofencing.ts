// Automatic Geofencing System API
// Détection automatique entrée/sortie zones géographiques
// Version: 1.0.0
// Date: 14 février 2026

import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();
app.use('*', cors());

// Types
interface GeofenceZone {
  zone_id: string;
  name: string;
  type: 'partner' | 'territory' | 'custom';
  center_latitude: number;
  center_longitude: number;
  radius_meters: number; // rayon du périmètre
  polygon?: Array<{ lat: number; lng: number }>; // optionnel : forme polygone
  partner_id?: string;
  territory_id?: string;
  trigger_on_entry: boolean;
  trigger_on_exit: boolean;
  trigger_on_dwell: boolean;
  dwell_time_seconds?: number; // temps de présence minimum pour déclencher
  active: boolean;
  metadata?: any;
}

interface GeofenceEvent {
  event_id: string;
  zone_id: string;
  animator_id: string;
  event_type: 'entry' | 'exit' | 'dwell';
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
  duration_seconds?: number; // pour dwell events
  triggered_action?: string; // action déclenchée (notification, badge, points, etc.)
}

interface CheckGeofenceRequest {
  animator_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
}

interface GeofenceStatus {
  zone_id: string;
  zone_name: string;
  is_inside: boolean;
  distance_to_center: number; // meters
  entry_timestamp?: string;
  duration_seconds?: number;
}

// ==================== ENDPOINTS ====================

/**
 * POST /api/geofencing/check
 * Vérifie si l'animateur est entré/sorti d'une zone géofence
 */
app.post('/api/geofencing/check', async (c) => {
  try {
    const request: CheckGeofenceRequest = await c.req.json();
    
    if (!request.animator_id || !request.latitude || !request.longitude) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const supabaseUrl = c.env.SUPABASE_URL;
    const supabaseKey = c.env.SUPABASE_ANON_KEY;
    
    // 1. Récupérer toutes les zones actives
    const zonesResponse = await fetch(
      `${supabaseUrl}/rest/v1/geofence_zones?active=eq.true&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );
    
    const zones: GeofenceZone[] = await zonesResponse.json();
    
    // 2. Récupérer le dernier état de l'animateur pour chaque zone
    const statusResponse = await fetch(
      `${supabaseUrl}/rest/v1/geofence_animator_status?animator_id=eq.${request.animator_id}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );
    
    const previousStatuses = await statusResponse.json();
    const previousStatusMap = new Map(
      previousStatuses.map((s: any) => [s.zone_id, s])
    );
    
    // 3. Vérifier chaque zone
    const currentStatuses: GeofenceStatus[] = [];
    const triggeredEvents: GeofenceEvent[] = [];
    
    for (const zone of zones) {
      const distance = calculateDistance(
        request.latitude,
        request.longitude,
        zone.center_latitude,
        zone.center_longitude
      );
      
      const isInside = distance <= zone.radius_meters;
      const previousStatus = previousStatusMap.get(zone.zone_id);
      const wasInside = previousStatus?.is_inside || false;
      
      // Détecter événement (entry/exit)
      if (isInside && !wasInside && zone.trigger_on_entry) {
        // Événement : ENTRY
        const event: GeofenceEvent = {
          event_id: crypto.randomUUID(),
          zone_id: zone.zone_id,
          animator_id: request.animator_id,
          event_type: 'entry',
          latitude: request.latitude,
          longitude: request.longitude,
          accuracy: request.accuracy,
          timestamp: request.timestamp || new Date().toISOString(),
        };
        
        triggeredEvents.push(event);
        
        // Enregistrer l'événement
        await saveGeofenceEvent(event, supabaseUrl, supabaseKey);
        
        // Déclencher actions automatiques
        await triggerAutomaticActions(event, zone, c.env);
      }
      
      if (!isInside && wasInside && zone.trigger_on_exit) {
        // Événement : EXIT
        const entryTime = previousStatus?.entry_timestamp 
          ? new Date(previousStatus.entry_timestamp).getTime()
          : Date.now();
        const exitTime = request.timestamp 
          ? new Date(request.timestamp).getTime()
          : Date.now();
        const durationSeconds = Math.round((exitTime - entryTime) / 1000);
        
        const event: GeofenceEvent = {
          event_id: crypto.randomUUID(),
          zone_id: zone.zone_id,
          animator_id: request.animator_id,
          event_type: 'exit',
          latitude: request.latitude,
          longitude: request.longitude,
          accuracy: request.accuracy,
          timestamp: request.timestamp || new Date().toISOString(),
          duration_seconds: durationSeconds,
        };
        
        triggeredEvents.push(event);
        
        // Enregistrer l'événement
        await saveGeofenceEvent(event, supabaseUrl, supabaseKey);
        
        // Déclencher actions automatiques
        await triggerAutomaticActions(event, zone, c.env);
      }
      
      // Vérifier dwell (présence prolongée)
      if (isInside && wasInside && zone.trigger_on_dwell && zone.dwell_time_seconds) {
        const entryTime = previousStatus?.entry_timestamp 
          ? new Date(previousStatus.entry_timestamp).getTime()
          : Date.now();
        const currentTime = request.timestamp 
          ? new Date(request.timestamp).getTime()
          : Date.now();
        const dwellSeconds = Math.round((currentTime - entryTime) / 1000);
        
        // Si temps de présence dépasse seuil et pas déjà déclenché
        if (dwellSeconds >= zone.dwell_time_seconds && !previousStatus?.dwell_triggered) {
          const event: GeofenceEvent = {
            event_id: crypto.randomUUID(),
            zone_id: zone.zone_id,
            animator_id: request.animator_id,
            event_type: 'dwell',
            latitude: request.latitude,
            longitude: request.longitude,
            accuracy: request.accuracy,
            timestamp: request.timestamp || new Date().toISOString(),
            duration_seconds: dwellSeconds,
          };
          
          triggeredEvents.push(event);
          
          // Enregistrer l'événement
          await saveGeofenceEvent(event, supabaseUrl, supabaseKey);
          
          // Déclencher actions automatiques
          await triggerAutomaticActions(event, zone, c.env);
          
          // Marquer dwell comme déclenché
          await fetch(`${supabaseUrl}/rest/v1/geofence_animator_status?zone_id=eq.${zone.zone_id}&animator_id=eq.${request.animator_id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({ dwell_triggered: true }),
          });
        }
      }
      
      // Créer statut actuel
      const currentStatus: GeofenceStatus = {
        zone_id: zone.zone_id,
        zone_name: zone.name,
        is_inside: isInside,
        distance_to_center: distance,
        entry_timestamp: isInside 
          ? (previousStatus?.entry_timestamp || (isInside && !wasInside ? (request.timestamp || new Date().toISOString()) : undefined))
          : undefined,
        duration_seconds: isInside && previousStatus?.entry_timestamp
          ? Math.round((Date.now() - new Date(previousStatus.entry_timestamp).getTime()) / 1000)
          : undefined,
      };
      
      currentStatuses.push(currentStatus);
      
      // Mettre à jour le statut dans Supabase
      await upsertGeofenceStatus(
        request.animator_id,
        zone.zone_id,
        currentStatus,
        supabaseUrl,
        supabaseKey
      );
    }
    
    return c.json({
      success: true,
      animator_id: request.animator_id,
      timestamp: request.timestamp || new Date().toISOString(),
      zones_checked: zones.length,
      current_statuses: currentStatuses,
      triggered_events: triggeredEvents,
      inside_zones: currentStatuses.filter(s => s.is_inside).length,
    });
    
  } catch (error: any) {
    console.error('Geofencing check error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * POST /api/geofencing/zones
 * Crée une nouvelle zone géofence
 */
app.post('/api/geofencing/zones', async (c) => {
  try {
    const zone: Partial<GeofenceZone> = await c.req.json();
    
    // Validation
    if (!zone.name || !zone.center_latitude || !zone.center_longitude || !zone.radius_meters) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const supabaseUrl = c.env.SUPABASE_URL;
    const supabaseKey = c.env.SUPABASE_ANON_KEY;
    
    const newZone = {
      zone_id: crypto.randomUUID(),
      name: zone.name,
      type: zone.type || 'custom',
      center_latitude: zone.center_latitude,
      center_longitude: zone.center_longitude,
      radius_meters: zone.radius_meters,
      polygon: zone.polygon,
      partner_id: zone.partner_id,
      territory_id: zone.territory_id,
      trigger_on_entry: zone.trigger_on_entry ?? true,
      trigger_on_exit: zone.trigger_on_exit ?? true,
      trigger_on_dwell: zone.trigger_on_dwell ?? false,
      dwell_time_seconds: zone.dwell_time_seconds,
      active: zone.active ?? true,
      metadata: zone.metadata,
      created_at: new Date().toISOString(),
    };
    
    await fetch(`${supabaseUrl}/rest/v1/geofence_zones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(newZone),
    });
    
    return c.json({ success: true, zone: newZone });
    
  } catch (error: any) {
    console.error('Create zone error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * GET /api/geofencing/zones
 * Liste toutes les zones géofence
 */
app.get('/api/geofencing/zones', async (c) => {
  try {
    const active = c.req.query('active'); // filter by active status
    const type = c.req.query('type'); // filter by type
    
    const supabaseUrl = c.env.SUPABASE_URL;
    const supabaseKey = c.env.SUPABASE_ANON_KEY;
    
    let url = `${supabaseUrl}/rest/v1/geofence_zones?select=*`;
    if (active !== undefined) url += `&active=eq.${active}`;
    if (type) url += `&type=eq.${type}`;
    
    const response = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });
    
    const zones = await response.json();
    
    return c.json({
      success: true,
      total_zones: zones.length,
      zones,
    });
    
  } catch (error: any) {
    console.error('List zones error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * GET /api/geofencing/events/:animatorId
 * Récupère l'historique des événements géofence d'un animateur
 */
app.get('/api/geofencing/events/:animatorId', async (c) => {
  try {
    const animatorId = c.req.param('animatorId');
    const eventType = c.req.query('event_type'); // entry, exit, dwell
    const zoneId = c.req.query('zone_id');
    const startDate = c.req.query('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = c.req.query('end_date') || new Date().toISOString();
    const limit = parseInt(c.req.query('limit') || '100');
    
    const supabaseUrl = c.env.SUPABASE_URL;
    const supabaseKey = c.env.SUPABASE_ANON_KEY;
    
    let url = `${supabaseUrl}/rest/v1/geofence_events?animator_id=eq.${animatorId}&timestamp=gte.${startDate}&timestamp=lte.${endDate}&order=timestamp.desc&limit=${limit}`;
    if (eventType) url += `&event_type=eq.${eventType}`;
    if (zoneId) url += `&zone_id=eq.${zoneId}`;
    
    const response = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });
    
    const events = await response.json();
    
    // Calculer statistiques
    const stats = {
      total_events: events.length,
      entries: events.filter((e: any) => e.event_type === 'entry').length,
      exits: events.filter((e: any) => e.event_type === 'exit').length,
      dwells: events.filter((e: any) => e.event_type === 'dwell').length,
      unique_zones: new Set(events.map((e: any) => e.zone_id)).size,
      avg_visit_duration: calculateAvgVisitDuration(events),
    };
    
    return c.json({
      success: true,
      animator_id: animatorId,
      period: { start: startDate, end: endDate },
      statistics: stats,
      events,
    });
    
  } catch (error: any) {
    console.error('Events history error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * GET /api/geofencing/status/:animatorId
 * Récupère le statut actuel de l'animateur dans toutes les zones
 */
app.get('/api/geofencing/status/:animatorId', async (c) => {
  try {
    const animatorId = c.req.param('animatorId');
    
    const supabaseUrl = c.env.SUPABASE_URL;
    const supabaseKey = c.env.SUPABASE_ANON_KEY;
    
    const response = await fetch(
      `${supabaseUrl}/rest/v1/geofence_animator_status?animator_id=eq.${animatorId}&is_inside=eq.true&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );
    
    const statuses = await response.json();
    
    return c.json({
      success: true,
      animator_id: animatorId,
      inside_zones_count: statuses.length,
      current_zones: statuses,
    });
    
  } catch (error: any) {
    console.error('Status check error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * PUT /api/geofencing/zones/:zoneId
 * Met à jour une zone géofence
 */
app.put('/api/geofencing/zones/:zoneId', async (c) => {
  try {
    const zoneId = c.req.param('zoneId');
    const updates = await c.req.json();
    
    const supabaseUrl = c.env.SUPABASE_URL;
    const supabaseKey = c.env.SUPABASE_ANON_KEY;
    
    await fetch(`${supabaseUrl}/rest/v1/geofence_zones?zone_id=eq.${zoneId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString(),
      }),
    });
    
    return c.json({ success: true, message: 'Zone updated successfully' });
    
  } catch (error: any) {
    console.error('Update zone error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * DELETE /api/geofencing/zones/:zoneId
 * Supprime une zone géofence
 */
app.delete('/api/geofencing/zones/:zoneId', async (c) => {
  try {
    const zoneId = c.req.param('zoneId');
    
    const supabaseUrl = c.env.SUPABASE_URL;
    const supabaseKey = c.env.SUPABASE_ANON_KEY;
    
    await fetch(`${supabaseUrl}/rest/v1/geofence_zones?zone_id=eq.${zoneId}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });
    
    return c.json({ success: true, message: 'Zone deleted successfully' });
    
  } catch (error: any) {
    console.error('Delete zone error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Calcule la distance entre deux coordonnées GPS (Haversine)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
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
 * Sauvegarde un événement géofence
 */
async function saveGeofenceEvent(
  event: GeofenceEvent,
  supabaseUrl: string,
  supabaseKey: string
): Promise<void> {
  await fetch(`${supabaseUrl}/rest/v1/geofence_events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(event),
  });
}

/**
 * Met à jour le statut géofence d'un animateur
 */
async function upsertGeofenceStatus(
  animatorId: string,
  zoneId: string,
  status: GeofenceStatus,
  supabaseUrl: string,
  supabaseKey: string
): Promise<void> {
  const payload = {
    animator_id: animatorId,
    zone_id: zoneId,
    is_inside: status.is_inside,
    distance_to_center: status.distance_to_center,
    entry_timestamp: status.entry_timestamp,
    duration_seconds: status.duration_seconds,
    last_check: new Date().toISOString(),
    dwell_triggered: status.is_inside ? undefined : false, // reset on exit
  };
  
  await fetch(`${supabaseUrl}/rest/v1/geofence_animator_status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify(payload),
  });
}

/**
 * Déclenche des actions automatiques basées sur l'événement géofence
 */
async function triggerAutomaticActions(
  event: GeofenceEvent,
  zone: GeofenceZone,
  env: Bindings
): Promise<void> {
  // Action 1: Envoyer une notification push
  // TODO: Intégrer avec système de notifications push
  
  // Action 2: Attribuer des points de gamification
  if (event.event_type === 'entry') {
    // TODO: Appeler API gamification pour donner points "check-in"
    console.log(`[Geofence] Entry detected at ${zone.name} - Award 5 points`);
  }
  
  if (event.event_type === 'dwell') {
    // TODO: Donner badge "Visite complète" si dwell > 10 minutes
    console.log(`[Geofence] Dwell detected at ${zone.name} - Award badge`);
  }
  
  // Action 3: Créer une tâche automatique
  if (zone.partner_id && event.event_type === 'entry') {
    // TODO: Créer une action "Visite partenaire" dans la liste des tâches
    console.log(`[Geofence] Create automatic visit task for partner ${zone.partner_id}`);
  }
  
  // Action 4: Mettre à jour le CRM
  // TODO: Enregistrer la présence dans le système CRM
}

/**
 * Calcule la durée moyenne des visites (en secondes)
 */
function calculateAvgVisitDuration(events: any[]): number {
  const exitEvents = events.filter(e => e.event_type === 'exit' && e.duration_seconds);
  if (!exitEvents.length) return 0;
  
  const totalDuration = exitEvents.reduce((sum, e) => sum + (e.duration_seconds || 0), 0);
  return Math.round(totalDuration / exitEvents.length);
}

export default app;
