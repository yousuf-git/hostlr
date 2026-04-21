import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { app } from '../src/app.js'
import request from 'supertest'
import bcrypt from 'bcryptjs'
import User from '../src/models/user.model.js'

let mongod

export async function setupDb() {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
}

export async function teardownDb() {
  await mongoose.disconnect()
  await mongod.stop()
}

export async function clearDb() {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
}

export async function createUser(overrides = {}) {
  const defaults = {
    name: 'Test User',
    email: `user_${Date.now()}_${Math.random().toString(36).slice(2)}@test.com`,
    passwordHash: await bcrypt.hash('Pass@123', 10),
    role: 'finder',
    isActive: true,
  }
  return User.create({ ...defaults, ...overrides })
}

// Login and return token — uses res.body.token (top-level spread pattern)
export async function loginUser(email, password) {
  const res = await request(app).post('/api/up/auth/login').send({ email, password })
  return res.body.token
}
