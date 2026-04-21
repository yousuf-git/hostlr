import { StatusCodes } from 'http-status-codes'
import { asyncHandler } from '../../services/asynchandler.js'
import { generateApiResponse } from '../../services/utilities.service.js'
import Hostel from '../../models/hostel.model.js'
import Room from '../../models/room.model.js'
import Seat from '../../models/seat.model.js'
import Reservation from '../../models/reservation.model.js'

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

export const RoomController = {
  create: asyncHandler(async (req, res) => {
    const hostel = await Hostel.findOne({ _id: req.params.hostelId, ownerId: req.user._id })
    if (!hostel) return generateApiResponse(res, StatusCodes.NOT_FOUND, false, 'Hostel not found or access denied.')
    const { name, totalSeats, pricePerSeat, amenities, pricingUnit } = req.body
    const room = await Room.create({
      hostelId: hostel._id, name,
      totalSeats: Number(totalSeats), pricePerSeat: Number(pricePerSeat),
      pricingUnit: pricingUnit || 'monthly',
      amenities: amenities ? (Array.isArray(amenities) ? amenities : amenities.split(',').map(s => s.trim())) : [],
    })
    const seats = Array.from({ length: room.totalSeats }, (_, i) => ({
      roomId: room._id, hostelId: hostel._id,
      label: `Bed ${LABELS[i] || i + 1}`, status: 'available',
    }))
    await Seat.insertMany(seats)
    return generateApiResponse(res, StatusCodes.CREATED, true, 'Room created with seats.', { room })
  }),

  getOne: asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id)
    if (!room) return generateApiResponse(res, StatusCodes.NOT_FOUND, false, 'Room not found.')
    const hostel = await Hostel.findOne({ _id: room.hostelId, ownerId: req.user._id })
    if (!hostel) return generateApiResponse(res, StatusCodes.FORBIDDEN, false, 'Access denied.')

    const seats = await Seat.find({ roomId: room._id }).sort('label')
    const activeReservations = await Reservation.find({
      seatId: { $in: seats.map(s => s._id) },
      status: { $in: ['pending', 'completed'] },
    }).populate('finderId', 'name email phone avatarUrl')

    const reservationMap = Object.fromEntries(activeReservations.map(r => [r.seatId.toString(), r]))
    const seatsWithTenant = seats.map(s => ({
      ...s.toObject(),
      reservation: reservationMap[s._id.toString()] || null,
    }))

    return generateApiResponse(res, StatusCodes.OK, true, 'Room fetched.', {
      room: { ...room.toObject(), availableSeats: seats.filter(s => s.status === 'available').length },
      hostel: { _id: hostel._id, name: hostel.name },
      seats: seatsWithTenant,
    })
  }),

  getByHostel: asyncHandler(async (req, res) => {
    const hostel = await Hostel.findOne({ _id: req.params.hostelId, ownerId: req.user._id })
    if (!hostel) return generateApiResponse(res, StatusCodes.NOT_FOUND, false, 'Hostel not found or access denied.')
    const rooms = await Room.find({ hostelId: hostel._id })
    const result = await Promise.all(rooms.map(async r => {
      const [available, total] = await Promise.all([
        Seat.countDocuments({ roomId: r._id, status: 'available' }),
        Seat.countDocuments({ roomId: r._id }),
      ])
      return { ...r.toObject(), availableSeats: available, totalSeats: total }
    }))
    return generateApiResponse(res, StatusCodes.OK, true, 'Rooms fetched.', { rooms: result })
  }),

  update: asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id)
    if (!room) return generateApiResponse(res, StatusCodes.NOT_FOUND, false, 'Room not found.')
    const hostel = await Hostel.findOne({ _id: room.hostelId, ownerId: req.user._id })
    if (!hostel) return generateApiResponse(res, StatusCodes.FORBIDDEN, false, 'Access denied.')
    if (req.body.name) room.name = req.body.name
    if (req.body.pricePerSeat) room.pricePerSeat = Number(req.body.pricePerSeat)
    if (req.body.amenities) room.amenities = Array.isArray(req.body.amenities) ? req.body.amenities : req.body.amenities.split(',').map(s => s.trim())
    await room.save()
    return generateApiResponse(res, StatusCodes.OK, true, 'Room updated.', { room })
  }),

  delete: asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id)
    if (!room) return generateApiResponse(res, StatusCodes.NOT_FOUND, false, 'Room not found.')
    const hostel = await Hostel.findOne({ _id: room.hostelId, ownerId: req.user._id })
    if (!hostel) return generateApiResponse(res, StatusCodes.FORBIDDEN, false, 'Access denied.')
    await Seat.deleteMany({ roomId: room._id })
    await Room.findByIdAndDelete(room._id)
    return generateApiResponse(res, StatusCodes.OK, true, 'Room deleted.')
  }),

  getSeats: asyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id)
    if (!room) return generateApiResponse(res, StatusCodes.NOT_FOUND, false, 'Room not found.')
    const hostel = await Hostel.findOne({ _id: room.hostelId, ownerId: req.user._id })
    if (!hostel) return generateApiResponse(res, StatusCodes.FORBIDDEN, false, 'Access denied.')
    const seats = await Seat.find({ roomId: room._id }).sort('label')
    return generateApiResponse(res, StatusCodes.OK, true, 'Seats fetched.', { seats })
  }),
}
