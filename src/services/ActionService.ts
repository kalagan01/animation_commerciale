/**
 * Service de gestion des Actions
 */

import type { SupabaseClient } from '../lib/supabase'
import type { Action } from '../types'

export class ActionService {
  constructor(private supabase: SupabaseClient, private tenantId: string) {}

  async getAll(params: {
    page?: number
    limit?: number
    status?: string
    assigned_to?: string
    priority?: string
  } = {}) {
    const page = params.page || 1
    const limit = params.limit || 50
    const offset = (page - 1) * limit

    const filter: Record<string, any> = {
      tenant_id: this.tenantId,
    }

    if (params.status) filter.status = params.status
    if (params.assigned_to) filter.assigned_to = params.assigned_to
    if (params.priority) filter.priority = params.priority

    const { data, error } = await this.supabase.query<Action>('actions', {
      select: '*,store:stores(*),created_by_user:users!created_by(*),assigned_to_user:users!assigned_to(*)',
      filter,
      order: { column: 'due_at', ascending: true },
      limit,
      offset,
    })

    if (error) throw error

    const { count } = await this.supabase.count('actions', filter)

    return {
      data: data as Action[],
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
    const { data, error } = await this.supabase.query<Action>('actions', {
      select: '*,store:stores(*),created_by_user:users!created_by(*),assigned_to_user:users!assigned_to(*)',
      filter: { id, tenant_id: this.tenantId },
      single: true,
    })

    if (error) throw error
    return data as Action
  }

  async create(data: Partial<Action>) {
    const { data: result, error } = await this.supabase.insert<Action>('actions', {
      ...data,
      tenant_id: this.tenantId,
      status: 'open',
    })

    if (error) throw error
    return Array.isArray(result) ? result[0] : result
  }

  async update(id: string, data: Partial<Action>) {
    const { data: result, error } = await this.supabase.update<Action>(
      'actions',
      { id, tenant_id: this.tenantId },
      data
    )

    if (error) throw error
    return Array.isArray(result) ? result[0] : result
  }

  async complete(id: string, data: { result_code: string; comment?: string }) {
    return this.update(id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      result_code: data.result_code,
      completion_comment: data.comment,
    })
  }

  async delete(id: string) {
    const { error } = await this.supabase.delete('actions', {
      id,
      tenant_id: this.tenantId,
    })

    if (error) throw error
    return { success: true }
  }
}
