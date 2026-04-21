import express from 'express'
import { AdminRoomController } from '../../controllers/ap/room.controller.js'

const router = express.Router()

router.get('/', AdminRoomController.list)
router.get('/:id/seats', AdminRoomController.getSeats)

export default router
