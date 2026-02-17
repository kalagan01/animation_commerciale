import { sign, verify } from 'hono/jwt'

export interface JWTPayload {
  sub: string // user_id
  tenant_id: string
  role: string
  email: string
  iat?: number
  exp?: number
}

/**
 * Generate Access Token (short-lived, 1h default)
 */
export async function generateAccessToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  secret: string,
  expiresIn: number = 3600 // 1 hour
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  
  return await sign(
    {
      ...payload,
      iat: now,
      exp: now + expiresIn
    },
    secret
  )
}

/**
 * Generate Refresh Token (long-lived, 30 days)
 */
export async function generateRefreshToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  secret: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const THIRTY_DAYS = 30 * 24 * 60 * 60
  
  return await sign(
    {
      ...payload,
      iat: now,
      exp: now + THIRTY_DAYS
    },
    secret
  )
}

/**
 * Verify JWT Token
 */
export async function verifyToken(
  token: string,
  secret: string
): Promise<JWTPayload> {
  try {
    const payload = await verify(token, secret)
    return payload as JWTPayload
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}
