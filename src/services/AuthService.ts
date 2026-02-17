/**
 * Service d'authentification
 * Mock pour SSO - À remplacer par Azure AD en production
 */

export interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'manager' | 'supervisor' | 'agent'
  tenant_id: string
  scope?: {
    region_id?: string
    territory_id?: string
    team_id?: string
  }
}

export interface AuthToken {
  token: string
  user: User
  expires_at: string
}

/**
 * Mock users pour développement
 */
const MOCK_USERS: User[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440101',
    email: 'admin@neoimpact.ma',
    full_name: 'Admin System',
    role: 'admin',
    tenant_id: '550e8400-e29b-41d4-a716-446655440000',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440102',
    email: 'manager@neoimpact.ma',
    full_name: 'Manager Commercial',
    role: 'manager',
    tenant_id: '550e8400-e29b-41d4-a716-446655440000',
    scope: { region_id: '550e8400-e29b-41d4-a716-446655440011' }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440103',
    email: 'supervisor@neoimpact.ma',
    full_name: 'Superviseur Terrain',
    role: 'supervisor',
    tenant_id: '550e8400-e29b-41d4-a716-446655440000',
    scope: { territory_id: '550e8400-e29b-41d4-a716-446655440021' }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440104',
    email: 'agent@neoimpact.ma',
    full_name: 'Agent Terrain',
    role: 'agent',
    tenant_id: '550e8400-e29b-41d4-a716-446655440000',
  }
]

export class AuthService {
  /**
   * Authentifier un utilisateur (Mock)
   */
  async login(email: string, password: string): Promise<AuthToken | null> {
    // Mock authentication - En prod: appel Azure AD/OAuth
    const user = MOCK_USERS.find(u => u.email === email)
    
    if (!user || password !== 'demo123') {
      return null
    }

    // Générer un token JWT simple (en prod: vrai JWT signé)
    const token = Buffer.from(JSON.stringify({ 
      userId: user.id, 
      role: user.role,
      exp: Date.now() + 3600000 // 1h
    })).toString('base64')

    return {
      token,
      user,
      expires_at: new Date(Date.now() + 3600000).toISOString()
    }
  }

  /**
   * Valider un token JWT
   */
  async validateToken(token: string): Promise<User | null> {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'))
      
      // Vérifier expiration
      if (decoded.exp < Date.now()) {
        return null
      }

      // Retrouver l'utilisateur
      const user = MOCK_USERS.find(u => u.id === decoded.userId)
      return user || null
    } catch {
      return null
    }
  }

  /**
   * Vérifier si un utilisateur a un rôle spécifique
   */
  hasRole(user: User, allowedRoles: string[]): boolean {
    return allowedRoles.includes(user.role)
  }

  /**
   * Vérifier permissions ABAC (Attribute-Based Access Control)
   */
  canAccess(user: User, resource: string, action: string): boolean {
    // Admin a tous les droits
    if (user.role === 'admin') return true

    // Manager peut tout gérer dans sa région
    if (user.role === 'manager' && user.scope?.region_id) {
      return ['read', 'write', 'delete'].includes(action)
    }

    // Supervisor peut lire/écrire dans son territoire
    if (user.role === 'supervisor' && user.scope?.territory_id) {
      return ['read', 'write'].includes(action)
    }

    // Agent peut seulement lire
    if (user.role === 'agent') {
      return action === 'read'
    }

    return false
  }
}
