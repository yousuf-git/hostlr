import { StatusCodes } from 'http-status-codes'
import { asyncHandler } from '../../services/asynchandler.js'
import { generateApiResponse } from '../../services/utilities.service.js'
import { encryptPassword, compareEncryptedPassword } from '../../services/password.service.js'
import { tokenCreator } from '../../services/token.service.js'
import User from '../../models/user.model.js'

export const AuthController = {
  register: asyncHandler(async (req, res) => {
    const { name, email, password, role, phone } = req.body
    if (!['owner', 'finder'].includes(role)) {
      return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, 'Role must be owner or finder.')
    }
    const exists = await User.findOne({ email: email.toLowerCase() })
    if (exists) return generateApiResponse(res, StatusCodes.CONFLICT, false, 'Email already registered.')
    const passwordHash = await encryptPassword(password)
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash, role, phone: phone || null })
    const token = tokenCreator({ _id: user._id, email: user.email, name: user.name, role: user.role })
    const userObj = user.toObject()
    delete userObj.passwordHash
    return generateApiResponse(res, StatusCodes.CREATED, true, 'Registration successful.', { user: userObj, token })
  }),

  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return generateApiResponse(res, StatusCodes.UNAUTHORIZED, false, 'Invalid credentials.')
    if (!user.isActive) return generateApiResponse(res, StatusCodes.FORBIDDEN, false, 'Account deactivated.')
    const match = await compareEncryptedPassword(password, user.passwordHash)
    if (!match) return generateApiResponse(res, StatusCodes.UNAUTHORIZED, false, 'Invalid credentials.')
    const token = tokenCreator({ _id: user._id, email: user.email, name: user.name, role: user.role })
    const userObj = user.toObject()
    delete userObj.passwordHash
    return generateApiResponse(res, StatusCodes.OK, true, 'Login successful.', { user: userObj, token })
  }),

  me: asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-passwordHash')
    if (!user) return generateApiResponse(res, StatusCodes.NOT_FOUND, false, 'User not found.')
    return generateApiResponse(res, StatusCodes.OK, true, 'Profile fetched.', { user })
  }),
}
