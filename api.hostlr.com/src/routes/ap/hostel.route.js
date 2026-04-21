import express from 'express'
import { AdminHostelController } from '../../controllers/ap/hostel.controller.js'

const router = express.Router()

router.get('/', AdminHostelController.list)
router.patch('/:id/status', AdminHostelController.updateStatus)
router.delete('/:id', AdminHostelController.delete)

export default router
