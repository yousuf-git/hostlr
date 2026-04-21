import { StatusCodes } from 'http-status-codes'
import { asyncHandler } from '../../services/asynchandler.js'
import { generateApiResponse } from '../../services/utilities.service.js'
import User from '../../models/user.model.js'
import Hostel from '../../models/hostel.model.js'
import Room from '../../models/room.model.js'
import Seat from '../../models/seat.model.js'
import Reservation from '../../models/reservation.model.js'
import Conversation from '../../models/conversation.model.js'

export const DashboardController = {
  stats: asyncHandler(async (req, res) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const [users, hostels, rooms, seats, reservations, conversations] = await Promise.all([
      User.countDocuments(),
      Hostel.countDocuments(),
      Room.countDocuments(),
      Seat.countDocuments(),
      Reservation.countDocuments(),
      Conversation.countDocuments(),
    ])

    const [rByStatus, topCities, newUsersLast30Days, reservationsLast30Days, revResult] = await Promise.all([
      Reservation.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Hostel.aggregate([
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 5 },
        { $project: { _id: 0, city: '$_id', count: 1 } },
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', count: 1 } },
      ]),
      Reservation.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', count: 1 } },
      ]),
      Seat.aggregate([
        { $match: { status: 'booked' } },
        { $lookup: { from: 'rooms', localField: 'roomId', foreignField: '_id', as: 'room' } },
        { $unwind: '$room' },
        { $group: { _id: null, total: { $sum: '$room.pricePerSeat' } } },
      ]),
    ])

    const reservationsByStatus = rByStatus.reduce((acc, r) => { acc[r._id] = r.count; return acc }, {})

    return generateApiResponse(res, StatusCodes.OK, true, 'Dashboard stats fetched.', {
      counts: { users, hostels, rooms, seats, reservations, conversations },
      reservationsByStatus,
      topCities,
      newUsersLast30Days,
      reservationsLast30Days,
      revenuePotential: revResult[0]?.total || 0,
    })
  }),
}
