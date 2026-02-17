import { SupabaseClient } from '../lib/supabase'

export interface Territory {
  id: string
  tenant_id: string
  organisation_id: string
  code: string
  name: string
  city?: string
  region?: string
  description?: string
  status: 'active' | 'inactive'
  organisation?: {
    id: string
    name: string
    code: string
  }
  stores_count?: number
  created_at: string
  updated_at: string
}

export interface TerritoryFilters {
  page?: number
  limit?: number
  status?: string
  organisation_id?: string
  city?: string
  search?: string
}

export class TerritoryService {
  constructor(
    private supabase: SupabaseClient,
    private tenantId: string
  ) {}

  async getAll(filters: TerritoryFilters = {}) {
    const page = filters.page || 1
    const limit = filters.limit || 50
    const offset = (page - 1) * limit

    // Build count query
    const countFilter: any = { tenant_id: this.tenantId }
    if (filters.status) countFilter.status = filters.status
    if (filters.organisation_id) countFilter.organisation_id = filters.organisation_id
    if (filters.city) countFilter.city = filters.city

    const total = await this.supabase.count('territories', countFilter)

    // Build data query
    let query = this.supabase.query('territories', {
      select: '*',
      filter: countFilter,
      order: 'name',
      limit,
      offset
    })

    let data = await query

    // Ensure data is an array
    const dataArray = Array.isArray(data) ? data : []

    // Fetch organisation data for each territory
    const dataWithRelations = await Promise.all(
      dataArray.map(async (territory: Territory) => {
        // Get organisation
        const org = await this.supabase.query('organisations', {
          select: 'id,name,code',
          filter: { id: territory.organisation_id },
          single: true
        })

        // Get stores count
        const storesCount = await this.supabase.count('stores', {
          tenant_id: this.tenantId,
          territory_id: territory.id
        })

        return {
          ...territory,
          organisation: org || undefined,
          stores_count: storesCount
        }
      })
    )

    return {
      data: dataWithRelations,
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

  async getById(id: string): Promise<Territory | null> {
    const data = await this.supabase.query('territories', {
      select: '*',
      filter: { id, tenant_id: this.tenantId },
      single: true
    })

    if (!data) return null

    // Get organisation
    const org = await this.supabase.query('organisations', {
      select: 'id,name,code',
      filter: { id: data.organisation_id },
      single: true
    })

    // Get stores count
    const storesCount = await this.supabase.count('stores', {
      tenant_id: this.tenantId,
      territory_id: id
    })

    return {
      ...data,
      organisation: org || undefined,
      stores_count: storesCount
    } as Territory
  }

  async create(data: Partial<Territory>): Promise<Territory> {
    const territory = await this.supabase.insert('territories', {
      ...data,
      tenant_id: this.tenantId
    })

    return territory as Territory
  }

  async update(id: string, data: Partial<Territory>): Promise<Territory> {
    const territory = await this.supabase.update('territories', data, {
      id,
      tenant_id: this.tenantId
    })

    return territory as Territory
  }

  async delete(id: string): Promise<{ success: boolean }> {
    await this.supabase.delete('territories', {
      id,
      tenant_id: this.tenantId
    })

    return { success: true }
  }
}
