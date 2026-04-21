import { StatusCodes } from 'http-status-codes'
import { asyncHandler } from '../../services/asynchandler.js'
import { generateApiResponse } from '../../services/utilities.service.js'
import Hostel from '../../models/hostel.model.js'
import Room from '../../models/room.model.js'
import Seat from '../../models/seat.model.js'

export const BrowseController = {
  listHostels: asyncHandler(async (req, res) => {
    const { city, gender, amenities, minPrice, maxPrice, q, page = 1, size = 12 } = req.query
    const filter = { status: 'active' }
    if (city) filter.city = city
    if (gender) filter.gender = gender
    if (amenities) {
      const list = Array.isArray(amenities) ? amenities : amenities.split(',')
      filter.amenities = { $all: list }
    }
    if (q) filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { city: { $regex: q, $options: 'i' } },
    ]

    if (minPrice || maxPrice) {
      const priceFilter = {}
      if (minPrice) priceFilter.$gte = Number(minPrice)
      if (maxPrice) priceFilter.$lte = Number(maxPrice)
      const hostelIds = await Room.distinct('hostelId', { pricePerSeat: priceFilter })
      filter._id = { $in: hostelIds }
    }

    const p = Math.max(parseInt(page), 1)
    const s = Math.max(parseInt(size), 1)
    const totalItems = await Hostel.countDocuments(filter)
    const hostels = await Hostel.find(filter)
      .populate('ownerId', 'name phone')
      .skip((p - 1) * s).limit(s).sort({ createdAt: -1 })

    const result = await Promise.all(hostels.map(async h => {
      const rooms = await Room.find({ hostelId: h._id })
      const prices = rooms.map(r => r.pricePerSeat)
      const availableSeats = await Seat.countDocuments({ hostelId: h._id, status: 'available' })
      return {
        ...h.toObject(), roomCount: rooms.length, availableSeats,
        minPrice: prices.length ? Math.min(...prices) : null,
        maxPrice: prices.length ? Math.max(...prices) : null,
      }
    }))

    return generateApiResponse(res, StatusCodes.OK, true, 'Hostels fetched.', {
      hostels: result,
      pagination: { page: p, size: s, totalItems, totalPages: Math.ceil(totalItems / s) },
    })
  }),

  getHostel: asyncHandler(async (req, res) => {
    const hostel = await Hostel.findOne({ _id: req.params.id, status: 'active' })
      .populate('ownerId', 'name phone avatarUrl')
    if (!hostel) return generateApiResponse(res, StatusCodes.NOT_FOUND, false, 'Hostel not found.')
    const rooms = await Room.find({ hostelId: hostel._id })
    const roomsWithSeats = await Promise.all(rooms.map(async room => {
      const seats = await Seat.find({ roomId: room._id }).sort('label')
      return { ...room.toObject(), seats, availableSeats: seats.filter(s => s.status === 'available').length }
    }))
    return generateApiResponse(res, StatusCodes.OK, true, 'Hostel fetched.', { hostel: hostel.toObject(), rooms: roomsWithSeats })
  }),

  getRoomSeats: asyncHandler(async (req, res) => {
    const seats = await Seat.find({ roomId: req.params.roomId }).sort('label')
    return generateApiResponse(res, StatusCodes.OK, true, 'Seats fetched.', { seats })
  }),
}
