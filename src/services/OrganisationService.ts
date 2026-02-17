import { SupabaseClient } from '../lib/supabase'

export interface Organisation {
  id: string
  tenant_id: string
  code: string
  name: string
  type: 'direction' | 'region' | 'district'
  description?: string
  manager?: string
  status: 'active' | 'inactive'
  territories_count?: number
  created_at: string
  updated_at: string
}

export interface OrganisationFilters {
  page?: number
  limit?: number
  status?: string
  type?: string
  search?: string
}

export class OrganisationService {
  constructor(
    private supabase: SupabaseClient,
    private tenantId: string
  ) {}

  async getAll(filters: OrganisationFilters = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 50
    const offset = (page - 1) * limit

    // Build query with count
    const countQuery = this.supabase
      .query('organisations', {
        select: '*',
        filter: { tenant_id: this.tenantId }
      })
    
    if (filters.status) {
      countQuery.filter = { ...countQuery.filter, status: filters.status }
    }
    if (filters.type) {
      countQuery.filter = { ...countQuery.filter, type: filters.type }
    }

    const total = await this.supabase.count('organisations', countQuery.filter)

    // Build data query
    let query = this.supabase.query('organisations', {
      select: '*',
      filter: { tenant_id: this.tenantId },
      order: 'name',
      limit,
      offset
    })

    if (filters.status) {
      query.filter = { ...query.filter, status: filters.status }
    }
    if (filters.type) {
      query.filter = { ...query.filter, type: filters.type }
    }

    const data = await query

    // Ensure data is an array
    const dataArray = Array.isArray(data) ? data : []

    // Calculate territories count for each org
    const dataWithCount = await Promise.all(
      dataArray.map(async (org: Organisation) => {
        const count = await this.supabase.count('territories', { 
          tenant_id: this.tenantId,
          organisation_id: org.id
        })
        return { ...org, territories_count: count }
      })
    )

    return {
      data: dataWithCount,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
        has_next: page * limit < total,
        has_prev: page > 1
      }
    }
  }

  async getById(id: string): Promise<Organisation | null> {
    const data = await this.supabase.query('organisations', {
      select: '*',
      filter: { id, tenant_id: this.tenantId },
      single: true
    })

    if (!data) return null

    // Get territories count
    const territoriesCount = await this.supabase.count('territories', {
      tenant_id: this.tenantId,
      organisation_id: id
    })

    return { ...data, territories_count: territoriesCount } as Organisation
  }

  async create(data: Partial<Organisation>): Promise<Organisation> {
    const organisation = await this.supabase.insert('organisations', {
      ...data,
      tenant_id: this.tenantId
    })

    return organisation as Organisation
  }

  async update(id: string, data: Partial<Organisation>): Promise<Organisation> {
    const organisation = await this.supabase.update('organisations', data, {
      id,
      tenant_id: this.tenantId
    })

    return organisation as Organisation
  }

  async delete(id: string): Promise<{ success: boolean }> {
    await this.supabase.delete('organisations', {
      id,
      tenant_id: this.tenantId
    })

    return { success: true }
  }
}
