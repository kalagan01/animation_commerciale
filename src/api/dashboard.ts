/**
 * Routes API pour les Dashboards & KPIs
 */

import { Hono } from 'hono'
import { createSupabaseClient } from '../lib/supabase'
import { DashboardService } from '../services/DashboardService'
import { DEFAULT_TENANT_ID } from '../lib/mock-data'

const dashboard = new Hono()

// GET /dashboard/kpis - KPIs globaux
dashboard.get('/kpis', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const dashboardService = new DashboardService(supabase, DEFAULT_TENANT_ID)
    
    const period = c.req.query('period')
    const user_id = c.req.query('user_id')

    const kpis = await dashboardService.getKPIs({ period, user_id })

    return c.json({
      success: true,
      data: kpis,
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    }, 500)
  }
})

// GET /dashboard/activity - Timeline d'activité
dashboard.get('/activity', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const dashboardService = new DashboardService(supabase, DEFAULT_TENANT_ID)
    
    const days = parseInt(c.req.query('days') || '7')
    const user_id = c.req.query('user_id')

    const activity = await dashboardService.getActivityTimeline({ days, user_id })

    return c.json({
      success: true,
      data: activity,
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    }, 500)
  }
})

// GET /dashboard/stores-performance - Performance stores
dashboard.get('/stores-performance', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const dashboardService = new DashboardService(supabase, DEFAULT_TENANT_ID)
    
    const limit = parseInt(c.req.query('limit') || '10')

    const performance = await dashboardService.getStorePerformance({ limit })

    return c.json({
      success: true,
      data: performance,
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    }, 500)
  }
})

export default dashboard
