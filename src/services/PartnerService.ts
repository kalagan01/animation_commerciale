import { SupabaseClient } from '@supabase/supabase-js'

export interface Partner {
  id: string
  tenant_id: string
  territory_id?: string
  code: string
  name: string
  type?: string
  brand?: string
  address?: string
  city?: string
  postal_code?: string
  phone?: string
  email?: string
  contact_person?: string
  latitude?: number
  longitude?: number
  status: string
  performance_score?: number
  contract_start?: string
  contract_end?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface PartnerFilters {
  page?: number
  limit?: number
  status?: string
  territory_id?: string
  brand?: string
  type?: string
  city?: string
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginationResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    has_next: boolean
    has_prev: boolean
  }
}

export class PartnerService {
  constructor(
    private supabase: SupabaseClient,
    private tenantId: string
  ) {}

  /**
   * Get all partners with filters and pagination
   */
  async getAll(filters: PartnerFilters): Promise<PaginationResult<Partner>> {
    const {
      page = 1,
      limit = 50,
      status,
      territory_id,
      brand,
      type,
      city,
      search,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = filters

    let query = this.supabase
      .from('partners')
      .select('*, territory:territories(id, code, name, city)', { count: 'exact' })
      .eq('tenant_id', this.tenantId)

    // Filters
    if (status) query = query.eq('status', status)
    if (territory_id) query = query.eq('territory_id', territory_id)
    if (brand) query = query.eq('brand', brand)
    if (type) query = query.eq('type', type)
    if (city) query = query.ilike('city', `%${city}%`)
    
    // Search by name, code, contact_person
    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,contact_person.ilike.%${search}%`)
    }

    // Sorting
    query = query.order(sort_by, { ascending: sort_order === 'asc' })

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) throw error

    const total = count || 0
    const pages = Math.ceil(total / limit)

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total,
        pages,
        has_next: page < pages,
        has_prev: page > 1
      }
    }
  }

  /**
   * Get single partner by ID with related data (360° view)
   */
  async getById(id: string): Promise<Partner | null> {
    const { data, error } = await this.supabase
      .from('partners')
      .select(`
        *,
        territory:territories(id, code, name, city, region, animator:users(id, first_name, last_name, email))
      `)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .single()

    if (error) throw error
    return data
  }

  /**
   * Create new partner
   */
  async create(partner: Omit<Partner, 'id' | 'created_at' | 'updated_at' | 'tenant_id'>): Promise<Partner> {
    const { data, error } = await this.supabase
      .from('partners')
      .insert({
        ...partner,
        tenant_id: this.tenantId
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Update partner
   */
  async update(id: string, updates: Partial<Partner>): Promise<Partner> {
    const { data, error } = await this.supabase
      .from('partners')
      .update(updates)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Delete partner (soft delete by changing status)
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('partners')
      .update({ status: 'inactive' })
      .eq('id', id)
      .eq('tenant_id', this.tenantId)

    if (error) throw error
  }

  /**
   * Hard delete partner
   */
  async hardDelete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('partners')
      .delete()
      .eq('id', id)
      .eq('tenant_id', this.tenantId)

    if (error) throw error
  }

  /**
   * Get partners by territory
   */
  async getByTerritory(territory_id: string): Promise<Partner[]> {
    const { data, error } = await this.supabase
      .from('partners')
      .select('*')
      .eq('territory_id', territory_id)
      .eq('tenant_id', this.tenantId)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  }

  /**
   * Get partner statistics
   */
  async getStats() {
    const { data, error } = await this.supabase
      .from('partners')
      .select('status, brand, type')
      .eq('tenant_id', this.tenantId)

    if (error) throw error

    const stats = {
      total: data?.length || 0,
      by_status: {} as Record<string, number>,
      by_brand: {} as Record<string, number>,
      by_type: {} as Record<string, number>
    }

    data?.forEach(partner => {
      // Count by status
      stats.by_status[partner.status] = (stats.by_status[partner.status] || 0) + 1
      
      // Count by brand
      if (partner.brand) {
        stats.by_brand[partner.brand] = (stats.by_brand[partner.brand] || 0) + 1
      }
      
      // Count by type
      if (partner.type) {
        stats.by_type[partner.type] = (stats.by_type[partner.type] || 0) + 1
      }
    })

    return stats
  }

  /**
   * Search partners by location (proximity)
   */
  async searchByLocation(latitude: number, longitude: number, radius_km: number = 10): Promise<Partner[]> {
    // Simple radius search using Haversine formula approximation
    // For production, use PostGIS extension for better performance
    
    const { data, error } = await this.supabase
      .from('partners')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)

    if (error) throw error

    // Filter by distance client-side (for now)
    const filtered = data?.filter(partner => {
      if (!partner.latitude || !partner.longitude) return false
      
      const distance = this.calculateDistance(
        latitude,
        longitude,
        partner.latitude,
        partner.longitude
      )
      
      return distance <= radius_km
    })

    return filtered || []
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth radius in km
    const dLat = this.toRad(lat2 - lat1)
    const dLon = this.toRad(lon2 - lon1)
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180)
  }
}
