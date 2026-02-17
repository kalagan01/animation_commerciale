/**
 * Routes API pour les Actions
 */

import { Hono } from 'hono'
import { createSupabaseClient } from '../lib/supabase'
import { ActionService } from '../services/ActionService'
import { DEFAULT_TENANT_ID } from '../lib/mock-data'

const actions = new Hono()

actions.get('/', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const actionService = new ActionService(supabase, DEFAULT_TENANT_ID)
    
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '50')
    const status = c.req.query('status')
    const assigned_to = c.req.query('assigned_to')
    const priority = c.req.query('priority')

    const result = await actionService.getAll({ page, limit, status, assigned_to, priority })

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

actions.get('/:id', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const actionService = new ActionService(supabase, DEFAULT_TENANT_ID)
    const id = c.req.param('id')
    
    const action = await actionService.getById(id)

    return c.json({ success: true, data: action })
  } catch (error: any) {
    return c.json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    }, 500)
  }
})

actions.post('/', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const actionService = new ActionService(supabase, DEFAULT_TENANT_ID)
    const body = await c.req.json()
    
    const action = await actionService.create(body)

    return c.json({ success: true, data: action }, 201)
  } catch (error: any) {
    return c.json({
      success: false,
      error: { code: 'CREATE_ERROR', message: error.message }
    }, 500)
  }
})

actions.patch('/:id', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const actionService = new ActionService(supabase, DEFAULT_TENANT_ID)
    const id = c.req.param('id')
    const body = await c.req.json()
    
    const action = await actionService.update(id, body)

    return c.json({ success: true, data: action })
  } catch (error: any) {
    return c.json({
      success: false,
      error: { code: 'UPDATE_ERROR', message: error.message }
    }, 500)
  }
})

actions.post('/:id/complete', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const actionService = new ActionService(supabase, DEFAULT_TENANT_ID)
    const id = c.req.param('id')
    const body = await c.req.json()
    
    const action = await actionService.complete(id, body)

    return c.json({ success: true, data: action })
  } catch (error: any) {
    return c.json({
      success: false,
      error: { code: 'COMPLETE_ERROR', message: error.message }
    }, 500)
  }
})

actions.delete('/:id', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const actionService = new ActionService(supabase, DEFAULT_TENANT_ID)
    const id = c.req.param('id')
    
    await actionService.delete(id)

    return c.json({ success: true, message: 'Action deleted successfully' })
  } catch (error: any) {
    return c.json({
      success: false,
      error: { code: 'DELETE_ERROR', message: error.message }
    }, 500)
  }
})

export default actions
