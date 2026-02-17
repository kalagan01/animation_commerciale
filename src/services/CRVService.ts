/**
 * Service de gestion des CRV (Comptes Rendus de Visite)
 */

import type { SupabaseClient } from '../lib/supabase'
import type { CRV } from '../types'

export class CRVService {
  constructor(private supabase: SupabaseClient, private tenantId: string) {}

  async getByVisitId(visitId: string) {
    const { data, error } = await this.supabase.query<CRV>('crvs', {
      select: '*,template:crv_templates(*),attachments:crv_attachments(*)',
      filter: { visit_id: visitId, tenant_id: this.tenantId },
      single: true,
    })

    if (error) {
      // Si pas de CRV, retourner un draft vide
      return null
    }

    return data as CRV
  }

  async create(data: Partial<CRV>) {
    const { data: result, error } = await this.supabase.insert<CRV>('crvs', {
      ...data,
      tenant_id: this.tenantId,
      status: 'draft',
      answers: data.answers || {},
    })

    if (error) throw error
    return Array.isArray(result) ? result[0] : result
  }

  async update(visitId: string, data: Partial<CRV>) {
    const { data: result, error } = await this.supabase.update<CRV>(
      'crvs',
      { visit_id: visitId, tenant_id: this.tenantId },
      data
    )

    if (error) throw error
    return Array.isArray(result) ? result[0] : result
  }

  async submit(visitId: string, userId: string) {
    return this.update(visitId, {
      status: 'submitted',
      submitted_by: userId,
      submitted_at: new Date().toISOString(),
    })
  }

  async getTemplates() {
    const { data, error } = await this.supabase.query('crv_templates', {
      filter: { tenant_id: this.tenantId, is_active: true },
      order: { column: 'name', ascending: true },
    })

    if (error) throw error
    return data
  }

  async getTemplateById(templateId: string) {
    const { data, error } = await this.supabase.query('crv_templates', {
      filter: { id: templateId, tenant_id: this.tenantId },
      single: true,
    })

    if (error) throw error
    return data
  }
}
