/**
 * Routes API pour les Incidents
 */

import { Hono } from 'hono'
import { createSupabaseClient } from '../lib/supabase'
import { IncidentService } from '../services/IncidentService'
import { DEFAULT_TENANT_ID } from '../lib/mock-data'

const incidents = new Hono()

incidents.get('/', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const incidentService = new IncidentService(supabase, DEFAULT_TENANT_ID)
    
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '50')
    const status = c.req.query('status')
    const severity = c.req.query('severity')

    const result = await incidentService.getAll({ page, limit, status, severity })

    return c.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    }, 500)
  }
})

incidents.post('/', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const incidentService = new IncidentService(supabase, DEFAULT_TENANT_ID)
    const body = await c.req.json()
    
    const incident = await incidentService.create(body)

    return c.json({ success: true, data: incident }, 201)
  } catch (error: any) {
    return c.json({
      success: false,
      error: { code: 'CREATE_ERROR', message: error.message }
    }, 500)
  }
})

incidents.post('/:id/resolve', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const incidentService = new IncidentService(supabase, DEFAULT_TENANT_ID)
    const id = c.req.param('id')
    const body = await c.req.json()
    
    const incident = await incidentService.resolve(id, body)

    return c.json({ success: true, data: incident })
  } catch (error: any) {
    return c.json({
      success: false,
      error: { code: 'RESOLVE_ERROR', message: error.message }
    }, 500)
  }
})

export default incidents
