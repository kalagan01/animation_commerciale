import { createClient } from '@supabase/supabase-js'
import * as bcrypt from 'bcryptjs'
import { sign, verify } from 'jsonwebtoken'

// Supabase configuration (hardcoded for development)
const supabaseUrl = 'https://bddlpcxwzwgbhsohhypr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkZGxwY3h3endnYmhzb2hoeXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTQyMzcsImV4cCI6MjA4NjY3MDIzN30.KWH_rFVlQNCKrHiV-OCnwVJg0n22QSYjr2KGaxddg1g'
const jwtSecret = 'neoimpact-jwt-secret-2026-change-in-production-a8b9c0d1e2f3'

export const supabase = createClient(supabaseUrl, supabaseKey)

interface LoginResult {
  user: {
    id: string
    email: string
    name: string
    phone: string
    avatar_url: string | null
    role: {
      code: string
      name: string
      permissions: string[]
    }
    team: any
    territory: any
    organisation: any
  }
  token: string
}

export async function login(email: string, password: string): Promise<LoginResult> {
  console.log('🔍 Login attempt for:', email)
  
  // 1. Get user from database with all relationships
  // IMPORTANT: Specify exact foreign key relationships to avoid ambiguity
  // Format: tablename!foreign_key_constraint_name
  const { data: user, error } = await supabase
    .from('users')
    .select(`
      *,
      role:roles(*),
      team:teams!users_team_id_fkey(*),
      territory:territories!users_territory_id_fkey(*),
      organisation:organisations!users_organisation_id_fkey(*)
    `)
    .eq('email', email)
    .eq('status', 'active')
    .single()

  console.log('📊 Supabase query result:', { 
    hasError: !!error, 
    errorMessage: error?.message,
    hasUser: !!user,
    userEmail: user?.email
  })

  if (error || !user) {
    console.log('❌ User not found or error:', error)
    throw new Error('Invalid credentials')
  }

  console.log('✅ User found:', user.email, 'Hash:', user.password_hash?.substring(0, 20))

  // 2. Verify password
  const passwordValid = await bcrypt.compare(password, user.password_hash)
  console.log('🔐 Password check:', passwordValid ? '✅ VALID' : '❌ INVALID')
  
  if (!passwordValid) {
    throw new Error('Invalid credentials')
  }

  // 3. Generate JWT token
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    roleCode: user.role.code,
    tenantId: user.tenant_id,
    teamId: user.team_id,
    organisationId: user.organisation_id,
    territoryId: user.territory_id
  }

  const token = sign(tokenPayload, jwtSecret, { expiresIn: '8h' })

  // 4. Update last login timestamp
  await supabase
    .from('users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', user.id)

  // 5. Return user info and token
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar_url: user.avatar_url,
      role: {
        code: user.role.code,
        name: user.role.name,
        permissions: user.role.permissions || []
      },
      team: user.team,
      territory: user.territory,
      organisation: user.organisation
    },
    token
  }
}

export function verifyToken(token: string): any {
  try {
    return verify(token, jwtSecret)
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export async function getUserById(userId: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select(`
      *,
      role:roles(*),
      team:teams(*),
      territory:territories(*),
      organisation:organisations(*)
    `)
    .eq('id', userId)
    .eq('status', 'active')
    .single()

  if (error || !user) {
    throw new Error('User not found')
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    avatar_url: user.avatar_url,
    role: {
      code: user.role.code,
      name: user.role.name,
      permissions: user.role.permissions || []
    },
    team: user.team,
    territory: user.territory,
    organisation: user.organisation
  }
}
