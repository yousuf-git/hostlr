import { StatusCodes } from 'http-status-codes'
import { asyncHandler } from '../../services/asynchandler.js'
import { generateApiResponse } from '../../services/utilities.service.js'
import Reservation from '../../models/reservation.model.js'
import Seat from '../../models/seat.model.js'
import Room from '../../models/room.model.js'
import Hostel from '../../models/hostel.model.js'

export const ReservationController = {
  create: asyncHandler(async (req, res) => {
    const { seatId } = req.body
    // Atomic lock: only succeeds if seat is available
    const seat = await Seat.findOneAndUpdate(
      { _id: seatId, status: 'available' },
      { $set: { status: 'reserved' } },
      { new: true }
    )
    if (!seat) return generateApiResponse(res, StatusCodes.CONFLICT, false, 'Seat is not available.')

    const hostel = await Hostel.findById(seat.hostelId)
    const ttlHours = parseInt(process.env.RESERVATION_TTL_HOURS) || 48
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000)

    let reservation
    try {
      reservation = await Reservation.create({
        seatId: seat._id, roomId: seat.roomId, hostelId: seat.hostelId,
        finderId: req.user._id, ownerId: hostel.ownerId, expiresAt,
      })
    } catch (err) {
      await Seat.findByIdAndUpdate(seatId, { status: 'available', reservationId: null })
      throw err
    }

    await Seat.findByIdAndUpdate(seatId, { reservationId: reservation._id })

    const io = req.app.locals.io
    if (io) {
      const room = await Room.findById(seat.roomId)
      io.to(`user:${hostel.ownerId}`).emit('reservation:update', {
        action: 'created', reservation,
        hostelName: hostel.name, roomName: room?.name, seatLabel: seat.label,
      })
    }
    return generateApiResponse(res, StatusCodes.CREATED, true, 'Seat reserved successfully.', { reservation, expiresAt })
  }),

  getMine: asyncHandler(async (req, res) => {
    const { status, page = 1, size = 10 } = req.query
    const filter = { finderId: req.user._id }
    if (status) filter.status = status
    const p = Math.max(parseInt(page), 1), s = Math.max(parseInt(size), 1)
    const totalItems = await Reservation.countDocuments(filter)
    const reservations = await Reservation.find(filter)
      .populate('hostelId', 'name city images')
      .populate('roomId', 'name pricePerSeat')
      .populate('seatId', 'label status')
      .populate('ownerId', 'name phone')
      .sort({ createdAt: -1 }).skip((p - 1) * s).limit(s)
    return generateApiResponse(res, StatusCodes.OK, true, 'Reservations fetched.', {
      reservations,
      pagination: { page: p, size: s, totalItems, totalPages: Math.ceil(totalItems / s) },
    })
  }),

  getIncoming: asyncHandler(async (req, res) => {
    const { status, page = 1, size = 10 } = req.query
    const hostels = await Hostel.find({ ownerId: req.user._id }).select('_id')
    const filter = { hostelId: { $in: hostels.map(h => h._id) } }
    if (status) filter.status = status
    const p = Math.max(parseInt(page), 1), s = Math.max(parseInt(size), 1)
    const totalItems = await Reservation.countDocuments(filter)
    const reservations = await Reservation.find(filter)
      .populate('hostelId', 'name city')
      .populate('roomId', 'name')
      .populate('seatId', 'label')
      .populate('finderId', 'name email phone')
      .sort({ createdAt: -1 }).skip((p - 1) * s).limit(s)
    return generateApiResponse(res, StatusCodes.OK, true, 'Incoming reservations fetched.', {
      reservations,
      pagination: { page: p, size: s, totalItems, totalPages: Math.ceil(totalItems / s) },
    })
  }),

  complete: asyncHandler(async (req, res) => {
    const reservation = await Reservation.findById(req.params.id).populate('hostelId', 'ownerId name')
    if (!reservation) return generateApiResponse(res, StatusCodes.NOT_FOUND, false, 'Reservation not found.')
    if (reservation.hostelId.ownerId.toString() !== req.user._id.toString()) {
      return generateApiResponse(res, StatusCodes.FORBIDDEN, false, 'Access denied.')
    }
    if (reservation.status !== 'pending') {
      return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, 'Only pending reservations can be completed.')
    }
    reservation.status = 'completed'
    reservation.completedAt = new Date()
    await reservation.save()
    await Seat.findByIdAndUpdate(reservation.seatId, { status: 'booked' })
    const io = req.app.locals.io
    if (io) io.to(`user:${reservation.finderId}`).emit('reservation:update', { action: 'completed', reservationId: reservation._id })
    return generateApiResponse(res, StatusCodes.OK, true, 'Reservation completed.', { reservation })
  }),

  cancel: asyncHandler(async (req, res) => {
    const reservation = await Reservation.findById(req.params.id).populate('hostelId', 'ownerId')
    if (!reservation) return generateApiResponse(res, StatusCodes.NOT_FOUND, false, 'Reservation not found.')
    const isOwner = reservation.hostelId.ownerId.toString() === req.user._id.toString()
    const isFinder = reservation.finderId.toString() === req.user._id.toString()
    if (!isOwner && !isFinder) return generateApiResponse(res, StatusCodes.FORBIDDEN, false, 'Access denied.')
    if (reservation.status !== 'pending') {
      return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, 'Only pending reservations can be cancelled.')
    }
    reservation.status = 'cancelled'
    reservation.cancelReason = req.body.reason || null
    await reservation.save()
    await Seat.findByIdAndUpdate(reservation.seatId, { status: 'available', reservationId: null })
    const io = req.app.locals.io
    if (io) {
      const notifyId = isOwner ? reservation.finderId : reservation.hostelId.ownerId
      io.to(`user:${notifyId}`).emit('reservation:update', { action: 'cancelled', reservationId: reservation._id })
    }
    return generateApiResponse(res, StatusCodes.OK, true, 'Reservation cancelled.', { reservation })
  }),
}
