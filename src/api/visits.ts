/**
 * Routes API pour les Visites
 */

import { Hono } from 'hono'
import { createSupabaseClient } from '../lib/supabase'
import { VisitService } from '../services/VisitService'
import { DEFAULT_TENANT_ID } from '../lib/mock-data'

const visits = new Hono()

// GET /visits - Liste des visites
visits.get('/', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const visitService = new VisitService(supabase, DEFAULT_TENANT_ID)
    
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '50')
    const status = c.req.query('status')
    const assigned_to = c.req.query('assigned_to')

    const result = await visitService.getAll({ page, limit, status, assigned_to })

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

// GET /visits/:id - Détail visite
visits.get('/:id', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const visitService = new VisitService(supabase, DEFAULT_TENANT_ID)
    const id = c.req.param('id')
    
    const visit = await visitService.getById(id)

    return c.json({ success: true, data: visit })
  } catch (error: any) {
    return c.json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    }, 500)
  }
})

// POST /visits - Créer visite
visits.post('/', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const visitService = new VisitService(supabase, DEFAULT_TENANT_ID)
    const body = await c.req.json()
    
    const visit = await visitService.create(body)

    return c.json({ success: true, data: visit }, 201)
  } catch (error: any) {
    return c.json({
      success: false,
      error: { code: 'CREATE_ERROR', message: error.message }
    }, 500)
  }
})

// PATCH /visits/:id - Modifier visite
visits.patch('/:id', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const visitService = new VisitService(supabase, DEFAULT_TENANT_ID)
    const id = c.req.param('id')
    const body = await c.req.json()
    
    const visit = await visitService.update(id, body)

    return c.json({ success: true, data: visit })
  } catch (error: any) {
    return c.json({
      success: false,
      error: { code: 'UPDATE_ERROR', message: error.message }
    }, 500)
  }
})

// POST /visits/:id/checkin - Check-in GPS
visits.post('/:id/checkin', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const visitService = new VisitService(supabase, DEFAULT_TENANT_ID)
    const id = c.req.param('id')
    const body = await c.req.json()
    
    const visit = await visitService.checkin(id, body)

    return c.json({ success: true, data: visit })
  } catch (error: any) {
    return c.json({
      success: false,
      error: { code: 'CHECKIN_ERROR', message: error.message }
    }, 500)
  }
})

// POST /visits/:id/checkout - Check-out GPS
visits.post('/:id/checkout', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const visitService = new VisitService(supabase, DEFAULT_TENANT_ID)
    const id = c.req.param('id')
    const body = await c.req.json()
    
    const visit = await visitService.checkout(id, body)

    return c.json({ success: true, data: visit })
  } catch (error: any) {
    return c.json({
      success: false,
      error: { code: 'CHECKOUT_ERROR', message: error.message }
    }, 500)
  }
})

// DELETE /visits/:id
visits.delete('/:id', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const visitService = new VisitService(supabase, DEFAULT_TENANT_ID)
    const id = c.req.param('id')
    
    await visitService.delete(id)

    return c.json({ success: true, message: 'Visit deleted successfully' })
  } catch (error: any) {
    return c.json({
      success: false,
      error: { code: 'DELETE_ERROR', message: error.message }
    }, 500)
  }
})

export default visits
