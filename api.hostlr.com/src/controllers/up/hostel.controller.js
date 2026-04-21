import { StatusCodes } from 'http-status-codes'
import { asyncHandler } from '../../services/asynchandler.js'
import { generateApiResponse } from '../../services/utilities.service.js'
import { paginationFiltrationData } from '../../services/pagination.service.js'
import Hostel from '../../models/hostel.model.js'
import Room from '../../models/room.model.js'
import Seat from '../../models/seat.model.js'

export const HostelController = {
  create: asyncHandler(async (req, res) => {
    const { name, city, address, gender, description, amenities, lat, lng } = req.body
    const hostel = await Hostel.create({
      ownerId: req.user._id, name, city, address, gender,
      description: description || '',
      amenities: amenities ? (Array.isArray(amenities) ? amenities : amenities.split(',').map(s => s.trim())) : [],
      lat: lat || null, lng: lng || null,
    })
    return generateApiResponse(res, StatusCodes.CREATED, true, 'Hostel created.', { hostel })
  }),

  getOne: asyncHandler(async (req, res) => {
    const hostel = await Hostel.findOne({ _id: req.params.id, ownerId: req.user._id })
    if (!hostel) return generateApiResponse(res, StatusCodes.NOT_FOUND, false, 'Hostel not found or access denied.')
    return generateApiResponse(res, StatusCodes.OK, true, 'Hostel fetched.', { hostel })
  }),

  getMine: asyncHandler(async (req, res) => {
    const result = await paginationFiltrationData(
      Hostel, req.query, 'hostels', ['name', 'city', 'address'],
      { ownerId: req.user._id }
    )

    if (result.hostels?.length) {
      const hostelIds = result.hostels.map(h => h._id)
      const [roomCounts, seatCounts] = await Promise.all([
        Room.aggregate([
          { $match: { hostelId: { $in: hostelIds } } },
          { $group: { _id: '$hostelId', count: { $sum: 1 } } },
        ]),
        Seat.aggregate([
          { $match: { hostelId: { $in: hostelIds }, status: 'available' } },
          { $group: { _id: '$hostelId', count: { $sum: 1 } } },
        ]),
      ])
      const roomMap = Object.fromEntries(roomCounts.map(r => [r._id.toString(), r.count]))
      const seatMap = Object.fromEntries(seatCounts.map(s => [s._id.toString(), s.count]))
      result.hostels = result.hostels.map(h => ({
        ...h.toObject(),
        roomCount: roomMap[h._id.toString()] || 0,
        availableSeats: seatMap[h._id.toString()] || 0,
      }))
    }

    return generateApiResponse(res, StatusCodes.OK, true, 'Hostels fetched.', result)
  }),

  update: asyncHandler(async (req, res) => {
    const hostel = await Hostel.findOne({ _id: req.params.id, ownerId: req.user._id })
    if (!hostel) return generateApiResponse(res, StatusCodes.NOT_FOUND, false, 'Hostel not found or access denied.')
    const allowed = ['name', 'city', 'address', 'gender', 'description', 'status', 'lat', 'lng']
    allowed.forEach(key => { if (req.body[key] !== undefined) hostel[key] = req.body[key] })
    if (req.body.amenities) {
      hostel.amenities = Array.isArray(req.body.amenities) ? req.body.amenities : req.body.amenities.split(',').map(s => s.trim())
    }
    await hostel.save()
    return generateApiResponse(res, StatusCodes.OK, true, 'Hostel updated.', { hostel })
  }),

  delete: asyncHandler(async (req, res) => {
    const hostel = await Hostel.findOne({ _id: req.params.id, ownerId: req.user._id })
    if (!hostel) return generateApiResponse(res, StatusCodes.NOT_FOUND, false, 'Hostel not found or access denied.')
    const rooms = await Room.find({ hostelId: hostel._id }).select('_id')
    await Seat.deleteMany({ roomId: { $in: rooms.map(r => r._id) } })
    await Room.deleteMany({ hostelId: hostel._id })
    await Hostel.findByIdAndDelete(hostel._id)
    return generateApiResponse(res, StatusCodes.OK, true, 'Hostel deleted.')
  }),

  addImages: asyncHandler(async (req, res) => {
    const hostel = await Hostel.findOne({ _id: req.params.id, ownerId: req.user._id })
    if (!hostel) return generateApiResponse(res, StatusCodes.NOT_FOUND, false, 'Hostel not found.')
    if (!req.files?.length) return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, 'No files uploaded.')
    hostel.images = [...hostel.images, ...req.files.map(f => `/uploads/${f.filename}`)]
    await hostel.save()
    return generateApiResponse(res, StatusCodes.OK, true, 'Images uploaded.', { hostel })
  }),
}
