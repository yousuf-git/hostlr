import express from 'express'
import { tokenChecker } from '../../middlewares/token.middleware.js'
import { requireRole } from '../../services/rbac.service.js'
import authRoutes from './auth.route.js'
import userRoutes from './user.route.js'
import hostelRoutes from './hostel.route.js'
import roomRoutes from './room.route.js'
import reservationRoutes from './reservation.route.js'
import dashboardRoutes from './dashboard.route.js'

const router = express.Router()

// Admin login is public
router.use('/auth', authRoutes)

// All other admin routes require valid JWT + admin role
router.use(tokenChecker)
router.use(requireRole('admin'))
router.use('/users', userRoutes)
router.use('/hostels', hostelRoutes)
router.use('/rooms', roomRoutes)
router.use('/reservations', reservationRoutes)
router.use('/dashboard', dashboardRoutes)

export default router
