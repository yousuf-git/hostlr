import jwt from 'jsonwebtoken'
import { generateApiResponse } from '../services/utilities.service.js'
import { StatusCodes } from 'http-status-codes'

const PUBLIC_PATHS = [
  '/api/up/auth/register',
  '/api/up/auth/login',
  '/api/ap/auth/login',
  '/api/health',
]

const PUBLIC_PREFIXES = [
  '/api/up/browse/',
  '/uploads/',
  '/hostlr-api-docs',
]

export const tokenChecker = (req, res, next) => {
  const url = req.originalUrl.split('?')[0]
  if (PUBLIC_PATHS.includes(url)) return next()
  if (PUBLIC_PREFIXES.some(p => url.startsWith(p))) return next()

  const authHeader = req.get('Authorization')
  if (!authHeader) return generateApiResponse(res, StatusCodes.UNAUTHORIZED, false, 'No token provided.')
  const token = authHeader.split(' ')[1]
  if (!token) return generateApiResponse(res, StatusCodes.UNAUTHORIZED, false, 'Malformed token.')
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    req.user = decoded
    next()
  } catch {
    return generateApiResponse(res, StatusCodes.UNAUTHORIZED, false, 'Invalid or expired token.')
  }
}
