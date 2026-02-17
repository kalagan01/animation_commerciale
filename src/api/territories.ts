import { Hono } from 'hono'
import { createSupabaseClient } from '../lib/supabase'
import { TerritoryService } from '../services/TerritoryService'

type Bindings = {
  SUPABASE_URL?: string
  SUPABASE_ANON_KEY?: string
  SUPABASE_SERVICE_KEY?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// GET /api/v1/territories - List territories with pagination
app.get('/', async (c) => {
  try {
    // MODE DEMO: Return mock data if enabled or Supabase not configured
    const useMockData = c.env.USE_MOCK_DATA === 'true' || c.env.USE_MOCK_DATA === true
    const supabase = !useMockData ? createSupabaseClient(c.env) : null
    
    if (!supabase || useMockData) {
      // Return mock data
      const mockData = [
        {
          id: '1',
          code: 'TER-001',
          name: 'Casablanca Centre',
          description: 'Zone centre de Casablanca',
          organisation_id: '1',
          organisation_name: 'Direction Régionale Nord',
          city: 'Casablanca',
          region: 'Casablanca-Settat',
          stores_count: 12,
          status: 'active',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-02-14T00:00:00Z'
        },
        {
          id: '2',
          code: 'TER-002',
          name: 'Rabat Agdal',
          description: 'Quartier Agdal - Rabat',
          organisation_id: '2',
          organisation_name: 'Direction Régionale Centre',
          city: 'Rabat',
          region: 'Rabat-Salé-Kénitra',
          stores_count: 8,
          status: 'active',
          created_at: '2025-01-02T00:00:00Z',
          updated_at: '2025-02-14T00:00:00Z'
        }
      ]

      return c.json({
        success: true,
        data: mockData,
        pagination: { page: 1, limit: 50, total: 2, pages: 1 }
      })
    }

    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '50')
    const status = c.req.query('status')
    const organisationId = c.req.query('organisation_id')
    const city = c.req.query('city')
    const search = c.req.query('search')

    const tenantId = '550e8400-e29b-41d4-a716-446655440000'
    const service = new TerritoryService(supabase, tenantId)
    
    const result = await service.getAll({ page, limit, status, organisation_id: organisationId, city, search })

    return c.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    })
  } catch (error: any) {
    console.error('Error fetching territories:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// GET /api/v1/territories/:id - Get single territory
app.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    // MODE DEMO: Return mock data if enabled or Supabase not configured
    const useMockData = c.env.USE_MOCK_DATA === 'true' || c.env.USE_MOCK_DATA === true
    const supabase = !useMockData ? createSupabaseClient(c.env) : null
    
    if (!supabase || useMockData) {
      // Return mock data
      return c.json({
        success: true,
        data: {
          id,
          code: 'TER-' + id.padStart(3, '0'),
          name: 'Territoire ' + id,
          description: 'Description du territoire',
          status: 'active'
        }
      })
    }

    const tenantId = '550e8400-e29b-41d4-a716-446655440000'
    const service = new TerritoryService(supabase, tenantId)
    
    const data = await service.getById(id)

    if (!data) {
      return c.json({ success: false, error: 'Territory not found' }, 404)
    }

    return c.json({ success: true, data })
  } catch (error: any) {
    console.error('Error fetching territory:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// POST /api/v1/territories - Create territory
app.post('/', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: 'Supabase not configured' }, 500)
    }

    const body = await c.req.json()
    const tenantId = '550e8400-e29b-41d4-a716-446655440000'
    const service = new TerritoryService(supabase, tenantId)
    
    const data = await service.create(body)

    return c.json({ success: true, data }, 201)
  } catch (error: any) {
    console.error('Error creating territory:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// PATCH /api/v1/territories/:id - Update territory
app.patch('/:id', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: 'Supabase not configured' }, 500)
    }

    const id = c.req.param('id')
    const body = await c.req.json()
    const tenantId = '550e8400-e29b-41d4-a716-446655440000'
    const service = new TerritoryService(supabase, tenantId)
    
    const data = await service.update(id, body)

    return c.json({ success: true, data })
  } catch (error: any) {
    console.error('Error updating territory:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// DELETE /api/v1/territories/:id - Delete territory
app.delete('/:id', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: 'Supabase not configured' }, 500)
    }

    const id = c.req.param('id')
    const tenantId = '550e8400-e29b-41d4-a716-446655440000'
    const service = new TerritoryService(supabase, tenantId)
    
    await service.delete(id)

    return c.json({ success: true, message: 'Territory deleted' })
  } catch (error: any) {
    console.error('Error deleting territory:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

export default app
