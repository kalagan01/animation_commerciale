/**
 * Service de gestion des Incidents
 */

import type { SupabaseClient } from '../lib/supabase'
import type { Incident } from '../types'

export class IncidentService {
  constructor(private supabase: SupabaseClient, private tenantId: string) {}

  async getAll(params: {
    page?: number
    limit?: number
    status?: string
    severity?: string
  } = {}) {
    const page = params.page || 1
    const limit = params.limit || 50
    const offset = (page - 1) * limit

    const filter: Record<string, any> = {
      tenant_id: this.tenantId,
    }

    if (params.status) filter.status = params.status
    if (params.severity) filter.severity = params.severity

    const { data, error } = await this.supabase.query<Incident>('incidents', {
      select: '*,store:stores(*),reporter:users!reported_by(*)',
      filter,
      order: { column: 'reported_at', ascending: false },
      limit,
      offset,
    })

    if (error) throw error

    const { count } = await this.supabase.count('incidents', filter)

    return {
      data: data as Incident[],
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

  async create(data: Partial<Incident>) {
    const { data: result, error } = await this.supabase.insert<Incident>('incidents', {
      ...data,
      tenant_id: this.tenantId,
      status: 'open',
      reported_at: new Date().toISOString(),
    })

    if (error) throw error
    return Array.isArray(result) ? result[0] : result
  }

  async resolve(id: string, data: { resolution_comment: string }) {
    const { data: result, error } = await this.supabase.update<Incident>(
      'incidents',
      { id, tenant_id: this.tenantId },
      {
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolution_comment: data.resolution_comment,
      }
    )

    if (error) throw error
    return Array.isArray(result) ? result[0] : result
  }
}
