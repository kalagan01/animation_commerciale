import { Hono } from 'hono'
import { createSupabaseClient } from '../lib/supabase'
import { PartnerService } from '../services/PartnerService'

type Bindings = {
  SUPABASE_URL?: string
  SUPABASE_ANON_KEY?: string
  SUPABASE_SERVICE_KEY?: string
  USE_MOCK_DATA?: string
}

const app = new Hono<{ Bindings: Bindings }>()

/**
 * GET /api/v1/partners
 * Liste paginée des partenaires avec filtres
 */
app.get('/', async (c) => {
  try {
    const tenantId = c.get('tenantId')
    
    // Query params
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '50')
    const status = c.req.query('status')
    const territory_id = c.req.query('territory_id')
    const brand = c.req.query('brand')
    const type = c.req.query('type')
    const city = c.req.query('city')
    const search = c.req.query('search')
    const sort_by = c.req.query('sort_by') || 'created_at'
    const sort_order = (c.req.query('sort_order') || 'desc') as 'asc' | 'desc'

    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ 
        success: false, 
        error: 'Database not configured' 
      }, 500)
    }

    const service = new PartnerService(supabase, tenantId)
    const result = await service.getAll({
      page,
      limit,
      status,
      territory_id,
      brand,
      type,
      city,
      search,
      sort_by,
      sort_order
    })

    return c.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    })
  } catch (error: any) {
    console.error('Error fetching partners:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

/**
 * GET /api/v1/partners/stats
 * Statistiques globales des partenaires
 */
app.get('/stats', async (c) => {
  try {
    const tenantId = c.get('tenantId')

    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ 
        success: false, 
        error: 'Database not configured' 
      }, 500)
    }

    const service = new PartnerService(supabase, tenantId)
    const stats = await service.getStats()

    return c.json({
      success: true,
      data: stats
    })
  } catch (error: any) {
    console.error('Error fetching partner stats:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

/**
 * GET /api/v1/partners/search-location
 * Recherche par proximité GPS
 */
app.get('/search-location', async (c) => {
  try {
    const tenantId = c.get('tenantId')
    const latitude = parseFloat(c.req.query('lat') || '0')
    const longitude = parseFloat(c.req.query('lng') || '0')
    const radius = parseFloat(c.req.query('radius') || '10')

    if (!latitude || !longitude) {
      return c.json({ 
        success: false, 
        error: 'Latitude and longitude required' 
      }, 400)
    }

    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ 
        success: false, 
        error: 'Database not configured' 
      }, 500)
    }

    const service = new PartnerService(supabase, tenantId)
    const partners = await service.searchByLocation(latitude, longitude, radius)

    return c.json({
      success: true,
      data: partners
    })
  } catch (error: any) {
    console.error('Error searching partners by location:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

/**
 * GET /api/v1/partners/:id
 * Vue 360° d'un partenaire
 */
app.get('/:id', async (c) => {
  try {
    const tenantId = c.get('tenantId')
    const id = c.req.param('id')

    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ 
        success: false, 
        error: 'Database not configured' 
      }, 500)
    }

    const service = new PartnerService(supabase, tenantId)
    const partner = await service.getById(id)

    if (!partner) {
      return c.json({ 
        success: false, 
        error: 'Partner not found' 
      }, 404)
    }

    return c.json({
      success: true,
      data: partner
    })
  } catch (error: any) {
    console.error('Error fetching partner:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

/**
 * POST /api/v1/partners
 * Créer un nouveau partenaire
 */
app.post('/', async (c) => {
  try {
    const tenantId = c.get('tenantId')
    const body = await c.req.json()

    // Validation
    if (!body.code || !body.name) {
      return c.json({ 
        success: false, 
        error: 'Code and name are required' 
      }, 400)
    }

    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ 
        success: false, 
        error: 'Database not configured' 
      }, 500)
    }

    const service = new PartnerService(supabase, tenantId)
    const partner = await service.create(body)

    return c.json({
      success: true,
      data: partner
    }, 201)
  } catch (error: any) {
    console.error('Error creating partner:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

/**
 * PATCH /api/v1/partners/:id
 * Mettre à jour un partenaire
 */
app.patch('/:id', async (c) => {
  try {
    const tenantId = c.get('tenantId')
    const id = c.req.param('id')
    const body = await c.req.json()

    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ 
        success: false, 
        error: 'Database not configured' 
      }, 500)
    }

    const service = new PartnerService(supabase, tenantId)
    const partner = await service.update(id, body)

    return c.json({
      success: true,
      data: partner
    })
  } catch (error: any) {
    console.error('Error updating partner:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

/**
 * DELETE /api/v1/partners/:id
 * Supprimer un partenaire (soft delete)
 */
app.delete('/:id', async (c) => {
  try {
    const tenantId = c.get('tenantId')
    const id = c.req.param('id')

    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ 
        success: false, 
        error: 'Database not configured' 
      }, 500)
    }

    const service = new PartnerService(supabase, tenantId)
    await service.delete(id)

    return c.json({
      success: true,
      message: 'Partner deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting partner:', error)
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

export default app
