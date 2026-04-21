import express from 'express'
import { AuthController } from '../../controllers/up/auth.controller.js'
import { validateApiAttributes, checkApiValidation } from '../../middlewares/validators.middleware.js'
import { authLimiter } from '../../services/rateLimiter.service.js'

const router = express.Router()

const limiter = process.env.NODE_ENV === 'test' ? (req, res, next) => next() : authLimiter

router.post('/register', limiter,
  validateApiAttributes(['name', 'email', 'password', 'role'], 'body', ['name', 'email', 'password']),
  checkApiValidation, AuthController.register)

router.post('/login', limiter,
  validateApiAttributes(['email', 'password'], 'body', ['email']),
  checkApiValidation, AuthController.login)

router.get('/me', AuthController.me)

export default router
