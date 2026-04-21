import express from 'express'
import { ReservationController } from '../../controllers/up/reservation.controller.js'
import { requireRole } from '../../services/rbac.service.js'
import { validateApiAttributes, checkApiValidation } from '../../middlewares/validators.middleware.js'

const router = express.Router()

router.post('/', requireRole('finder'),
  validateApiAttributes(['seatId']), checkApiValidation,
  ReservationController.create)

router.get('/mine', requireRole('finder'), ReservationController.getMine)
router.get('/incoming', requireRole('owner'), ReservationController.getIncoming)
router.post('/:id/complete', requireRole('owner'), ReservationController.complete)
router.post('/:id/cancel', ReservationController.cancel)

export default router
