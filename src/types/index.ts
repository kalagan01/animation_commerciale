// Types de base pour l'application NeoImpact Animation Commerciale

// ============================================================================
// RÉFÉRENTIEL PARTENAIRES
// ============================================================================

export interface Brand {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  brands?: Brand[];
}

export interface Store {
  id: string;
  tenant_id: string;
  banner_id: string;
  territory_id: string;
  portfolio_id?: string;
  code: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  status: 'prospect' | 'onboarding' | 'active' | 'dormant' | 'closed' | 'at_risk';
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
  banner?: Banner;
  territory?: Territory;
  portfolio?: Portfolio;
}

// ============================================================================
// ORGANISATION
// ============================================================================

export interface Region {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Territory {
  id: string;
  tenant_id: string;
  region_id: string;
  team_id?: string;
  code: string;
  name: string;
  geom?: any; // GeoJSON MultiPolygon
  created_at: string;
  updated_at: string;
  region?: Region;
  team?: Team;
}

export interface Team {
  id: string;
  tenant_id: string;
  name: string;
  region_id?: string;
  created_at: string;
  updated_at: string;
  region?: Region;
}

export interface Portfolio {
  id: string;
  tenant_id: string;
  team_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  team?: Team;
}

// ============================================================================
// UTILISATEURS & AUTORISATIONS
// ============================================================================

export type UserRole = 'agent' | 'supervisor' | 'manager' | 'admin' | 'auditor';

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  status: 'active' | 'inactive';
  role_id: string;
  created_at: string;
  updated_at: string;
  role?: Role;
  scope?: UserScope;
}

export interface Role {
  id: string;
  tenant_id: string;
  code: UserRole;
  name: string;
}

export interface UserScope {
  user_id: string;
  tenant_id: string;
  region_id?: string;
  territory_id?: string;
  team_id?: string;
  portfolio_id?: string;
  region?: Region;
  territory?: Territory;
  team?: Team;
  portfolio?: Portfolio;
}

// ============================================================================
// VISITES & CRV
// ============================================================================

export type VisitStatus = 'planned' | 'in_progress' | 'completed' | 'missed' | 'canceled';

export interface Visit {
  id: string;
  tenant_id: string;
  store_id: string;
  planned_at: string;
  checkin_at?: string;
  checkout_at?: string;
  status: VisitStatus;
  created_by: string;
  assigned_to?: string;
  linked_action_id?: string;
  created_at: string;
  updated_at: string;
  store?: Store;
  assignee?: User;
  crv?: CRV;
}

export interface CRVTemplate {
  id: string;
  tenant_id: string;
  name: string;
  version: number;
  schema: any; // JSON schema des sections/questions
  is_active: boolean;
  created_at: string;
}

export type CRVStatus = 'draft' | 'submitted' | 'approved' | 'returned';

export interface CRV {
  id: string;
  tenant_id: string;
  visit_id: string;
  store_id: string;
  template_id?: string;
  status: CRVStatus;
  answers: Record<string, any>;
  observations?: string;
  submitted_by?: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
  visit?: Visit;
  template?: CRVTemplate;
  attachments?: CRVAttachment[];
}

export interface CRVAttachment {
  id: string;
  tenant_id: string;
  crv_id: string;
  file_key: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

// ============================================================================
// ACTIONS & WORK QUEUE
// ============================================================================

export type ActionType = 
  | 'call' 
  | 'email' 
  | 'visit' 
  | 'training' 
  | 'merchandising' 
  | 'audit' 
  | 'corrective' 
  | 'followup' 
  | 'other';

export type ActionStatus = 'open' | 'in_progress' | 'completed' | 'canceled';
export type ActionPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ActionSource = 'manual' | 'crv' | 'incident' | 'campaign' | 'system';

export interface Action {
  id: string;
  tenant_id: string;
  store_id: string;
  type: ActionType;
  title: string;
  description?: string;
  due_at?: string;
  status: ActionStatus;
  priority: ActionPriority;
  source: ActionSource;
  source_id?: string;
  created_by: string;
  assigned_to?: string;
  completed_at?: string;
  result_code?: string;
  completion_comment?: string;
  created_at: string;
  updated_at: string;
  store?: Store;
  creator?: User;
  assignee?: User;
}

export interface WorkQueueItem {
  id: string;
  type: 'visit' | 'action' | 'crv' | 'incident';
  title: string;
  status: string;
  priority?: ActionPriority;
  due_at?: string;
  sla_state?: 'ok' | 'warning' | 'overdue';
  store?: Store;
  assigned_to?: User;
  metadata?: Record<string, any>;
}

// ============================================================================
// INCIDENTS
// ============================================================================

export type IncidentCategory = 'process' | 'tool' | 'delay' | 'commercial' | 'other';
export type IncidentSeverity = 'low' | 'medium' | 'high';
export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Incident {
  id: string;
  tenant_id: string;
  store_id: string;
  reported_by: string;
  reported_at: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  sla_due_at?: string;
  description: string;
  resolution?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  store?: Store;
  reporter?: User;
}

// ============================================================================
// REPLANIFICATION
// ============================================================================

export type RescheduleStatus = 'pending' | 'approved' | 'denied';

export interface Reschedule {
  id: string;
  tenant_id: string;
  entity_type: 'Action' | 'Visit';
  entity_id: string;
  previous_datetime: string;
  new_datetime: string;
  status: RescheduleStatus;
  reason_code: string;
  reason_text?: string;
  created_by: string;
  created_at: string;
  decided_by?: string;
  decided_at?: string;
  creator?: User;
  decider?: User;
}

// ============================================================================
// AUDIT & LOGS
// ============================================================================

export interface AuditLog {
  id: string;
  tenant_id: string;
  actor_id?: string;
  entity_type: string;
  entity_id: string;
  action: string;
  before_snapshot?: any;
  after_snapshot?: any;
  correlation_id?: string;
  created_at: string;
  actor?: User;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    has_more?: boolean;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// ============================================================================
// DASHBOARD & KPI
// ============================================================================

export interface KPISummary {
  period: string;
  visits_planned: number;
  visits_completed: number;
  visits_missed: number;
  completion_rate: number;
  crvs_pending: number;
  crvs_submitted: number;
  actions_open: number;
  actions_completed: number;
  incidents_open: number;
  incidents_resolved: number;
  sla_compliance_rate: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface AppConfig {
  tenant_id: string;
  features: {
    offline_mode: boolean;
    geolocation_required: boolean;
    photo_required: boolean;
    signature_required: boolean;
  };
  sla: {
    high_incident_hours: number;
    medium_incident_hours: number;
    low_incident_hours: number;
  };
}
