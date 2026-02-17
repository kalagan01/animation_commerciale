import { Hono } from 'hono'
import { createSupabaseClient } from '../lib/supabase'
import { generateAccessToken, generateRefreshToken, verifyToken } from '../lib/jwt'

type Bindings = {
  SUPABASE_URL?: string
  SUPABASE_ANON_KEY?: string
  SUPABASE_SERVICE_KEY?: string
  JWT_SECRET?: string
  JWT_EXPIRES_IN?: string
  USE_MOCK_DATA?: string
}

const app = new Hono<{ Bindings: Bindings }>()

/**
 * POST /api/v1/auth/login
 * Authentifie un utilisateur et retourne un JWT token
 */
app.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    if (!email || !password) {
      return c.json({ 
        success: false, 
        error: 'Email et password requis' 
      }, 400)
    }

    const supabase = createSupabaseClient(c.env)
    
    if (!supabase) {
      return c.json({ 
        success: false, 
        error: 'Supabase not configured' 
      }, 500)
    }

    // Authentifier avec Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      return c.json({ 
        success: false, 
        error: 'Identifiants invalides',
        details: authError.message
      }, 401)
    }

    // Récupérer l'utilisateur complet depuis la table users
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (userError || !user) {
      return c.json({ 
        success: false, 
        error: 'Utilisateur non trouvé dans la base de données',
        details: userError?.message
      }, 404)
    }

    // Générer JWT tokens
    const jwtSecret = c.env.JWT_SECRET || 'fallback-secret-change-in-production'
    const expiresIn = parseInt(c.env.JWT_EXPIRES_IN || '3600')

    const accessToken = await generateAccessToken({
      sub: user.id,
      tenant_id: user.tenant_id,
      role: user.role,
      email: user.email
    }, jwtSecret, expiresIn)

    const refreshToken = await generateRefreshToken({
      sub: user.id,
      tenant_id: user.tenant_id,
      role: user.role,
      email: user.email
    }, jwtSecret)

    // Mettre à jour last_login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    return c.json({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: expiresIn,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          tenant_id: user.tenant_id,
          organisation_id: user.organisation_id,
          territory_id: user.territory_id,
          avatar_url: user.avatar_url
        }
      }
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return c.json({ 
      success: false, 
      error: 'Erreur serveur lors de l\'authentification',
      details: error.message
    }, 500)
  }
})

/**
 * POST /api/v1/auth/refresh
 * Rafraîchit un access token en utilisant un refresh token
 */
app.post('/refresh', async (c) => {
  try {
    const { refresh_token } = await c.req.json()
    
    if (!refresh_token) {
      return c.json({ 
        success: false, 
        error: 'Refresh token requis' 
      }, 400)
    }

    const jwtSecret = c.env.JWT_SECRET || 'fallback-secret-change-in-production'
    
    // Vérifier le refresh token
    const payload = await verifyToken(refresh_token, jwtSecret)
    
    // Générer nouveau access token
    const expiresIn = parseInt(c.env.JWT_EXPIRES_IN || '3600')
    const accessToken = await generateAccessToken({
      sub: payload.sub,
      tenant_id: payload.tenant_id,
      role: payload.role,
      email: payload.email
    }, jwtSecret, expiresIn)

    return c.json({
      success: true,
      data: {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: expiresIn
      }
    })
  } catch (error: any) {
    return c.json({ 
      success: false, 
      error: 'Invalid or expired refresh token',
      details: error.message
    }, 401)
  }
})

/**
 * GET /api/v1/auth/me
 * Retourne les informations de l'utilisateur courant
 * Nécessite un token valide
 */
app.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'Unauthorized' }, 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const jwtSecret = c.env.JWT_SECRET || 'fallback-secret-change-in-production'
    const payload = await verifyToken(token, jwtSecret)

    const supabase = createSupabaseClient(c.env)
    
    if (!supabase) {
      return c.json({ 
        success: false, 
        error: 'Supabase not configured' 
      }, 500)
    }

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        organisation:organisations(id, code, name, type),
        territory:territories(id, code, name, city)
      `)
      .eq('id', payload.sub)
      .single()

    if (error || !user) {
      return c.json({ 
        success: false, 
        error: 'User not found',
        details: error?.message
      }, 404)
    }

    return c.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role,
        tenant_id: user.tenant_id,
        organisation: user.organisation,
        territory: user.territory,
        avatar_url: user.avatar_url,
        preferences: user.preferences,
        status: user.status,
        last_login: user.last_login,
        created_at: user.created_at
      }
    })
  } catch (error: any) {
    return c.json({ 
      success: false, 
      error: 'Unauthorized',
      details: error.message
    }, 401)
  }
})

/**
 * POST /api/v1/auth/logout
 * Déconnecte l'utilisateur (côté client, il faut supprimer le token)
 */
app.post('/logout', async (c) => {
  // Avec JWT, le logout est géré côté client en supprimant le token
  // Optionnellement, on peut blacklister le token ici
  
  return c.json({
    success: true,
    message: 'Logged out successfully'
  })
})

export default app
