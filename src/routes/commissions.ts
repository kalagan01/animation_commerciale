// Automatic Commission Engine API
// Calcul automatique multi-niveaux avec règles configurables
// Version: 1.0.0
// Date: 14 février 2026

import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();
app.use('*', cors());

// Types
interface CommissionRule {
  rule_id: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'tiered' | 'hybrid';
  entity_type: 'sale' | 'lead' | 'visit' | 'action' | 'custom';
  
  // Calculation parameters
  calculation_basis: 'amount' | 'quantity' | 'score' | 'custom';
  percentage?: number; // Pour type percentage
  fixed_amount?: number; // Pour type fixed_amount
  tiers?: CommissionTier[]; // Pour type tiered
  
  // Multi-level
  levels: CommissionLevel[];
  
  // Conditions
  conditions?: CommissionCondition[];
  min_threshold?: number;
  max_cap?: number;
  
  // Status
  active: boolean;
  effective_from: string;
  effective_to?: string;
  
  // Metadata
  currency: string;
  payment_frequency: 'immediate' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  metadata?: any;
}

interface CommissionTier {
  tier_level: number;
  min_value: number;
  max_value?: number;
  rate_percentage?: number;
  fixed_amount?: number;
}

interface CommissionLevel {
  level: number; // 1=animator, 2=manager, 3=director
  role: string;
  allocation_percentage: number; // % du total à ce niveau
  min_amount?: number;
  max_amount?: number;
}

interface CommissionCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in';
  value: any;
}

interface CommissionCalculation {
  calculation_id: string;
  rule_id: string;
  entity_type: string;
  entity_id: string;
  
  // Participants
  animator_id: string;
  manager_id?: string;
  director_id?: string;
  
  // Calculation details
  basis_value: number; // Montant/quantité de base
  calculated_amount: number; // Total commission
  
  // Multi-level breakdown
  level_breakdown: {
    level: number;
    recipient_id: string;
    recipient_role: string;
    amount: number;
    allocation_percentage: number;
  }[];
  
  // Status
  status: 'pending' | 'approved' | 'paid' | 'rejected' | 'on_hold';
  calculation_date: string;
  approval_date?: string;
  payment_date?: string;
  
  // Metadata
  metadata?: any;
}

interface CommissionPayment {
  payment_id: string;
  recipient_id: string;
  period_start: string;
  period_end: string;
  
  // Aggregated amounts
  total_amount: number;
  total_calculations: number;
  breakdown_by_rule: {
    rule_id: string;
    rule_name: string;
    amount: number;
    count: number;
  }[];
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payment_method?: string;
  payment_reference?: string;
  
  // Timestamps
  created_at: string;
  processed_at?: string;
  completed_at?: string;
}

interface SimulationRequest {
  rule_id: string;
  entity_type: string;
  basis_value: number;
  animator_id: string;
  manager_id?: string;
  director_id?: string;
}

// ==================== ENDPOINTS ====================

/**
 * POST /api/commissions/rules
 * Crée une nouvelle règle de commission
 */
app.post('/api/commissions/rules', async (c) => {
  try {
    const rule: Partial<CommissionRule> = await c.req.json();
    
    // Validation
    if (!rule.name || !rule.type || !rule.entity_type || !rule.levels?.length) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Valider somme allocations = 100%
    const totalAllocation = rule.levels.reduce((sum, level) => sum + level.allocation_percentage, 0);
    if (Math.abs(totalAllocation - 100) > 0.01) {
      return c.json({ error: 'Level allocations must sum to 100%' }, 400);
    }
    
    const supabaseUrl = c.env.SUPABASE_URL;
    const supabaseKey = c.env.SUPABASE_ANON_KEY;
    
    const newRule = {
      rule_id: crypto.randomUUID(),
      name: rule.name,
      description: rule.description,
      type: rule.type,
      entity_type: rule.entity_type,
      calculation_basis: rule.calculation_basis || 'amount',
      percentage: rule.percentage,
      fixed_amount: rule.fixed_amount,
      tiers: rule.tiers,
      levels: rule.levels,
      conditions: rule.conditions,
      min_threshold: rule.min_threshold,
      max_cap: rule.max_cap,
      active: rule.active ?? true,
      effective_from: rule.effective_from || new Date().toISOString(),
      effective_to: rule.effective_to,
      currency: rule.currency || 'MAD',
      payment_frequency: rule.payment_frequency || 'monthly',
      metadata: rule.metadata,
      created_at: new Date().toISOString(),
    };
    
    await fetch(`${supabaseUrl}/rest/v1/commission_rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(newRule),
    });
    
    return c.json({ success: true, rule: newRule });
    
  } catch (error: any) {
    console.error('Create rule error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * GET /api/commissions/rules
 * Liste toutes les règles de commission
 */
app.get('/api/commissions/rules', async (c) => {
  try {
    const active = c.req.query('active');
    const entityType = c.req.query('entity_type');
    
    const supabaseUrl = c.env.SUPABASE_URL;
    const supabaseKey = c.env.SUPABASE_ANON_KEY;
    
    let url = `${supabaseUrl}/rest/v1/commission_rules?select=*&order=created_at.desc`;
    if (active !== undefined) url += `&active=eq.${active}`;
    if (entityType) url += `&entity_type=eq.${entityType}`;
    
    const response = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });
    
    const rules = await response.json();
    
    return c.json({
      success: true,
      total_rules: rules.length,
      rules,
    });
    
  } catch (error: any) {
    console.error('List rules error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * POST /api/commissions/calculate
 * Calcule la commission pour une entité (sale, lead, visit, etc.)
 */
app.post('/api/commissions/calculate', async (c) => {
  try {
    const request = await c.req.json();
    
    const {
      rule_id,
      entity_type,
      entity_id,
      basis_value,
      animator_id,
      manager_id,
      director_id,
      metadata,
    } = request;
    
    // Validation
    if (!rule_id || !entity_type || !entity_id || !basis_value || !animator_id) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const supabaseUrl = c.env.SUPABASE_URL;
    const supabaseKey = c.env.SUPABASE_ANON_KEY;
    
    // 1. Récupérer la règle
    const ruleResponse = await fetch(
      `${supabaseUrl}/rest/v1/commission_rules?rule_id=eq.${rule_id}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );
    
    const rules = await ruleResponse.json();
    if (!rules?.length) {
      return c.json({ error: 'Rule not found' }, 404);
    }
    
    const rule: CommissionRule = rules[0];
    
    if (!rule.active) {
      return c.json({ error: 'Rule is not active' }, 400);
    }
    
    // 2. Vérifier conditions
    if (rule.conditions?.length) {
      // TODO: Implémenter validation conditions
      // Pour l'instant, on assume que les conditions sont remplies
    }
    
    // 3. Calculer montant total selon type
    let totalAmount = 0;
    
    if (rule.type === 'percentage' && rule.percentage) {
      totalAmount = (basis_value * rule.percentage) / 100;
    } else if (rule.type === 'fixed_amount' && rule.fixed_amount) {
      totalAmount = rule.fixed_amount;
    } else if (rule.type === 'tiered' && rule.tiers?.length) {
      // Calcul par paliers
      totalAmount = calculateTieredCommission(basis_value, rule.tiers);
    } else if (rule.type === 'hybrid') {
      // Combinaison percentage + fixed
      totalAmount = (rule.fixed_amount || 0) + ((basis_value * (rule.percentage || 0)) / 100);
    }
    
    // Appliquer seuils
    if (rule.min_threshold && totalAmount < rule.min_threshold) {
      totalAmount = 0; // Ne pas payer si en dessous du seuil
    }
    
    if (rule.max_cap && totalAmount > rule.max_cap) {
      totalAmount = rule.max_cap;
    }
    
    // 4. Répartir sur les niveaux
    const levelBreakdown: CommissionCalculation['level_breakdown'] = [];
    
    for (const level of rule.levels) {
      let recipientId: string | undefined;
      
      if (level.level === 1) recipientId = animator_id;
      else if (level.level === 2) recipientId = manager_id;
      else if (level.level === 3) recipientId = director_id;
      
      if (!recipientId) continue; // Skip si pas de bénéficiaire à ce niveau
      
      let levelAmount = (totalAmount * level.allocation_percentage) / 100;
      
      // Appliquer min/max par niveau
      if (level.min_amount && levelAmount < level.min_amount) levelAmount = level.min_amount;
      if (level.max_amount && levelAmount > level.max_amount) levelAmount = level.max_amount;
      
      levelBreakdown.push({
        level: level.level,
        recipient_id: recipientId,
        recipient_role: level.role,
        amount: levelAmount,
        allocation_percentage: level.allocation_percentage,
      });
    }
    
    // 5. Créer le calcul
    const calculation: CommissionCalculation = {
      calculation_id: crypto.randomUUID(),
      rule_id,
      entity_type,
      entity_id,
      animator_id,
      manager_id,
      director_id,
      basis_value,
      calculated_amount: totalAmount,
      level_breakdown: levelBreakdown,
      status: 'pending',
      calculation_date: new Date().toISOString(),
      metadata,
    };
    
    // 6. Sauvegarder
    await fetch(`${supabaseUrl}/rest/v1/commission_calculations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(calculation),
    });
    
    return c.json({
      success: true,
      calculation,
      summary: {
        total_amount: totalAmount,
        currency: rule.currency,
        recipients_count: levelBreakdown.length,
        breakdown: levelBreakdown.map(b => ({
          role: b.recipient_role,
          amount: b.amount,
          percentage: b.allocation_percentage,
        })),
      },
    });
    
  } catch (error: any) {
    console.error('Calculate commission error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * POST /api/commissions/simulate
 * Simule le calcul de commission sans enregistrer
 */
app.post('/api/commissions/simulate', async (c) => {
  try {
    const request: SimulationRequest = await c.req.json();
    
    const supabaseUrl = c.env.SUPABASE_URL;
    const supabaseKey = c.env.SUPABASE_ANON_KEY;
    
    // Récupérer la règle
    const ruleResponse = await fetch(
      `${supabaseUrl}/rest/v1/commission_rules?rule_id=eq.${request.rule_id}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );
    
    const rules = await ruleResponse.json();
    if (!rules?.length) {
      return c.json({ error: 'Rule not found' }, 404);
    }
    
    const rule: CommissionRule = rules[0];
    
    // Calculer montant total
    let totalAmount = 0;
    
    if (rule.type === 'percentage' && rule.percentage) {
      totalAmount = (request.basis_value * rule.percentage) / 100;
    } else if (rule.type === 'fixed_amount' && rule.fixed_amount) {
      totalAmount = rule.fixed_amount;
    } else if (rule.type === 'tiered' && rule.tiers?.length) {
      totalAmount = calculateTieredCommission(request.basis_value, rule.tiers);
    } else if (rule.type === 'hybrid') {
      totalAmount = (rule.fixed_amount || 0) + ((request.basis_value * (rule.percentage || 0)) / 100);
    }
    
    // Appliquer seuils
    if (rule.min_threshold && totalAmount < rule.min_threshold) totalAmount = 0;
    if (rule.max_cap && totalAmount > rule.max_cap) totalAmount = rule.max_cap;
    
    // Répartir sur niveaux
    const breakdown = rule.levels.map(level => {
      let recipientId: string | undefined;
      if (level.level === 1) recipientId = request.animator_id;
      else if (level.level === 2) recipientId = request.manager_id;
      else if (level.level === 3) recipientId = request.director_id;
      
      let amount = (totalAmount * level.allocation_percentage) / 100;
      if (level.min_amount && amount < level.min_amount) amount = level.min_amount;
      if (level.max_amount && amount > level.max_amount) amount = level.max_amount;
      
      return {
        level: level.level,
        role: level.role,
        recipient_id: recipientId,
        amount,
        allocation_percentage: level.allocation_percentage,
      };
    });
    
    return c.json({
      success: true,
      simulation: {
        rule_name: rule.name,
        basis_value: request.basis_value,
        total_amount: totalAmount,
        currency: rule.currency,
        breakdown,
      },
    });
    
  } catch (error: any) {
    console.error('Simulation error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * GET /api/commissions/calculations/:recipientId
 * Récupère l'historique des calculs pour un bénéficiaire
 */
app.get('/api/commissions/calculations/:recipientId', async (c) => {
  try {
    const recipientId = c.req.param('recipientId');
    const status = c.req.query('status');
    const startDate = c.req.query('start_date') || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = c.req.query('end_date') || new Date().toISOString();
    const limit = parseInt(c.req.query('limit') || '100');
    
    const supabaseUrl = c.env.SUPABASE_URL;
    const supabaseKey = c.env.SUPABASE_ANON_KEY;
    
    // Requête pour trouver tous les calculs où recipient est dans level_breakdown
    let url = `${supabaseUrl}/rest/v1/commission_calculations?calculation_date=gte.${startDate}&calculation_date=lte.${endDate}&order=calculation_date.desc&limit=${limit}`;
    if (status) url += `&status=eq.${status}`;
    
    const response = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });
    
    const allCalculations = await response.json();
    
    // Filtrer ceux où recipientId est dans level_breakdown
    const calculations = allCalculations.filter((calc: any) => {
      return calc.level_breakdown?.some((b: any) => b.recipient_id === recipientId);
    });
    
    // Calculer statistiques
    const stats = {
      total_calculations: calculations.length,
      total_amount: calculations.reduce((sum: number, calc: any) => {
        const recipientBreakdown = calc.level_breakdown?.find((b: any) => b.recipient_id === recipientId);
        return sum + (recipientBreakdown?.amount || 0);
      }, 0),
      by_status: {
        pending: calculations.filter((c: any) => c.status === 'pending').length,
        approved: calculations.filter((c: any) => c.status === 'approved').length,
        paid: calculations.filter((c: any) => c.status === 'paid').length,
        rejected: calculations.filter((c: any) => c.status === 'rejected').length,
      },
    };
    
    return c.json({
      success: true,
      recipient_id: recipientId,
      period: { start: startDate, end: endDate },
      statistics: stats,
      calculations: calculations.map((calc: any) => {
        const recipientBreakdown = calc.level_breakdown?.find((b: any) => b.recipient_id === recipientId);
        return {
          calculation_id: calc.calculation_id,
          rule_id: calc.rule_id,
          entity_type: calc.entity_type,
          entity_id: calc.entity_id,
          basis_value: calc.basis_value,
          my_amount: recipientBreakdown?.amount || 0,
          my_role: recipientBreakdown?.recipient_role,
          status: calc.status,
          calculation_date: calc.calculation_date,
          approval_date: calc.approval_date,
          payment_date: calc.payment_date,
        };
      }),
    });
    
  } catch (error: any) {
    console.error('Calculations history error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * PUT /api/commissions/calculations/:calculationId/status
 * Met à jour le statut d'un calcul (approve, reject, pay)
 */
app.put('/api/commissions/calculations/:calculationId/status', async (c) => {
  try {
    const calculationId = c.req.param('calculationId');
    const { status, reason } = await c.req.json();
    
    if (!['approved', 'rejected', 'paid', 'on_hold'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }
    
    const supabaseUrl = c.env.SUPABASE_URL;
    const supabaseKey = c.env.SUPABASE_ANON_KEY;
    
    const updateData: any = { status };
    if (status === 'approved') updateData.approval_date = new Date().toISOString();
    if (status === 'paid') updateData.payment_date = new Date().toISOString();
    if (reason) updateData.metadata = { reason };
    
    await fetch(`${supabaseUrl}/rest/v1/commission_calculations?calculation_id=eq.${calculationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(updateData),
    });
    
    return c.json({ success: true, message: `Calculation status updated to ${status}` });
    
  } catch (error: any) {
    console.error('Update status error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * POST /api/commissions/payments/generate
 * Génère un paiement groupé pour une période
 */
app.post('/api/commissions/payments/generate', async (c) => {
  try {
    const { recipient_id, period_start, period_end } = await c.req.json();
    
    if (!recipient_id || !period_start || !period_end) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    const supabaseUrl = c.env.SUPABASE_URL;
    const supabaseKey = c.env.SUPABASE_ANON_KEY;
    
    // Récupérer tous les calculs approuvés non payés pour la période
    const response = await fetch(
      `${supabaseUrl}/rest/v1/commission_calculations?status=eq.approved&calculation_date=gte.${period_start}&calculation_date=lte.${period_end}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );
    
    const allCalculations = await response.json();
    
    // Filtrer par recipient
    const calculations = allCalculations.filter((calc: any) => {
      return calc.level_breakdown?.some((b: any) => b.recipient_id === recipient_id);
    });
    
    if (!calculations.length) {
      return c.json({ error: 'No approved calculations found for this period' }, 404);
    }
    
    // Agréger montants
    let totalAmount = 0;
    const breakdownByRule: any = {};
    
    calculations.forEach((calc: any) => {
      const recipientBreakdown = calc.level_breakdown?.find((b: any) => b.recipient_id === recipient_id);
      if (recipientBreakdown) {
        totalAmount += recipientBreakdown.amount;
        
        if (!breakdownByRule[calc.rule_id]) {
          breakdownByRule[calc.rule_id] = {
            rule_id: calc.rule_id,
            rule_name: '', // TODO: fetch rule name
            amount: 0,
            count: 0,
          };
        }
        breakdownByRule[calc.rule_id].amount += recipientBreakdown.amount;
        breakdownByRule[calc.rule_id].count += 1;
      }
    });
    
    // Créer le paiement
    const payment: CommissionPayment = {
      payment_id: crypto.randomUUID(),
      recipient_id,
      period_start,
      period_end,
      total_amount: totalAmount,
      total_calculations: calculations.length,
      breakdown_by_rule: Object.values(breakdownByRule),
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    
    await fetch(`${supabaseUrl}/rest/v1/commission_payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(payment),
    });
    
    // Marquer les calculs comme payés
    for (const calc of calculations) {
      await fetch(`${supabaseUrl}/rest/v1/commission_calculations?calculation_id=eq.${calc.calculation_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          status: 'paid',
          payment_date: new Date().toISOString(),
        }),
      });
    }
    
    return c.json({ success: true, payment });
    
  } catch (error: any) {
    console.error('Generate payment error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

/**
 * GET /api/commissions/payments/:recipientId
 * Liste des paiements pour un bénéficiaire
 */
app.get('/api/commissions/payments/:recipientId', async (c) => {
  try {
    const recipientId = c.req.param('recipientId');
    const status = c.req.query('status');
    const limit = parseInt(c.req.query('limit') || '50');
    
    const supabaseUrl = c.env.SUPABASE_URL;
    const supabaseKey = c.env.SUPABASE_ANON_KEY;
    
    let url = `${supabaseUrl}/rest/v1/commission_payments?recipient_id=eq.${recipientId}&order=created_at.desc&limit=${limit}`;
    if (status) url += `&status=eq.${status}`;
    
    const response = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });
    
    const payments = await response.json();
    
    return c.json({
      success: true,
      recipient_id: recipientId,
      total_payments: payments.length,
      payments,
    });
    
  } catch (error: any) {
    console.error('Payments list error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Calcule commission par paliers
 */
function calculateTieredCommission(value: number, tiers: CommissionTier[]): number {
  let totalCommission = 0;
  
  // Trier les paliers par min_value
  const sortedTiers = [...tiers].sort((a, b) => a.min_value - b.min_value);
  
  for (const tier of sortedTiers) {
    const tierMin = tier.min_value;
    const tierMax = tier.max_value || Infinity;
    
    if (value <= tierMin) continue; // Pas encore atteint ce palier
    
    const applicableValue = Math.min(value, tierMax) - tierMin;
    
    if (tier.rate_percentage) {
      totalCommission += (applicableValue * tier.rate_percentage) / 100;
    } else if (tier.fixed_amount) {
      totalCommission += tier.fixed_amount;
    }
    
    if (value <= tierMax) break; // Ne pas aller au palier suivant
  }
  
  return totalCommission;
}

export default app;
