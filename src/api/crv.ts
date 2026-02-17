/**
 * Routes API pour les CRV
 */

import { Hono } from 'hono'
import { createSupabaseClient } from '../lib/supabase'
import { CRVService } from '../services/CRVService'
import { DEFAULT_TENANT_ID } from '../lib/mock-data'

const crv = new Hono()

// GET /visits/:visitId/crv - Récupérer CRV d'une visite
crv.get('/visits/:visitId/crv', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const crvService = new CRVService(supabase, DEFAULT_TENANT_ID)
    const visitId = c.req.param('visitId')
    
    const crvData = await crvService.getByVisitId(visitId)

    return c.json({
      success: true,
      data: crvData || { visit_id: visitId, status: 'draft', answers: {} }
    })
  } catch (error: any) {
    return c.json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    }, 500)
  }
})

// POST /visits/:visitId/crv - Créer CRV
crv.post('/visits/:visitId/crv', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const crvService = new CRVService(supabase, DEFAULT_TENANT_ID)
    const visitId = c.req.param('visitId')
    const body = await c.req.json()
    
    const crvData = await crvService.create({
      ...body,
      visit_id: visitId,
    })

    return c.json({ success: true, data: crvData }, 201)
  } catch (error: any) {
    return c.json({
      success: false,
      error: { code: 'CREATE_ERROR', message: error.message }
    }, 500)
  }
})

// PATCH /visits/:visitId/crv - Mettre à jour CRV
crv.patch('/visits/:visitId/crv', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const crvService = new CRVService(supabase, DEFAULT_TENANT_ID)
    const visitId = c.req.param('visitId')
    const body = await c.req.json()
    
    const crvData = await crvService.update(visitId, body)

    return c.json({ success: true, data: crvData })
  } catch (error: any) {
    return c.json({
      success: false,
      error: { code: 'UPDATE_ERROR', message: error.message }
    }, 500)
  }
})

// POST /visits/:visitId/crv/submit - Soumettre CRV
crv.post('/visits/:visitId/crv/submit', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const crvService = new CRVService(supabase, DEFAULT_TENANT_ID)
    const visitId = c.req.param('visitId')
    const user = c.get('user') // Depuis middleware auth
    
    const crvData = await crvService.submit(visitId, user?.id || 'system')

    return c.json({ success: true, data: crvData })
  } catch (error: any) {
    return c.json({
      success: false,
      error: { code: 'SUBMIT_ERROR', message: error.message }
    }, 500)
  }
})

// GET /crv/templates - Liste templates CRV
crv.get('/templates', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const crvService = new CRVService(supabase, DEFAULT_TENANT_ID)
    const templates = await crvService.getTemplates()

    return c.json({ success: true, data: templates })
  } catch (error: any) {
    return c.json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    }, 500)
  }
})

// GET /crv/templates/:id - Détail template
crv.get('/templates/:id', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: { code: 'SUPABASE_NOT_CONFIGURED' } }, 500)
    }

    const crvService = new CRVService(supabase, DEFAULT_TENANT_ID)
    const id = c.req.param('id')
    
    const template = await crvService.getTemplateById(id)

    return c.json({ success: true, data: template })
  } catch (error: any) {
    return c.json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    }, 500)
  }
})

export default crv
