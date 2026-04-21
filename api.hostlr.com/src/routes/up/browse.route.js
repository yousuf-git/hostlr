import express from 'express'
import { BrowseController } from '../../controllers/up/browse.controller.js'

const router = express.Router()

router.get('/hostels', BrowseController.listHostels)
router.get('/hostels/:id', BrowseController.getHostel)
router.get('/rooms/:roomId/seats', BrowseController.getRoomSeats)

export default router
