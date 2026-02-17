/**
 * Données mock pour développement et démonstration
 * Utilisées quand Supabase n'est pas configuré
 */

import type { Brand, Banner, Store, Visit, Action, Incident } from '../types';

// Tenant par défaut
export const DEFAULT_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

// Marques
export const mockBrands: Brand[] = [
  {
    id: 'brand-1',
    tenant_id: DEFAULT_TENANT_ID,
    code: 'RENAULT',
    name: 'Renault',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'brand-2',
    tenant_id: DEFAULT_TENANT_ID,
    code: 'PEUGEOT',
    name: 'Peugeot',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'brand-3',
    tenant_id: DEFAULT_TENANT_ID,
    code: 'SAMSUNG',
    name: 'Samsung',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// Enseignes
export const mockBanners: Banner[] = [
  {
    id: 'banner-1',
    tenant_id: DEFAULT_TENANT_ID,
    code: 'MARJANE',
    name: 'Marjane',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'banner-2',
    tenant_id: DEFAULT_TENANT_ID,
    code: 'CARREFOUR',
    name: 'Carrefour Market',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'banner-3',
    tenant_id: DEFAULT_TENANT_ID,
    code: 'ELECTROPLANET',
    name: 'Electroplanet',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// Stores
export const mockStores: Store[] = [
  {
    id: 'store-1',
    tenant_id: DEFAULT_TENANT_ID,
    banner_id: 'banner-1',
    territory_id: 'territory-1',
    code: 'MAR-CAS-001',
    name: 'Marjane Casablanca Anfa',
    address: 'Boulevard de la Corniche',
    city: 'Casablanca',
    phone: '+212 522 123 456',
    status: 'active',
    latitude: 33.5731,
    longitude: -7.5898,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'store-2',
    tenant_id: DEFAULT_TENANT_ID,
    banner_id: 'banner-1',
    territory_id: 'territory-1',
    code: 'MAR-RAB-001',
    name: 'Marjane Rabat Hay Riad',
    address: 'Avenue Annakhil',
    city: 'Rabat',
    phone: '+212 537 654 321',
    status: 'active',
    latitude: 33.9716,
    longitude: -6.8498,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'store-3',
    tenant_id: DEFAULT_TENANT_ID,
    banner_id: 'banner-2',
    territory_id: 'territory-2',
    code: 'CAR-CAS-001',
    name: 'Carrefour Casablanca Marina',
    address: 'Marina Shopping Center',
    city: 'Casablanca',
    phone: '+212 522 987 654',
    status: 'active',
    latitude: 33.5892,
    longitude: -7.6217,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'store-4',
    tenant_id: DEFAULT_TENANT_ID,
    banner_id: 'banner-3',
    territory_id: 'territory-1',
    code: 'ELP-TAN-001',
    name: 'Electroplanet Tanger',
    address: 'Avenue Mohammed VI',
    city: 'Tanger',
    phone: '+212 539 123 456',
    status: 'prospect',
    latitude: 35.7595,
    longitude: -5.8340,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'store-5',
    tenant_id: DEFAULT_TENANT_ID,
    banner_id: 'banner-1',
    territory_id: 'territory-2',
    code: 'MAR-MAR-001',
    name: 'Marjane Marrakech Menara',
    address: 'Avenue de la Menara',
    city: 'Marrakech',
    phone: '+212 524 456 789',
    status: 'active',
    latitude: 31.6295,
    longitude: -7.9811,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// Visites
export const mockVisits: Visit[] = [
  {
    id: 'visit-1',
    tenant_id: DEFAULT_TENANT_ID,
    store_id: 'store-1',
    planned_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Dans 2h
    status: 'planned',
    created_by: 'user-1',
    assigned_to: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'visit-2',
    tenant_id: DEFAULT_TENANT_ID,
    store_id: 'store-2',
    planned_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain
    status: 'planned',
    created_by: 'user-1',
    assigned_to: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'visit-3',
    tenant_id: DEFAULT_TENANT_ID,
    store_id: 'store-3',
    planned_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Hier
    checkin_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    checkout_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    created_by: 'user-1',
    assigned_to: 'user-1',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
  },
];

// Actions
export const mockActions: Action[] = [
  {
    id: 'action-1',
    tenant_id: DEFAULT_TENANT_ID,
    store_id: 'store-1',
    type: 'call',
    title: 'Appel de suivi partenaire',
    description: 'Vérifier la satisfaction et les besoins',
    due_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    status: 'open',
    priority: 'high',
    source: 'manual',
    created_by: 'user-1',
    assigned_to: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'action-2',
    tenant_id: DEFAULT_TENANT_ID,
    store_id: 'store-2',
    type: 'training',
    title: 'Formation produits crédit',
    description: 'Session formation nouveaux produits',
    due_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    status: 'open',
    priority: 'medium',
    source: 'campaign',
    created_by: 'user-1',
    assigned_to: 'user-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'action-3',
    tenant_id: DEFAULT_TENANT_ID,
    store_id: 'store-3',
    type: 'merchandising',
    title: 'Mise à jour PLV',
    description: 'Installer nouvelles affiches campagne',
    status: 'completed',
    priority: 'medium',
    source: 'crv',
    source_id: 'crv-1',
    created_by: 'user-1',
    assigned_to: 'user-1',
    completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    result_code: 'done',
    completion_comment: 'PLV installée avec succès',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

// Incidents
export const mockIncidents: Incident[] = [
  {
    id: 'incident-1',
    tenant_id: DEFAULT_TENANT_ID,
    store_id: 'store-1',
    reported_by: 'user-1',
    reported_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    category: 'tool',
    severity: 'medium',
    status: 'open',
    sla_due_at: new Date(Date.now() + 60 * 60 * 60 * 1000).toISOString(),
    description: 'Tablette partenaire ne fonctionne plus',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'incident-2',
    tenant_id: DEFAULT_TENANT_ID,
    store_id: 'store-2',
    reported_by: 'user-1',
    reported_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    category: 'process',
    severity: 'low',
    status: 'resolved',
    description: 'Délai validation dossiers trop long',
    resolution: 'Processus optimisé avec équipe back-office',
    resolved_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Helper functions pour filtrer/paginer
export function paginateMock<T>(items: T[], page: number = 1, limit: number = 50) {
  const offset = (page - 1) * limit;
  const paginatedItems = items.slice(offset, offset + limit);
  
  return {
    data: paginatedItems,
    pagination: {
      page,
      limit,
      total: items.length,
      total_pages: Math.ceil(items.length / limit),
      has_next: items.length > page * limit,
      has_prev: page > 1,
    },
  };
}

export function filterMockStores(filters: {
  status?: string;
  city?: string;
  banner_id?: string;
  territory_id?: string;
}) {
  let filtered = [...mockStores];
  
  if (filters.status) {
    filtered = filtered.filter(s => s.status === filters.status);
  }
  if (filters.city) {
    filtered = filtered.filter(s => s.city === filters.city);
  }
  if (filters.banner_id) {
    filtered = filtered.filter(s => s.banner_id === filters.banner_id);
  }
  if (filters.territory_id) {
    filtered = filtered.filter(s => s.territory_id === filters.territory_id);
  }
  
  return filtered;
}
