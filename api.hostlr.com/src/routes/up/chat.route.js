import express from 'express'
import { ChatController } from '../../controllers/up/chat.controller.js'
import { requireRole } from '../../services/rbac.service.js'
import { validateApiAttributes, checkApiValidation } from '../../middlewares/validators.middleware.js'

const router = express.Router()

router.post('/conversations', requireRole('finder'),
  validateApiAttributes(['hostelId']), checkApiValidation,
  ChatController.createConversation)

router.get('/conversations', ChatController.getConversations)
router.get('/conversations/:id/messages', ChatController.getMessages)

router.post('/conversations/:id/messages',
  validateApiAttributes(['text']), checkApiValidation,
  ChatController.sendMessage)

export default router
