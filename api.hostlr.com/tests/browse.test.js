import request from 'supertest'
import { expect } from 'chai'
import { app } from '../src/app.js'
import { setupDb, teardownDb, clearDb, createUser } from './helpers.js'
import Hostel from '../src/models/hostel.model.js'
import Room from '../src/models/room.model.js'
import Seat from '../src/models/seat.model.js'

let ownerUser, hostelId, roomId

describe('Browse (Public)', () => {
  before(setupDb)
  after(teardownDb)

  before(async () => {
    await clearDb()
    ownerUser = await createUser({ email: 'owner@test.com', role: 'owner' })
    const h = await Hostel.create({
      ownerId: ownerUser._id, name: 'Sunrise Hostel', city: 'Lahore', address: 'Gulberg',
      gender: 'male', status: 'active', amenities: ['wifi', 'ac'],
    })
    hostelId = h._id.toString()
    const room = await Room.create({ hostelId: h._id, name: 'Standard', totalSeats: 4, pricePerSeat: 8000 })
    roomId = room._id.toString()
    await Seat.insertMany([
      { roomId: room._id, hostelId: h._id, label: 'Bed A', status: 'available' },
      { roomId: room._id, hostelId: h._id, label: 'Bed B', status: 'available' },
      { roomId: room._id, hostelId: h._id, label: 'Bed C', status: 'reserved' },
    ])

    await Hostel.create({
      ownerId: ownerUser._id, name: 'Hidden Hostel', city: 'Karachi', address: 'DHA',
      gender: 'female', status: 'inactive',
    })
  })

  describe('GET /api/up/browse/hostels', () => {
    it('returns active hostels without auth', async () => {
      const res = await request(app).get('/api/up/browse/hostels')
      expect(res.status).to.equal(200)
      expect(res.body.hostels.length).to.be.at.least(1)
      res.body.hostels.forEach(h => expect(h.status).to.equal('active'))
    })

    it('filters by city', async () => {
      const res = await request(app).get('/api/up/browse/hostels?city=Lahore')
      expect(res.status).to.equal(200)
      expect(res.body.hostels.every(h => h.city === 'Lahore')).to.be.true
    })

    it('filters by gender', async () => {
      const res = await request(app).get('/api/up/browse/hostels?gender=male')
      expect(res.status).to.equal(200)
      expect(res.body.hostels.every(h => h.gender === 'male')).to.be.true
    })

    it('filters by amenity', async () => {
      const res = await request(app).get('/api/up/browse/hostels?amenities=wifi')
      expect(res.status).to.equal(200)
      res.body.hostels.forEach(h => expect(h.amenities).to.include('wifi'))
    })

    it('includes availableSeats count', async () => {
      const res = await request(app).get('/api/up/browse/hostels')
      expect(res.status).to.equal(200)
      const h = res.body.hostels.find(h => h.name === 'Sunrise Hostel')
      expect(h).to.exist
      expect(h.availableSeats).to.equal(2)
    })

    it('includes pagination metadata', async () => {
      const res = await request(app).get('/api/up/browse/hostels')
      expect(res.body.pagination).to.include.keys('page', 'totalPages', 'totalItems')
    })
  })

  describe('GET /api/up/browse/hostels/:id', () => {
    it('returns hostel with rooms and seats', async () => {
      const res = await request(app).get(`/api/up/browse/hostels/${hostelId}`)
      expect(res.status).to.equal(200)
      expect(res.body.hostel.name).to.equal('Sunrise Hostel')
      expect(res.body.rooms).to.be.an('array')
      expect(res.body.rooms[0].seats).to.be.an('array')
    })

    it('returns 404 for inactive hostel', async () => {
      const inactive = await Hostel.findOne({ status: 'inactive' })
      const res = await request(app).get(`/api/up/browse/hostels/${inactive._id}`)
      expect(res.status).to.equal(404)
    })

    it('returns 404 for non-existent id', async () => {
      const res = await request(app).get('/api/up/browse/hostels/000000000000000000000000')
      expect(res.status).to.equal(404)
    })
  })

  describe('GET /api/up/browse/rooms/:roomId/seats', () => {
    it('returns seats for a room', async () => {
      const res = await request(app).get(`/api/up/browse/rooms/${roomId}/seats`)
      expect(res.status).to.equal(200)
      expect(res.body.seats).to.be.an('array').with.lengthOf(3)
    })
  })
})
