import express from 'express'
import { HostelController } from '../../controllers/up/hostel.controller.js'
import { requireRole } from '../../services/rbac.service.js'
import { upload } from '../../services/file.service.js'
import { validateApiAttributes, checkApiValidation } from '../../middlewares/validators.middleware.js'

const router = express.Router()

router.post('/', requireRole('owner'),
  validateApiAttributes(['name', 'city', 'address', 'gender']), checkApiValidation,
  HostelController.create)

router.get('/mine', requireRole('owner'), HostelController.getMine)
router.get('/:id', requireRole('owner'), HostelController.getOne)
router.patch('/:id', requireRole('owner'), HostelController.update)
router.delete('/:id', requireRole('owner'), HostelController.delete)
router.post('/:id/images', requireRole('owner'), upload.array('images', 10), HostelController.addImages)

export default router
