import request from 'supertest'
import { expect } from 'chai'
import { app } from '../src/app.js'
import { setupDb, teardownDb, clearDb, createUser, loginUser } from './helpers.js'
import Hostel from '../src/models/hostel.model.js'

let ownerUser, finderUser, finder2User
let ownerToken, finderToken, finder2Token
let hostelId, convId

async function setup() {
  await clearDb()
  ownerUser = await createUser({ email: 'owner@test.com', role: 'owner' })
  finderUser = await createUser({ email: 'finder@test.com', role: 'finder' })
  finder2User = await createUser({ email: 'finder2@test.com', role: 'finder' })

  ownerToken = await loginUser('owner@test.com', 'Pass@123')
  finderToken = await loginUser('finder@test.com', 'Pass@123')
  finder2Token = await loginUser('finder2@test.com', 'Pass@123')

  const h = await Hostel.create({ ownerId: ownerUser._id, name: 'Chat Hostel', city: 'Lahore', address: 'A', gender: 'male', status: 'active' })
  hostelId = h._id.toString()
}

describe('Chat', () => {
  before(setupDb)
  after(teardownDb)
  beforeEach(setup)

  describe('POST /api/up/chat/conversations', () => {
    it('finder can start a conversation with hostel owner', async () => {
      const res = await request(app).post('/api/up/chat/conversations')
        .set('Authorization', `Bearer ${finderToken}`)
        .send({ hostelId })
      expect(res.status).to.equal(200)
      expect(res.body.conversation).to.exist
    })

    it('is idempotent — same conversation returned on repeat calls', async () => {
      const r1 = await request(app).post('/api/up/chat/conversations')
        .set('Authorization', `Bearer ${finderToken}`).send({ hostelId })
      const r2 = await request(app).post('/api/up/chat/conversations')
        .set('Authorization', `Bearer ${finderToken}`).send({ hostelId })
      expect(r1.body.conversation._id).to.equal(r2.body.conversation._id)
    })

    it('owner cannot start a conversation with themselves', async () => {
      const res = await request(app).post('/api/up/chat/conversations')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ hostelId })
      expect(res.status).to.equal(403)
    })
  })

  describe('GET /api/up/chat/conversations', () => {
    it('returns conversations for the authenticated user', async () => {
      await request(app).post('/api/up/chat/conversations')
        .set('Authorization', `Bearer ${finderToken}`).send({ hostelId })
      const res = await request(app).get('/api/up/chat/conversations')
        .set('Authorization', `Bearer ${finderToken}`)
      expect(res.status).to.equal(200)
      expect(res.body.conversations).to.have.lengthOf(1)
    })

    it('owner sees conversations for their hostels', async () => {
      await request(app).post('/api/up/chat/conversations')
        .set('Authorization', `Bearer ${finderToken}`).send({ hostelId })
      const res = await request(app).get('/api/up/chat/conversations')
        .set('Authorization', `Bearer ${ownerToken}`)
      expect(res.status).to.equal(200)
      expect(res.body.conversations).to.have.lengthOf(1)
    })
  })

  describe('POST /api/up/chat/conversations/:id/messages', () => {
    beforeEach(async () => {
      const r = await request(app).post('/api/up/chat/conversations')
        .set('Authorization', `Bearer ${finderToken}`).send({ hostelId })
      convId = r.body.conversation._id
    })

    it('finder can send a message', async () => {
      const res = await request(app).post(`/api/up/chat/conversations/${convId}/messages`)
        .set('Authorization', `Bearer ${finderToken}`)
        .send({ text: 'Is this place available?' })
      expect(res.status).to.equal(201)
      expect(res.body.message.text).to.equal('Is this place available?')
    })

    it('owner can reply in the conversation', async () => {
      const res = await request(app).post(`/api/up/chat/conversations/${convId}/messages`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ text: 'Yes, it is!' })
      expect(res.status).to.equal(201)
    })

    it('non-participant is denied', async () => {
      const res = await request(app).post(`/api/up/chat/conversations/${convId}/messages`)
        .set('Authorization', `Bearer ${finder2Token}`)
        .send({ text: 'Hack' })
      expect(res.status).to.equal(403)
    })
  })

  describe('GET /api/up/chat/conversations/:id/messages', () => {
    it('returns messages in chronological order', async () => {
      const r = await request(app).post('/api/up/chat/conversations')
        .set('Authorization', `Bearer ${finderToken}`).send({ hostelId })
      convId = r.body.conversation._id
      await request(app).post(`/api/up/chat/conversations/${convId}/messages`)
        .set('Authorization', `Bearer ${finderToken}`).send({ text: 'First' })
      await request(app).post(`/api/up/chat/conversations/${convId}/messages`)
        .set('Authorization', `Bearer ${ownerToken}`).send({ text: 'Second' })
      const res = await request(app).get(`/api/up/chat/conversations/${convId}/messages`)
        .set('Authorization', `Bearer ${finderToken}`)
      expect(res.status).to.equal(200)
      expect(res.body.messages).to.have.lengthOf(2)
      expect(res.body.messages[0].text).to.equal('First')
    })
  })
})
