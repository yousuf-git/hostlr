import express from 'express'
import { DashboardController } from '../../controllers/ap/dashboard.controller.js'

const router = express.Router()

router.get('/stats', DashboardController.stats)

export default router
