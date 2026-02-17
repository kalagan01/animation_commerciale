/**
 * Service KPI & Dashboards
 */

import type { SupabaseClient } from '../lib/supabase'

export class DashboardService {
  constructor(private supabase: SupabaseClient, private tenantId: string) {}

  async getKPIs(params: { period?: string; user_id?: string } = {}) {
    // Pour le MVP, retourner des KPIs agrégés
    // En production, calculer depuis les tables visits, crvs, actions, incidents
    
    const kpis = {
      period: params.period || 'current_month',
      visits: {
        planned: await this.countVisits({ status: 'planned' }),
        completed: await this.countVisits({ status: 'completed' }),
        in_progress: await this.countVisits({ status: 'in_progress' }),
        missed: await this.countVisits({ status: 'missed' }),
        completion_rate: 0,
      },
      crvs: {
        submitted: await this.countCRVs({ status: 'submitted' }),
        draft: await this.countCRVs({ status: 'draft' }),
        pending_validation: await this.countCRVs({ status: 'pending' }),
      },
      actions: {
        open: await this.countActions({ status: 'open' }),
        completed: await this.countActions({ status: 'completed' }),
        overdue: 0, // À calculer avec due_at < now()
      },
      incidents: {
        open: await this.countIncidents({ status: 'open' }),
        resolved: await this.countIncidents({ status: 'resolved' }),
        critical: await this.countIncidents({ severity: 'critical', status: 'open' }),
      },
      sla_compliance: 0.92, // À calculer
    }

    // Calculer taux de completion
    if (kpis.visits.planned > 0) {
      kpis.visits.completion_rate = kpis.visits.completed / kpis.visits.planned
    }

    return kpis
  }

  private async countVisits(filter: Record<string, any>) {
    const { count } = await this.supabase.count('visits', {
      ...filter,
      tenant_id: this.tenantId,
    })
    return count || 0
  }

  private async countCRVs(filter: Record<string, any>) {
    const { count } = await this.supabase.count('crvs', {
      ...filter,
      tenant_id: this.tenantId,
    })
    return count || 0
  }

  private async countActions(filter: Record<string, any>) {
    const { count } = await this.supabase.count('actions', {
      ...filter,
      tenant_id: this.tenantId,
    })
    return count || 0
  }

  private async countIncidents(filter: Record<string, any>) {
    const { count } = await this.supabase.count('incidents', {
      ...filter,
      tenant_id: this.tenantId,
    })
    return count || 0
  }

  async getActivityTimeline(params: { days?: number; user_id?: string } = {}) {
    // Retourner l'activité des N derniers jours
    return {
      days: params.days || 7,
      timeline: [], // À implémenter avec agrégation SQL
    }
  }

  async getStorePerformance(params: { limit?: number } = {}) {
    // Top/Bottom stores par performance
    return {
      top_stores: [],
      bottom_stores: [],
    }
  }
}
