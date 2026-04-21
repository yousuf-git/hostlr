import { StatusCodes } from 'http-status-codes'
import { asyncHandler } from '../../services/asynchandler.js'
import { generateApiResponse } from '../../services/utilities.service.js'
import { compareEncryptedPassword } from '../../services/password.service.js'
import { tokenCreator } from '../../services/token.service.js'
import User from '../../models/user.model.js'

export const AdminAuthController = {
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email: email.toLowerCase(), role: 'admin' })
    if (!user) return generateApiResponse(res, StatusCodes.UNAUTHORIZED, false, 'Invalid admin credentials.')
    if (!user.isActive) return generateApiResponse(res, StatusCodes.FORBIDDEN, false, 'Account deactivated.')
    const match = await compareEncryptedPassword(password, user.passwordHash)
    if (!match) return generateApiResponse(res, StatusCodes.UNAUTHORIZED, false, 'Invalid admin credentials.')
    const token = tokenCreator({ _id: user._id, email: user.email, name: user.name, role: user.role })
    const userObj = user.toObject()
    delete userObj.passwordHash
    return generateApiResponse(res, StatusCodes.OK, true, 'Admin login successful.', { user: userObj, token })
  }),
}
