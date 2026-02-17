import { Hono } from 'hono'
import { login, getUserById } from '../services/auth'
import { authMiddleware } from '../middleware/auth'

const auth = new Hono()

// Login endpoint
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json()
    const { email, password } = body
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }
    
    const result = await login(email, password)
    
    return c.json(result)
  } catch (error: any) {
    console.error('Login error:', error)
    return c.json({ error: error.message || 'Login failed' }, 401)
  }
})

// Get current user info
auth.get('/me', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    
    if (!userId) {
      return c.json({ error: 'User ID not found in token' }, 401)
    }
    
    const user = await getUserById(userId)
    
    return c.json({ user })
  } catch (error: any) {
    console.error('Get user error:', error)
    return c.json({ error: error.message || 'Failed to get user info' }, 500)
  }
})

// Refresh token endpoint
auth.post('/refresh', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId')
    
    if (!userId) {
      return c.json({ error: 'User ID not found in token' }, 401)
    }
    
    // Get fresh user data and generate new token
    const result = await getUserById(userId)
    
    return c.json({ user: result })
  } catch (error: any) {
    console.error('Refresh token error:', error)
    return c.json({ error: error.message || 'Failed to refresh token' }, 500)
  }
})

// Logout endpoint (client-side only, just a placeholder)
auth.post('/logout', authMiddleware, async (c) => {
  return c.json({ message: 'Logged out successfully' })
})

export default auth
