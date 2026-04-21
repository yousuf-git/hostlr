import { StatusCodes } from 'http-status-codes'
import { asyncHandler } from '../../services/asynchandler.js'
import { generateApiResponse } from '../../services/utilities.service.js'
import { paginationFiltrationData } from '../../services/pagination.service.js'
import Room from '../../models/room.model.js'
import Seat from '../../models/seat.model.js'

export const AdminRoomController = {
  list: asyncHandler(async (req, res) => {
    const result = await paginationFiltrationData(
      Room, req.query, 'rooms', ['name'], {},
      { path: 'hostelId', select: 'name city' }
    )
    return generateApiResponse(res, StatusCodes.OK, true, 'Rooms fetched.', result)
  }),

  getSeats: asyncHandler(async (req, res) => {
    const seats = await Seat.find({ roomId: req.params.id }).sort('label')
    return generateApiResponse(res, StatusCodes.OK, true, 'Seats fetched.', { seats })
  }),
}
