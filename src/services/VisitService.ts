/**
 * Service de gestion des Visites
 */

import type { SupabaseClient } from '../lib/supabase'
import type { Visit } from '../types'

export class VisitService {
  constructor(private supabase: SupabaseClient, private tenantId: string) {}

  async getAll(params: {
    page?: number
    limit?: number
    status?: string
    assigned_to?: string
    start_date?: string
    end_date?: string
  } = {}) {
    const page = params.page || 1
    const limit = params.limit || 50
    const offset = (page - 1) * limit

    const filter: Record<string, any> = {
      tenant_id: this.tenantId,
    }

    if (params.status) filter.status = params.status
    if (params.assigned_to) filter.assigned_to = params.assigned_to

    const { data, error } = await this.supabase.query<Visit>('visits', {
      select: '*,store:stores(*),created_by_user:users!created_by(*),assigned_to_user:users!assigned_to(*)',
      filter,
      order: { column: 'planned_at', ascending: false },
      limit,
      offset,
    })

    if (error) throw error

    const { count } = await this.supabase.count('visits', filter)

    return {
      data: data as Visit[],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
        has_next: (count || 0) > page * limit,
        has_prev: page > 1,
      },
    }
  }

  async getById(id: string) {
    const { data, error } = await this.supabase.query<Visit>('visits', {
      select: '*,store:stores(*),created_by_user:users!created_by(*),assigned_to_user:users!assigned_to(*)',
      filter: { id, tenant_id: this.tenantId },
      single: true,
    })

    if (error) throw error
    return data as Visit
  }

  async create(data: Partial<Visit>) {
    const { data: result, error } = await this.supabase.insert<Visit>('visits', {
      ...data,
      tenant_id: this.tenantId,
      status: 'planned',
    })

    if (error) throw error
    return Array.isArray(result) ? result[0] : result
  }

  async update(id: string, data: Partial<Visit>) {
    const { data: result, error } = await this.supabase.update<Visit>(
      'visits',
      { id, tenant_id: this.tenantId },
      data
    )

    if (error) throw error
    return Array.isArray(result) ? result[0] : result
  }

  async checkin(id: string, data: { latitude: number; longitude: number }) {
    return this.update(id, {
      checkin_at: new Date().toISOString(),
      checkin_latitude: data.latitude,
      checkin_longitude: data.longitude,
      status: 'in_progress',
    })
  }

  async checkout(id: string, data: { latitude: number; longitude: number }) {
    return this.update(id, {
      checkout_at: new Date().toISOString(),
      checkout_latitude: data.latitude,
      checkout_longitude: data.longitude,
      status: 'completed',
    })
  }

  async delete(id: string) {
    const { error } = await this.supabase.delete('visits', {
      id,
      tenant_id: this.tenantId,
    })

    if (error) throw error
    return { success: true }
  }
}
