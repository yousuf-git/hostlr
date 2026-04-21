import request from 'supertest'
import { expect } from 'chai'
import { app } from '../src/app.js'
import { setupDb, teardownDb, clearDb, createUser } from './helpers.js'

describe('Auth', () => {
  before(setupDb)
  after(teardownDb)
  afterEach(clearDb)

  describe('POST /api/up/auth/register', () => {
    it('registers a finder successfully', async () => {
      const res = await request(app).post('/api/up/auth/register').send({
        name: 'Ali Hassan', email: 'ali@test.com', password: 'Pass@123', role: 'finder',
      })
      expect(res.status).to.equal(201)
      expect(res.body.isSuccess).to.be.true
      expect(res.body.token).to.be.a('string')
      expect(res.body.user).to.not.have.property('passwordHash')
    })

    it('registers an owner successfully', async () => {
      const res = await request(app).post('/api/up/auth/register').send({
        name: 'Hostel Owner', email: 'owner@test.com', password: 'Pass@123', role: 'owner',
      })
      expect(res.status).to.equal(201)
      expect(res.body.user.role).to.equal('owner')
    })

    it('rejects admin role registration', async () => {
      const res = await request(app).post('/api/up/auth/register').send({
        name: 'Admin', email: 'admin@test.com', password: 'Pass@123', role: 'admin',
      })
      expect(res.status).to.equal(400)
      expect(res.body.isSuccess).to.be.false
    })

    it('rejects duplicate email', async () => {
      await request(app).post('/api/up/auth/register').send({
        name: 'User', email: 'dup@test.com', password: 'Pass@123', role: 'finder',
      })
      const res = await request(app).post('/api/up/auth/register').send({
        name: 'User2', email: 'dup@test.com', password: 'Pass@123', role: 'finder',
      })
      expect(res.status).to.equal(409)
    })
  })

  describe('POST /api/up/auth/login', () => {
    beforeEach(async () => {
      await createUser({ email: 'login@test.com', role: 'finder' })
    })

    it('logs in with correct credentials', async () => {
      const res = await request(app).post('/api/up/auth/login').send({
        email: 'login@test.com', password: 'Pass@123',
      })
      expect(res.status).to.equal(200)
      expect(res.body.token).to.be.a('string')
    })

    it('rejects wrong password', async () => {
      const res = await request(app).post('/api/up/auth/login').send({
        email: 'login@test.com', password: 'wrongpass',
      })
      expect(res.status).to.equal(401)
    })

    it('rejects non-existent email', async () => {
      const res = await request(app).post('/api/up/auth/login').send({
        email: 'nobody@test.com', password: 'Pass@123',
      })
      expect(res.status).to.equal(401)
    })

    it('rejects deactivated account', async () => {
      await createUser({ email: 'inactive@test.com', role: 'finder', isActive: false })
      const res = await request(app).post('/api/up/auth/login').send({
        email: 'inactive@test.com', password: 'Pass@123',
      })
      expect(res.status).to.equal(403)
    })
  })

  describe('GET /api/up/auth/me', () => {
    it('returns profile for authenticated user', async () => {
      const reg = await request(app).post('/api/up/auth/register').send({
        name: 'Me User', email: 'me@test.com', password: 'Pass@123', role: 'finder',
      })
      const token = reg.body.token
      const res = await request(app).get('/api/up/auth/me').set('Authorization', `Bearer ${token}`)
      expect(res.status).to.equal(200)
      expect(res.body.user.email).to.equal('me@test.com')
    })

    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/up/auth/me')
      expect(res.status).to.equal(401)
    })
  })
})
