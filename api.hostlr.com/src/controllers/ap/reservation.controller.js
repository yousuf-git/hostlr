import { StatusCodes } from 'http-status-codes'
import { asyncHandler } from '../../services/asynchandler.js'
import { generateApiResponse } from '../../services/utilities.service.js'
import { paginationFiltrationData } from '../../services/pagination.service.js'
import Reservation from '../../models/reservation.model.js'

export const AdminReservationController = {
  list: asyncHandler(async (req, res) => {
    const where = {}
    if (req.query.status) where.status = req.query.status
    const result = await paginationFiltrationData(
      Reservation, req.query, 'reservations', [], where,
      [
        { path: 'hostelId', select: 'name city' },
        { path: 'roomId', select: 'name' },
        { path: 'seatId', select: 'label' },
        { path: 'finderId', select: 'name email' },
        { path: 'ownerId', select: 'name email' },
      ]
    )
    return generateApiResponse(res, StatusCodes.OK, true, 'Reservations fetched.', result)
  }),
}
