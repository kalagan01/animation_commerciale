import { Hono } from 'hono'
import { createSupabaseClient } from '../lib/supabase'
import { OrganisationService } from '../services/OrganisationService'

type Bindings = {
  SUPABASE_URL?: string
  SUPABASE_ANON_KEY?: string
  SUPABASE_SERVICE_KEY?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// GET /api/v1/organisations - List organisations with pagination
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
          code: 'ORG-001',
          name: 'Direction Régionale Nord',
          type: 'regional',
          description: 'Direction régionale couvrant le nord du Maroc',
          manager: 'Hassan Bennis',
          status: 'active',
          territories_count: 5,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-02-14T00:00:00Z'
        },
        {
          id: '2',
          code: 'ORG-002',
          name: 'Direction Régionale Centre',
          type: 'regional',
          description: 'Direction régionale centre avec 8 territoires',
          manager: 'Fatima Zahra',
          status: 'active',
          territories_count: 8,
          created_at: '2025-01-02T00:00:00Z',
          updated_at: '2025-02-14T00:00:00Z'
        },
        {
          id: '3',
          code: 'ORG-003',
          name: 'Agence Casablanca',
          type: 'agency',
          description: 'Agence principale de Casablanca',
          manager: 'Karim Idrissi',
          status: 'active',
          territories_count: 3,
          created_at: '2025-01-03T00:00:00Z',
          updated_at: '2025-02-14T00:00:00Z'
        }
      ]

      return c.json({
        success: true,
        data: mockData,
        pagination: { page: 1, limit: 50, total: 3, pages: 1 }
      })
    }

    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '50')
    const status = c.req.query('status')
    const type = c.req.query('type')
    const search = c.req.query('search')

    const tenantId = '550e8400-e29b-41d4-a716-446655440000'
    const service = new OrganisationService(supabase, tenantId)
    
    const result = await service.getAll({ page, limit, status, type, search })

    return c.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    })
  } catch (error: any) {
    console.error('Error fetching organisations:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// GET /api/v1/organisations/:id - Get single organisation
app.get('/:id', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: 'Supabase not configured' }, 500)
    }

    const id = c.req.param('id')
    const tenantId = '550e8400-e29b-41d4-a716-446655440000'
    const service = new OrganisationService(supabase, tenantId)
    
    const data = await service.getById(id)

    if (!data) {
      return c.json({ success: false, error: 'Organisation not found' }, 404)
    }

    return c.json({ success: true, data })
  } catch (error: any) {
    console.error('Error fetching organisation:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// POST /api/v1/organisations - Create organisation
app.post('/', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    const body = await c.req.json()
    
    if (!supabase) {
      // MODE DEMO: Return mock created organisation
      return c.json({
        success: true,
        data: {
          id: Math.random().toString(36).substring(7),
          ...body,
          status: body.status || 'active',
          territories_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      })
    }

    const tenantId = '550e8400-e29b-41d4-a716-446655440000'
    const service = new OrganisationService(supabase, tenantId)
    
    const data = await service.create(body)

    return c.json({ success: true, data }, 201)
  } catch (error: any) {
    console.error('Error creating organisation:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// PATCH /api/v1/organisations/:id - Update organisation
app.patch('/:id', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: 'Supabase not configured' }, 500)
    }

    const id = c.req.param('id')
    const body = await c.req.json()
    const tenantId = '550e8400-e29b-41d4-a716-446655440000'
    const service = new OrganisationService(supabase, tenantId)
    
    const data = await service.update(id, body)

    return c.json({ success: true, data })
  } catch (error: any) {
    console.error('Error updating organisation:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// DELETE /api/v1/organisations/:id - Delete organisation
app.delete('/:id', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    if (!supabase) {
      return c.json({ success: false, error: 'Supabase not configured' }, 500)
    }

    const id = c.req.param('id')
    const tenantId = '550e8400-e29b-41d4-a716-446655440000'
    const service = new OrganisationService(supabase, tenantId)
    
    await service.delete(id)

    return c.json({ success: true, message: 'Organisation deleted' })
  } catch (error: any) {
    console.error('Error deleting organisation:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

export default app
