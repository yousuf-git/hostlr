import request from 'supertest'
import { expect } from 'chai'
import { app } from '../src/app.js'
import { setupDb, teardownDb, clearDb, createUser, loginUser } from './helpers.js'
import Hostel from '../src/models/hostel.model.js'

let ownerToken, owner2Token, finderToken, ownerUser

describe('Hostel (Owner)', () => {
  before(setupDb)
  after(teardownDb)

  beforeEach(async () => {
    await clearDb()
    ownerUser = await createUser({ email: 'owner@test.com', role: 'owner' })
    ownerToken = await loginUser('owner@test.com', 'Pass@123')

    await createUser({ email: 'owner2@test.com', role: 'owner' })
    owner2Token = await loginUser('owner2@test.com', 'Pass@123')

    await createUser({ email: 'finder@test.com', role: 'finder' })
    finderToken = await loginUser('finder@test.com', 'Pass@123')
  })

  describe('POST /api/up/hostels', () => {
    it('owner can create a hostel', async () => {
      const res = await request(app).post('/api/up/hostels')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'GreenView Hostel', city: 'Lahore', address: 'Gulberg III', gender: 'male' })
      expect(res.status).to.equal(201)
      expect(res.body.hostel.name).to.equal('GreenView Hostel')
      expect(res.body.hostel.ownerId.toString()).to.equal(ownerUser._id.toString())
    })

    it('finder cannot create a hostel', async () => {
      const res = await request(app).post('/api/up/hostels')
        .set('Authorization', `Bearer ${finderToken}`)
        .send({ name: 'Test', city: 'Lahore', address: 'Addr', gender: 'male' })
      expect(res.status).to.equal(403)
    })

    it('unauthenticated request is rejected', async () => {
      const res = await request(app).post('/api/up/hostels')
        .send({ name: 'Test', city: 'Lahore', address: 'Addr', gender: 'male' })
      expect(res.status).to.equal(401)
    })
  })

  describe('GET /api/up/hostels', () => {
    it('returns only owner\'s hostels', async () => {
      await Hostel.create({ ownerId: ownerUser._id, name: 'My Hostel', city: 'Lahore', address: 'A', gender: 'male' })
      const res = await request(app).get('/api/up/hostels/mine').set('Authorization', `Bearer ${ownerToken}`)
      expect(res.status).to.equal(200)
      expect(res.body.hostels).to.have.lengthOf(1)
    })
  })

  describe('PATCH /api/up/hostels/:id', () => {
    let hostelId

    beforeEach(async () => {
      const h = await Hostel.create({ ownerId: ownerUser._id, name: 'Edit Me', city: 'Lahore', address: 'A', gender: 'male' })
      hostelId = h._id.toString()
    })

    it('owner can update their hostel', async () => {
      const res = await request(app).patch(`/api/up/hostels/${hostelId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Updated Name' })
      expect(res.status).to.equal(200)
      expect(res.body.hostel.name).to.equal('Updated Name')
    })

    it('other owner cannot update hostel', async () => {
      const res = await request(app).patch(`/api/up/hostels/${hostelId}`)
        .set('Authorization', `Bearer ${owner2Token}`)
        .send({ name: 'Hijacked' })
      expect(res.status).to.equal(404)
    })
  })

  describe('DELETE /api/up/hostels/:id', () => {
    it('owner can delete their hostel', async () => {
      const h = await Hostel.create({ ownerId: ownerUser._id, name: 'Delete Me', city: 'Lahore', address: 'A', gender: 'male' })
      const res = await request(app).delete(`/api/up/hostels/${h._id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
      expect(res.status).to.equal(200)
      const gone = await Hostel.findById(h._id)
      expect(gone).to.be.null
    })
  })
})
