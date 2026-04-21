import express from 'express'
import { AdminAuthController } from '../../controllers/ap/auth.controller.js'
import { validateApiAttributes, checkApiValidation } from '../../middlewares/validators.middleware.js'
import { authLimiter } from '../../services/rateLimiter.service.js'

const router = express.Router()

const limiter = process.env.NODE_ENV === 'test' ? (req, res, next) => next() : authLimiter

router.post('/login', limiter,
  validateApiAttributes(['email', 'password'], 'body', ['email']),
  checkApiValidation, AdminAuthController.login)

export default router
