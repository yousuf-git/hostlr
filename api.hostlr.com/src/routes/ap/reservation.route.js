import express from 'express'
import { AdminReservationController } from '../../controllers/ap/reservation.controller.js'

const router = express.Router()

router.get('/', AdminReservationController.list)

export default router
