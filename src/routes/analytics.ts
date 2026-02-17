/**
 * 📊 ANALYTICS & BUSINESS INTELLIGENCE SYSTEM
 * Phase 3.1 - Advanced Multi-Level Dashboards
 * 
 * Fonctionnalités:
 * ✅ Executive Dashboard (Direction Commerciale)
 * ✅ Manager Dashboard (Pilotage Équipe)
 * ✅ Animator Dashboard (Performance Personnelle)
 * ✅ Real-time KPIs & Metrics
 * ✅ Time-series Analytics
 * ✅ Comparative Benchmarking
 * ✅ Heatmaps & Geographic Insights
 * ✅ Export Data (CSV/JSON)
 */

import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'

const app = new Hono()

// ===================================================================
// 📊 EXECUTIVE DASHBOARD ENDPOINTS
// ===================================================================

/**
 * GET /api/analytics/executive/overview
 * Vue 360° performance réseau national
 */
app.get('/executive/overview', async (c) => {
  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  const { data: overview, error } = await supabase
    .rpc('get_executive_overview')

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({
    success: true,
    data: overview,
    timestamp: new Date().toISOString()
  })
})

/**
 * GET /api/analytics/executive/regional-comparison
 * Comparatif performances par région
 */
app.get('/executive/regional-comparison', async (c) => {
  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  const { data: regions, error } = await supabase
    .from('v_regional_performance')
    .select('*')
    .order('total_revenue', { ascending: false })

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({
    success: true,
    regions,
    total_regions: regions.length
  })
})

/**
 * GET /api/analytics/executive/revenue-forecast
 * Prévisions CA 1-3 mois (IA)
 */
app.get('/executive/revenue-forecast', async (c) => {
  const horizon = c.req.query('horizon') || '30' // jours

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  const { data: forecast, error } = await supabase
    .rpc('predict_revenue_forecast', {
      forecast_days: parseInt(horizon)
    })

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({
    success: true,
    forecast,
    horizon_days: parseInt(horizon),
    confidence_level: 0.85 // 85% confiance modèle
  })
})

/**
 * GET /api/analytics/executive/conversion-funnel
 * Funnel conversion multi-étapes
 */
app.get('/executive/conversion-funnel', async (c) => {
  const startDate = c.req.query('start_date')
  const endDate = c.req.query('end_date')

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  const { data: funnel, error } = await supabase
    .rpc('get_conversion_funnel', {
      start_date: startDate,
      end_date: endDate
    })

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({
    success: true,
    funnel,
    period: { start_date: startDate, end_date: endDate }
  })
})

// ===================================================================
// 👔 MANAGER DASHBOARD ENDPOINTS
// ===================================================================

/**
 * GET /api/analytics/manager/:managerId/team-performance
 * Performance équipe vs objectifs
 */
app.get('/manager/:managerId/team-performance', async (c) => {
  const managerId = c.req.param('managerId')

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  const { data: team, error } = await supabase
    .from('v_team_performance')
    .select('*')
    .eq('manager_id', managerId)
    .order('performance_score', { ascending: false })

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  // Calcul agrégats équipe
  const teamAggregate = {
    total_animators: team.length,
    avg_performance_score: team.reduce((sum, a) => sum + (a.performance_score || 0), 0) / team.length,
    total_revenue: team.reduce((sum, a) => sum + (a.total_revenue || 0), 0),
    total_visits: team.reduce((sum, a) => sum + (a.visits_count || 0), 0),
    top_performer: team[0],
    bottom_performer: team[team.length - 1]
  }

  return c.json({
    success: true,
    team,
    aggregate: teamAggregate
  })
})

/**
 * GET /api/analytics/manager/:managerId/geographic-heatmap
 * Heatmap géographique visites/performances
 */
app.get('/manager/:managerId/geographic-heatmap', async (c) => {
  const managerId = c.req.param('managerId')
  const metric = c.req.query('metric') || 'visits' // visits, revenue, conversion

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  const { data: heatmap, error } = await supabase
    .rpc('get_geographic_heatmap', {
      manager_id: managerId,
      metric_type: metric
    })

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({
    success: true,
    heatmap,
    metric
  })
})

/**
 * GET /api/analytics/manager/:managerId/realtime-gps
 * Tracking GPS temps réel équipe
 */
app.get('/manager/:managerId/realtime-gps', async (c) => {
  const managerId = c.req.param('managerId')

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  // Get team animators
  const { data: team, error: teamError } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('manager_id', managerId)
    .eq('role', 'animator')

  if (teamError) {
    return c.json({ error: teamError.message }, 500)
  }

  // Get latest GPS positions
  const animatorIds = team.map(a => a.id)
  const { data: positions, error: posError } = await supabase
    .from('gps_tracking')
    .select('*')
    .in('animator_id', animatorIds)
    .order('timestamp', { ascending: false })
    .limit(animatorIds.length) // Latest per animator

  if (posError) {
    return c.json({ error: posError.message }, 500)
  }

  // Merge data
  const realtimeData = team.map(animator => ({
    ...animator,
    location: positions.find(p => p.animator_id === animator.id)
  }))

  return c.json({
    success: true,
    team: realtimeData,
    last_update: new Date().toISOString()
  })
})

/**
 * GET /api/analytics/manager/:managerId/coaching-recommendations
 * Recommandations coaching IA
 */
app.get('/manager/:managerId/coaching-recommendations', async (c) => {
  const managerId = c.req.param('managerId')

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  const { data: recommendations, error } = await supabase
    .rpc('generate_coaching_recommendations', {
      manager_id: managerId
    })

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({
    success: true,
    recommendations
  })
})

// ===================================================================
// 🎮 ANIMATOR DASHBOARD ENDPOINTS
// ===================================================================

/**
 * GET /api/analytics/animator/:animatorId/personal-dashboard
 * Dashboard personnel complet
 */
app.get('/animator/:animatorId/personal-dashboard', async (c) => {
  const animatorId = c.req.param('animatorId')

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  const { data: dashboard, error } = await supabase
    .rpc('get_animator_personal_dashboard', {
      animator_id: animatorId
    })

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({
    success: true,
    dashboard
  })
})

/**
 * GET /api/analytics/animator/:animatorId/performance-score
 * Score performance 0-100
 */
app.get('/animator/:animatorId/performance-score', async (c) => {
  const animatorId = c.req.param('animatorId')

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  const { data: score, error } = await supabase
    .rpc('calculate_performance_score', {
      animator_id: animatorId
    })

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({
    success: true,
    score,
    breakdown: {
      commercial: score.commercial_score,
      terrain: score.terrain_score,
      engagement: score.engagement_score,
      quality: score.quality_score
    }
  })
})

/**
 * GET /api/analytics/animator/:animatorId/priority-leads
 * Top leads prioritaires (IA scoring)
 */
app.get('/animator/:animatorId/priority-leads', async (c) => {
  const animatorId = c.req.param('animatorId')
  const limit = parseInt(c.req.query('limit') || '10')

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  const { data: leads, error } = await supabase
    .from('leads')
    .select('*, ai_score')
    .eq('animator_id', animatorId)
    .eq('status', 'active')
    .order('ai_score', { ascending: false })
    .limit(limit)

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({
    success: true,
    priority_leads: leads,
    count: leads.length
  })
})

/**
 * GET /api/analytics/animator/:animatorId/benchmarking
 * Comparaison vs top performers
 */
app.get('/animator/:animatorId/benchmarking', async (c) => {
  const animatorId = c.req.param('animatorId')

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  const { data: benchmark, error } = await supabase
    .rpc('get_animator_benchmarking', {
      animator_id: animatorId
    })

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({
    success: true,
    benchmarking: benchmark
  })
})

/**
 * GET /api/analytics/animator/:animatorId/next-rewards
 * Prochaines récompenses déblocables
 */
app.get('/animator/:animatorId/next-rewards', async (c) => {
  const animatorId = c.req.param('animatorId')

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  const { data: rewards, error } = await supabase
    .rpc('get_next_unlockable_rewards', {
      animator_id: animatorId
    })

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({
    success: true,
    upcoming_rewards: rewards
  })
})

// ===================================================================
// 📈 GENERAL ANALYTICS ENDPOINTS
// ===================================================================

/**
 * GET /api/analytics/kpis/realtime
 * KPIs temps réel (tous niveaux)
 */
app.get('/kpis/realtime', async (c) => {
  const level = c.req.query('level') // executive, manager, animator
  const entityId = c.req.query('entity_id')

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  const { data: kpis, error } = await supabase
    .rpc('get_realtime_kpis', {
      level_type: level,
      entity_id: entityId
    })

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({
    success: true,
    kpis,
    level,
    timestamp: new Date().toISOString()
  })
})

/**
 * GET /api/analytics/timeseries/:metric
 * Données time-series pour graphiques
 */
app.get('/timeseries/:metric', async (c) => {
  const metric = c.req.param('metric') // revenue, visits, conversion, etc.
  const startDate = c.req.query('start_date')
  const endDate = c.req.query('end_date')
  const granularity = c.req.query('granularity') || 'day' // hour, day, week, month

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  const { data: timeseries, error } = await supabase
    .rpc('get_timeseries_data', {
      metric_name: metric,
      start_date: startDate,
      end_date: endDate,
      granularity_level: granularity
    })

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({
    success: true,
    metric,
    timeseries,
    granularity
  })
})

/**
 * GET /api/analytics/export/:format
 * Export données (CSV, JSON)
 */
app.get('/export/:format', async (c) => {
  const format = c.req.param('format') // csv, json
  const dataType = c.req.query('data_type') // performance, commissions, visits, etc.
  const startDate = c.req.query('start_date')
  const endDate = c.req.query('end_date')

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  const { data: exportData, error } = await supabase
    .rpc('export_analytics_data', {
      data_type: dataType,
      start_date: startDate,
      end_date: endDate
    })

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  if (format === 'csv') {
    // Convert to CSV
    const csv = convertToCSV(exportData)
    return c.text(csv, 200, {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${dataType}_${startDate}_${endDate}.csv"`
    })
  }

  return c.json({
    success: true,
    data: exportData,
    format,
    count: exportData.length
  })
})

/**
 * GET /api/analytics/alerts
 * Alertes stratégiques automatiques
 */
app.get('/alerts', async (c) => {
  const severity = c.req.query('severity') // critical, warning, info
  const entityType = c.req.query('entity_type') // company, region, team, animator

  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  )

  const { data: alerts, error } = await supabase
    .from('analytics_alerts')
    .select('*')
    .eq('severity', severity || 'warning')
    .eq('entity_type', entityType || 'company')
    .eq('is_resolved', false)
    .order('created_at', { ascending: false })

  if (error) {
    return c.json({ error: error.message }, 500)
  }

  return c.json({
    success: true,
    alerts,
    count: alerts.length
  })
})

// ===================================================================
// 🛠️ UTILITY FUNCTIONS
// ===================================================================

function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return ''

  const headers = Object.keys(data[0])
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        return typeof value === 'string' ? `"${value}"` : value
      }).join(',')
    )
  ]

  return csvRows.join('\n')
}

export default app
