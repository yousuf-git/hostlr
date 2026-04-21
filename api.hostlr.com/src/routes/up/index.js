import express from 'express'
import { tokenChecker } from '../../middlewares/token.middleware.js'
import authRoutes from './auth.route.js'
import hostelRoutes from './hostel.route.js'
import browseRoutes from './browse.route.js'
import reservationRoutes from './reservation.route.js'
import chatRoutes from './chat.route.js'
import { RoomController } from '../../controllers/up/room.controller.js'
import { requireRole } from '../../services/rbac.service.js'
import { validateApiAttributes, checkApiValidation } from '../../middlewares/validators.middleware.js'

const router = express.Router()

router.use(tokenChecker)

router.use('/auth', authRoutes)
router.use('/hostels', hostelRoutes)
router.use('/browse', browseRoutes)
router.use('/reservations', reservationRoutes)
router.use('/chat', chatRoutes)

// Room routes — nested under /hostels/:hostelId and standalone /rooms/:id
router.get('/rooms/:id', requireRole('owner'), RoomController.getOne)
router.post('/hostels/:hostelId/rooms', requireRole('owner'),
  validateApiAttributes(['name', 'totalSeats', 'pricePerSeat']), checkApiValidation,
  RoomController.create)
router.get('/hostels/:hostelId/rooms', requireRole('owner'), RoomController.getByHostel)
router.patch('/rooms/:id', requireRole('owner'), RoomController.update)
router.delete('/rooms/:id', requireRole('owner'), RoomController.delete)
router.get('/rooms/:id/seats', requireRole('owner'), RoomController.getSeats)

export default router
