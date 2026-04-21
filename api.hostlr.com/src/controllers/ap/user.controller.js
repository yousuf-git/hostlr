import { StatusCodes } from 'http-status-codes'
import { asyncHandler } from '../../services/asynchandler.js'
import { generateApiResponse } from '../../services/utilities.service.js'
import { paginationFiltrationData } from '../../services/pagination.service.js'
import User from '../../models/user.model.js'

export const AdminUserController = {
  list: asyncHandler(async (req, res) => {
    const where = {}
    if (req.query.role) where.role = req.query.role
    const result = await paginationFiltrationData(User, req.query, 'users', ['name', 'email'], where)
    result.users = result.users.map(u => { const o = u.toObject(); delete o.passwordHash; return o })
    return generateApiResponse(res, StatusCodes.OK, true, 'Users fetched.', result)
  }),

  update: asyncHandler(async (req, res) => {
    const update = {}
    if (req.body.isActive !== undefined) update.isActive = req.body.isActive
    if (req.body.role && ['admin', 'owner', 'finder'].includes(req.body.role)) update.role = req.body.role
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-passwordHash')
    if (!user) return generateApiResponse(res, StatusCodes.NOT_FOUND, false, 'User not found.')
    return generateApiResponse(res, StatusCodes.OK, true, 'User updated.', { user })
  }),

  delete: asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return generateApiResponse(res, StatusCodes.NOT_FOUND, false, 'User not found.')
    return generateApiResponse(res, StatusCodes.OK, true, 'User deleted.')
  }),
}
