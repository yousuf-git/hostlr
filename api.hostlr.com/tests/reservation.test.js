import request from 'supertest'
import { expect } from 'chai'
import { app } from '../src/app.js'
import { setupDb, teardownDb, clearDb, createUser, loginUser } from './helpers.js'
import Hostel from '../src/models/hostel.model.js'
import Room from '../src/models/room.model.js'
import Seat from '../src/models/seat.model.js'

let ownerUser, finderUser, finderToken, ownerToken
let hostelId, availableSeatId

async function setup() {
  await clearDb()
  ownerUser = await createUser({ email: 'owner@test.com', role: 'owner' })
  finderUser = await createUser({ email: 'finder@test.com', role: 'finder' })
  ownerToken = await loginUser('owner@test.com', 'Pass@123')
  finderToken = await loginUser('finder@test.com', 'Pass@123')

  const h = await Hostel.create({ ownerId: ownerUser._id, name: 'Test Hostel', city: 'Lahore', address: 'A', gender: 'male' })
  hostelId = h._id.toString()
  const room = await Room.create({ hostelId: h._id, name: 'Room 1', totalSeats: 3, pricePerSeat: 8000 })
  const seat = await Seat.create({ roomId: room._id, hostelId: h._id, label: 'Bed A', status: 'available' })
  availableSeatId = seat._id.toString()
}

describe('Reservation', () => {
  before(setupDb)
  after(teardownDb)
  beforeEach(setup)

  describe('POST /api/up/reservations', () => {
    it('finder can reserve an available seat', async () => {
      const res = await request(app).post('/api/up/reservations')
        .set('Authorization', `Bearer ${finderToken}`)
        .send({ seatId: availableSeatId })
      expect(res.status).to.equal(201)
      expect(res.body.reservation.status).to.equal('pending')
      const seat = await Seat.findById(availableSeatId)
      expect(seat.status).to.equal('reserved')
    })

    it('rejects double-reservation of same seat (atomic lock)', async () => {
      await request(app).post('/api/up/reservations')
        .set('Authorization', `Bearer ${finderToken}`)
        .send({ seatId: availableSeatId })
      const res = await request(app).post('/api/up/reservations')
        .set('Authorization', `Bearer ${finderToken}`)
        .send({ seatId: availableSeatId })
      expect(res.status).to.equal(409)
    })

    it('owner cannot create a reservation', async () => {
      const res = await request(app).post('/api/up/reservations')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ seatId: availableSeatId })
      expect(res.status).to.equal(403)
    })

    it('unauthenticated request is rejected', async () => {
      const res = await request(app).post('/api/up/reservations').send({ seatId: availableSeatId })
      expect(res.status).to.equal(401)
    })
  })

  describe('GET /api/up/reservations/mine', () => {
    it('returns finder\'s reservations', async () => {
      await request(app).post('/api/up/reservations')
        .set('Authorization', `Bearer ${finderToken}`)
        .send({ seatId: availableSeatId })
      const res = await request(app).get('/api/up/reservations/mine')
        .set('Authorization', `Bearer ${finderToken}`)
      expect(res.status).to.equal(200)
      expect(res.body.reservations).to.have.lengthOf(1)
    })
  })

  describe('GET /api/up/reservations/incoming', () => {
    it('returns reservations for owner\'s hostels', async () => {
      await request(app).post('/api/up/reservations')
        .set('Authorization', `Bearer ${finderToken}`)
        .send({ seatId: availableSeatId })
      const res = await request(app).get('/api/up/reservations/incoming')
        .set('Authorization', `Bearer ${ownerToken}`)
      expect(res.status).to.equal(200)
      expect(res.body.reservations).to.have.lengthOf(1)
    })
  })

  describe('PATCH /api/up/reservations/:id/complete', () => {
    it('owner can complete a pending reservation', async () => {
      const created = await request(app).post('/api/up/reservations')
        .set('Authorization', `Bearer ${finderToken}`)
        .send({ seatId: availableSeatId })
      const resId = created.body.reservation._id
      const res = await request(app).post(`/api/up/reservations/${resId}/complete`)
        .set('Authorization', `Bearer ${ownerToken}`)
      expect(res.status).to.equal(200)
      expect(res.body.reservation.status).to.equal('completed')
      const seat = await Seat.findById(availableSeatId)
      expect(seat.status).to.equal('booked')
    })

    it('finder cannot complete a reservation', async () => {
      const created = await request(app).post('/api/up/reservations')
        .set('Authorization', `Bearer ${finderToken}`)
        .send({ seatId: availableSeatId })
      const resId = created.body.reservation._id
      const res = await request(app).post(`/api/up/reservations/${resId}/complete`)
        .set('Authorization', `Bearer ${finderToken}`)
      expect(res.status).to.equal(403)
    })
  })

  describe('PATCH /api/up/reservations/:id/cancel', () => {
    it('finder can cancel their own reservation', async () => {
      const created = await request(app).post('/api/up/reservations')
        .set('Authorization', `Bearer ${finderToken}`)
        .send({ seatId: availableSeatId })
      const resId = created.body.reservation._id
      const res = await request(app).post(`/api/up/reservations/${resId}/cancel`)
        .set('Authorization', `Bearer ${finderToken}`)
        .send({ reason: 'Changed my mind' })
      expect(res.status).to.equal(200)
      expect(res.body.reservation.status).to.equal('cancelled')
      const seat = await Seat.findById(availableSeatId)
      expect(seat.status).to.equal('available')
    })

    it('owner can cancel an incoming reservation', async () => {
      const created = await request(app).post('/api/up/reservations')
        .set('Authorization', `Bearer ${finderToken}`)
        .send({ seatId: availableSeatId })
      const resId = created.body.reservation._id
      const res = await request(app).post(`/api/up/reservations/${resId}/cancel`)
        .set('Authorization', `Bearer ${ownerToken}`)
      expect(res.status).to.equal(200)
      expect(res.body.reservation.status).to.equal('cancelled')
    })

    it('cannot cancel a completed reservation', async () => {
      const created = await request(app).post('/api/up/reservations')
        .set('Authorization', `Bearer ${finderToken}`)
        .send({ seatId: availableSeatId })
      const resId = created.body.reservation._id
      await request(app).post(`/api/up/reservations/${resId}/complete`).set('Authorization', `Bearer ${ownerToken}`)
      const res = await request(app).post(`/api/up/reservations/${resId}/cancel`)
        .set('Authorization', `Bearer ${finderToken}`)
      expect(res.status).to.equal(400)
    })
  })
})
