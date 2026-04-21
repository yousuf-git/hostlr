import request from 'supertest'
import { expect } from 'chai'
import { app } from '../src/app.js'
import { setupDb, teardownDb, clearDb, createUser } from './helpers.js'
import Hostel from '../src/models/hostel.model.js'
import Reservation from '../src/models/reservation.model.js'
import Room from '../src/models/room.model.js'
import Seat from '../src/models/seat.model.js'

let adminToken, ownerUser, finderUser

async function setup() {
  await clearDb()
  await createUser({ email: 'admin@test.com', role: 'admin', name: 'Admin' })
  ownerUser = await createUser({ email: 'owner@test.com', role: 'owner', name: 'Owner' })
  finderUser = await createUser({ email: 'finder@test.com', role: 'finder', name: 'Finder' })

  const r = await request(app).post('/api/ap/auth/login').send({ email: 'admin@test.com', password: 'Pass@123' })
  adminToken = r.body.token
}

describe('Admin Panel', () => {
  before(setupDb)
  after(teardownDb)
  beforeEach(setup)

  describe('POST /api/ap/auth/login', () => {
    it('admin can log in', async () => {
      const res = await request(app).post('/api/ap/auth/login').send({ email: 'admin@test.com', password: 'Pass@123' })
      expect(res.status).to.equal(200)
      expect(res.body.user.role).to.equal('admin')
      expect(res.body.token).to.be.a('string')
    })

    it('rejects non-admin credentials via admin login', async () => {
      const res = await request(app).post('/api/ap/auth/login').send({ email: 'owner@test.com', password: 'Pass@123' })
      expect(res.status).to.equal(401)
    })
  })

  describe('Users', () => {
    it('GET /api/ap/users returns paginated users', async () => {
      const res = await request(app).get('/api/ap/users')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).to.equal(200)
      expect(res.body.users).to.be.an('array')
      expect(res.body.pagination).to.include.keys('totalItems')
    })

    it('GET /api/ap/users filters by role', async () => {
      const res = await request(app).get('/api/ap/users?role=owner')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).to.equal(200)
      expect(res.body.users.every(u => u.role === 'owner')).to.be.true
    })

    it('PATCH /api/ap/users/:id can deactivate a user', async () => {
      const res = await request(app).patch(`/api/ap/users/${finderUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false })
      expect(res.status).to.equal(200)
      expect(res.body.user.isActive).to.be.false
    })

    it('DELETE /api/ap/users/:id deletes user', async () => {
      const res = await request(app).delete(`/api/ap/users/${finderUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).to.equal(200)
      const r = await request(app).delete(`/api/ap/users/${finderUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(r.status).to.equal(404)
    })

    it('non-admin cannot access admin users endpoint', async () => {
      const r = await request(app).post('/api/up/auth/login').send({ email: 'owner@test.com', password: 'Pass@123' })
      const ownerToken = r.body.token
      const res = await request(app).get('/api/ap/users').set('Authorization', `Bearer ${ownerToken}`)
      expect(res.status).to.equal(403)
    })
  })

  describe('Hostels', () => {
    let hostelId

    beforeEach(async () => {
      const h = await Hostel.create({ ownerId: ownerUser._id, name: 'Admin Test Hostel', city: 'Lahore', address: 'A', gender: 'male' })
      hostelId = h._id.toString()
    })

    it('GET /api/ap/hostels returns all hostels', async () => {
      const res = await request(app).get('/api/ap/hostels').set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).to.equal(200)
      expect(res.body.hostels).to.have.lengthOf(1)
    })

    it('PATCH /api/ap/hostels/:id/status can deactivate a hostel', async () => {
      const res = await request(app).patch(`/api/ap/hostels/${hostelId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'inactive' })
      expect(res.status).to.equal(200)
      expect(res.body.hostel.status).to.equal('inactive')
    })

    it('DELETE /api/ap/hostels/:id deletes hostel', async () => {
      const res = await request(app).delete(`/api/ap/hostels/${hostelId}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).to.equal(200)
    })
  })

  describe('Reservations', () => {
    it('GET /api/ap/reservations returns all reservations', async () => {
      const hostel = await Hostel.create({ ownerId: ownerUser._id, name: 'H', city: 'Lahore', address: 'A', gender: 'male' })
      const room = await Room.create({ hostelId: hostel._id, name: 'R', totalSeats: 1, pricePerSeat: 5000 })
      const seat = await Seat.create({ roomId: room._id, hostelId: hostel._id, label: 'Bed A', status: 'reserved' })
      await Reservation.create({
        seatId: seat._id, roomId: room._id, hostelId: hostel._id,
        finderId: finderUser._id, ownerId: ownerUser._id,
        status: 'pending', expiresAt: new Date(Date.now() + 48 * 3600 * 1000),
      })
      const res = await request(app).get('/api/ap/reservations').set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).to.equal(200)
      expect(res.body.reservations).to.have.lengthOf(1)
    })
  })

  describe('Dashboard', () => {
    it('GET /api/ap/dashboard/stats returns stats', async () => {
      const res = await request(app).get('/api/ap/dashboard/stats').set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).to.equal(200)
      expect(res.body).to.include.keys('counts', 'reservationsByStatus', 'topCities')
      expect(res.body.counts).to.include.keys('users', 'hostels', 'rooms', 'seats', 'reservations', 'conversations')
    })
  })
})
