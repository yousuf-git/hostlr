import request from 'supertest'
import { expect } from 'chai'
import { app } from '../src/app.js'
import { setupDb, teardownDb, clearDb, createUser, loginUser } from './helpers.js'
import Hostel from '../src/models/hostel.model.js'
import Seat from '../src/models/seat.model.js'

let ownerToken, ownerUser, hostelId

describe('Room & Seat (Owner)', () => {
  before(setupDb)
  after(teardownDb)

  beforeEach(async () => {
    await clearDb()
    ownerUser = await createUser({ email: 'owner@test.com', role: 'owner' })
    ownerToken = await loginUser('owner@test.com', 'Pass@123')
    const h = await Hostel.create({ ownerId: ownerUser._id, name: 'Test Hostel', city: 'Lahore', address: 'Addr', gender: 'male' })
    hostelId = h._id.toString()
  })

  describe('POST /api/up/hostels/:hostelId/rooms', () => {
    it('creates a room with auto-generated seats', async () => {
      const res = await request(app).post(`/api/up/hostels/${hostelId}/rooms`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Standard Room', totalSeats: 4, pricePerSeat: 8000 })
      expect(res.status).to.equal(201)
      expect(res.body.room.name).to.equal('Standard Room')
      const seats = await Seat.find({ roomId: res.body.room._id })
      expect(seats).to.have.lengthOf(4)
      expect(seats.every(s => s.status === 'available')).to.be.true
    })

    it('rejects if hostel not owned', async () => {
      await createUser({ email: 'other@test.com', role: 'owner' })
      const token2 = await loginUser('other@test.com', 'Pass@123')
      const res = await request(app).post(`/api/up/hostels/${hostelId}/rooms`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ name: 'Hack Room', totalSeats: 2, pricePerSeat: 5000 })
      expect(res.status).to.equal(404)
    })
  })

  describe('GET /api/up/hostels/:hostelId/rooms', () => {
    it('returns rooms with seat counts', async () => {
      await request(app).post(`/api/up/hostels/${hostelId}/rooms`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Room A', totalSeats: 3, pricePerSeat: 7000 })
      const res = await request(app).get(`/api/up/hostels/${hostelId}/rooms`)
        .set('Authorization', `Bearer ${ownerToken}`)
      expect(res.status).to.equal(200)
      expect(res.body.rooms).to.have.lengthOf(1)
      expect(res.body.rooms[0].availableSeats).to.equal(3)
    })
  })

  describe('PATCH /api/up/rooms/:id', () => {
    it('updates room price', async () => {
      const r = await request(app).post(`/api/up/hostels/${hostelId}/rooms`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Room B', totalSeats: 2, pricePerSeat: 6000 })
      const roomId = r.body.room._id
      const res = await request(app).patch(`/api/up/rooms/${roomId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ pricePerSeat: 9000 })
      expect(res.status).to.equal(200)
      expect(res.body.room.pricePerSeat).to.equal(9000)
    })
  })

  describe('DELETE /api/up/rooms/:id', () => {
    it('deletes room and all its seats', async () => {
      const r = await request(app).post(`/api/up/hostels/${hostelId}/rooms`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Room C', totalSeats: 3, pricePerSeat: 5000 })
      const roomId = r.body.room._id
      const res = await request(app).delete(`/api/up/rooms/${roomId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
      expect(res.status).to.equal(200)
      const seats = await Seat.find({ roomId })
      expect(seats).to.have.lengthOf(0)
    })
  })
})
