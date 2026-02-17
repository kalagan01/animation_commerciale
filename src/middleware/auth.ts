import { Context, Next } from 'hono'
import { verifyToken, getUserById } from '../services/auth'

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401)
  }

  const token = authHeader.substring(7)
  
  try {
    const payload = verifyToken(token)
    
    // Set user payload in context
    c.set('user', payload)
    c.set('userId', payload.userId)
    c.set('roleCode', payload.roleCode)
    c.set('tenantId', payload.tenantId)
    
    await next()
  } catch (error) {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401)
  }
}

export function requireRole(...allowedRoles: string[]) {
  return async (c: Context, next: Next) => {
    const roleCode = c.get('roleCode')
    
    if (!roleCode) {
      return c.json({ error: 'Unauthorized - No role found' }, 401)
    }
    
    // Admin has access to everything
    if (roleCode === 'admin') {
      await next()
      return
    }
    
    // Check if user role is allowed
    if (!allowedRoles.includes(roleCode)) {
      return c.json({ 
        error: 'Forbidden - Insufficient permissions',
        required: allowedRoles,
        current: roleCode
      }, 403)
    }
    
    await next()
  }
}

export function requirePermission(...requiredPermissions: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user')
    
    if (!user || !user.permissions) {
      return c.json({ error: 'Forbidden - No permissions found' }, 403)
    }
    
    // Admin has all permissions
    if (user.permissions.includes('*')) {
      await next()
      return
    }
    
    // Check if user has at least one of the required permissions
    const hasPermission = requiredPermissions.some(perm => 
      user.permissions.includes(perm)
    )
    
    if (!hasPermission) {
      return c.json({ 
        error: 'Forbidden - Insufficient permissions',
        required: requiredPermissions
      }, 403)
    }
    
    await next()
  }
}
