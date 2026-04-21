import express from 'express'
import { AdminUserController } from '../../controllers/ap/user.controller.js'

const router = express.Router()

router.get('/', AdminUserController.list)
router.patch('/:id', AdminUserController.update)
router.delete('/:id', AdminUserController.delete)

export default router
