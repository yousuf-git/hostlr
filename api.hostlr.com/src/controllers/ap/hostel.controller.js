import { StatusCodes } from 'http-status-codes'
import { asyncHandler } from '../../services/asynchandler.js'
import { generateApiResponse } from '../../services/utilities.service.js'
import { paginationFiltrationData } from '../../services/pagination.service.js'
import Hostel from '../../models/hostel.model.js'
import Room from '../../models/room.model.js'
import Seat from '../../models/seat.model.js'

export const AdminHostelController = {
  list: asyncHandler(async (req, res) => {
    const result = await paginationFiltrationData(
      Hostel, req.query, 'hostels', ['name', 'city', 'address'], {},
      { path: 'ownerId', select: 'name email' }
    )
    return generateApiResponse(res, StatusCodes.OK, true, 'Hostels fetched.', result)
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const { status } = req.body
    if (!['active', 'inactive'].includes(status)) {
      return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, 'Invalid status value.')
    }
    const hostel = await Hostel.findByIdAndUpdate(req.params.id, { status }, { new: true })
    if (!hostel) return generateApiResponse(res, StatusCodes.NOT_FOUND, false, 'Hostel not found.')
    return generateApiResponse(res, StatusCodes.OK, true, 'Status updated.', { hostel })
  }),

  delete: asyncHandler(async (req, res) => {
    const hostel = await Hostel.findByIdAndDelete(req.params.id)
    if (!hostel) return generateApiResponse(res, StatusCodes.NOT_FOUND, false, 'Hostel not found.')
    const rooms = await Room.find({ hostelId: hostel._id }).select('_id')
    await Seat.deleteMany({ roomId: { $in: rooms.map(r => r._id) } })
    await Room.deleteMany({ hostelId: hostel._id })
    return generateApiResponse(res, StatusCodes.OK, true, 'Hostel deleted.')
  }),
}
