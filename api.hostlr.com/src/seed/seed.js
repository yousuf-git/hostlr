import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../.env.dev') })

import User from '../models/user.model.js'
import Hostel from '../models/hostel.model.js'
import Room from '../models/room.model.js'
import Seat from '../models/seat.model.js'
import Reservation from '../models/reservation.model.js'
import Conversation from '../models/conversation.model.js'
import Message from '../models/message.model.js'
import { hostelImages, roomImages } from './assets.js'

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

function pick(arr, n) {
  const s = [...arr].sort(() => Math.random() - 0.5)
  return n === 1 ? s[0] : s.slice(0, n)
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✓ Connected')

  await Promise.all([
    User.deleteMany({}), Hostel.deleteMany({}), Room.deleteMany({}),
    Seat.deleteMany({}), Reservation.deleteMany({}),
    Conversation.deleteMany({}), Message.deleteMany({}),
  ])
  console.log('✓ Cleared collections')

  // Users
  const [adminPw, ownerPw, finderPw] = await Promise.all([
    bcrypt.hash('Admin@123', 12), bcrypt.hash('Owner@123', 12), bcrypt.hash('Finder@123', 12),
  ])

  await User.create({ name: 'Admin HOSTLR', email: 'admin@hostlr.test', passwordHash: adminPw, role: 'admin' })

  const owners = await User.insertMany([
    { name: 'Ahsan Raza', email: 'owner1@hostlr.test', passwordHash: ownerPw, role: 'owner', phone: '+923001234567', cnic: '35202-1234567-1' },
    { name: 'Fatima Iqbal', email: 'owner2@hostlr.test', passwordHash: ownerPw, role: 'owner', phone: '+923011234567', cnic: '35202-2345678-2' },
    { name: 'Bilal Shah', email: 'owner3@hostlr.test', passwordHash: ownerPw, role: 'owner', phone: '+923021234567', cnic: '35202-3456789-3' },
    { name: 'Hira Qureshi', email: 'owner4@hostlr.test', passwordHash: ownerPw, role: 'owner', phone: '+923031234567', cnic: '35202-4567890-4' },
  ])

  const finders = await User.insertMany([
    { name: 'Usman Ali', email: 'finder1@hostlr.test', passwordHash: finderPw, role: 'finder' },
    { name: 'Ayesha Khan', email: 'finder2@hostlr.test', passwordHash: finderPw, role: 'finder' },
    { name: 'Zain Abbas', email: 'finder3@hostlr.test', passwordHash: finderPw, role: 'finder' },
    { name: 'Sara Malik', email: 'finder4@hostlr.test', passwordHash: finderPw, role: 'finder' },
    { name: 'Hamza Sheikh', email: 'finder5@hostlr.test', passwordHash: finderPw, role: 'finder' },
    { name: 'Noor Fatima', email: 'finder6@hostlr.test', passwordHash: finderPw, role: 'finder' },
    { name: 'Asad Butt', email: 'finder7@hostlr.test', passwordHash: finderPw, role: 'finder' },
    { name: 'Maria Ahmed', email: 'finder8@hostlr.test', passwordHash: finderPw, role: 'finder' },
    { name: 'Talha Rehman', email: 'finder9@hostlr.test', passwordHash: finderPw, role: 'finder' },
    { name: 'Sana Rizvi', email: 'finder10@hostlr.test', passwordHash: finderPw, role: 'finder' },
  ])
  console.log(`✓ Created ${1 + owners.length + finders.length} users`)

  // Hostels
  const hostelDefs = [
    { name: 'Gulberg Residency Boys Hostel', city: 'Lahore', address: 'Main Boulevard Gulberg III, Lahore', gender: 'male', ownerId: owners[0]._id, amenities: ['wifi', 'meals', 'laundry', 'security', 'generator'] },
    { name: 'F-7 Girls Residence', city: 'Islamabad', address: 'Street 12, F-7/2, Islamabad', gender: 'female', ownerId: owners[0]._id, amenities: ['wifi', 'meals', 'ac', 'security', 'study-room'] },
    { name: 'DHA Phase 5 Student House', city: 'Karachi', address: 'Khayaban-e-Seher, DHA Phase 5, Karachi', gender: 'coed', ownerId: owners[1]._id, amenities: ['wifi', 'ac', 'parking', 'laundry'] },
    { name: 'Saddar Boys Hostel', city: 'Rawalpindi', address: 'Committee Chowk, Saddar, Rawalpindi', gender: 'male', ownerId: owners[1]._id, amenities: ['wifi', 'meals', 'generator', 'security'] },
    { name: 'Susan Road Hostel', city: 'Faisalabad', address: 'Susan Road, D-Ground, Faisalabad', gender: 'coed', ownerId: owners[2]._id, amenities: ['wifi', 'laundry', 'security', 'parking'] },
    { name: 'Hayatabad Student Residency', city: 'Peshawar', address: 'Phase 6, Hayatabad, Peshawar', gender: 'male', ownerId: owners[2]._id, amenities: ['wifi', 'meals', 'study-room', 'generator'] },
    { name: 'Gulgasht Colony Boys Hostel', city: 'Multan', address: 'Block C, Gulgasht Colony, Multan', gender: 'male', ownerId: owners[3]._id, amenities: ['wifi', 'meals', 'laundry', 'security'] },
    { name: 'Quetta Study Center Hostel', city: 'Quetta', address: 'Jinnah Road, Quetta', gender: 'coed', ownerId: owners[3]._id, amenities: ['wifi', 'study-room', 'generator', 'security'] },
  ]

  const hostels = await Hostel.insertMany(hostelDefs.map((h, i) => ({
    ...h,
    description: `A comfortable and well-managed hostel in ${h.city} for students and professionals.`,
    images: [hostelImages[i % hostelImages.length], hostelImages[(i + 1) % hostelImages.length]],
    status: 'active',
  })))
  console.log(`✓ Created ${hostels.length} hostels`)

  // Rooms & Seats
  const roomConfigs = [
    { name: 'Standard Room', pricePerSeat: 9000, totalSeats: 4 },
    { name: 'Deluxe Room', pricePerSeat: 14000, totalSeats: 3 },
    { name: 'Economy Room', pricePerSeat: 7000, totalSeats: 6 },
    { name: 'Premium Room', pricePerSeat: 20000, totalSeats: 2 },
  ]

  const allRooms = [], allSeats = []
  for (const hostel of hostels) {
    for (let ri = 0; ri < 3; ri++) {
      const cfg = roomConfigs[ri]
      const room = {
        _id: new mongoose.Types.ObjectId(),
        hostelId: hostel._id,
        name: cfg.name, totalSeats: cfg.totalSeats, pricePerSeat: cfg.pricePerSeat,
        pricingUnit: 'monthly',
        amenities: pick(hostel.amenities, 2),
        images: [roomImages[ri % roomImages.length]],
        createdAt: new Date(), updatedAt: new Date(),
      }
      allRooms.push(room)
      for (let si = 0; si < cfg.totalSeats; si++) {
        allSeats.push({
          roomId: room._id, hostelId: hostel._id,
          label: `Bed ${LABELS[si] || si + 1}`,
          status: 'available', reservationId: null,
        })
      }
    }
  }
  await Room.insertMany(allRooms)
  const insertedSeats = await Seat.insertMany(allSeats)
  console.log(`✓ Created ${allRooms.length} rooms, ${insertedSeats.length} seats`)

  // Reservations
  const seats = [...insertedSeats]
  const now = new Date()

  function popSeat() {
    if (!seats.length) return null
    return seats.splice(Math.floor(Math.random() * seats.length), 1)[0]
  }

  // 4 pending (still valid)
  for (let i = 0; i < 4; i++) {
    const s = popSeat(); if (!s) break
    const hostel = hostels.find(h => h._id.equals(s.hostelId))
    const expiresAt = new Date(now.getTime() + (20 + i * 4) * 60 * 60 * 1000)
    const res = await Reservation.create({
      seatId: s._id, roomId: s.roomId, hostelId: s.hostelId,
      finderId: finders[i]._id, ownerId: hostel.ownerId,
      status: 'pending', expiresAt,
    })
    await Seat.findByIdAndUpdate(s._id, { status: 'reserved', reservationId: res._id })
  }

  // 3 completed (seats booked)
  for (let i = 0; i < 3; i++) {
    const s = popSeat(); if (!s) break
    const hostel = hostels.find(h => h._id.equals(s.hostelId))
    const expiresAt = new Date(now.getTime() - 24 * 3600 * 1000)
    const res = await Reservation.create({
      seatId: s._id, roomId: s.roomId, hostelId: s.hostelId,
      finderId: finders[i + 4]._id, ownerId: hostel.ownerId,
      status: 'completed', expiresAt, completedAt: new Date(now.getTime() - 12 * 3600 * 1000),
    })
    await Seat.findByIdAndUpdate(s._id, { status: 'booked', reservationId: res._id })
  }

  // 2 expired
  for (let i = 0; i < 2; i++) {
    const s = popSeat(); if (!s) break
    const hostel = hostels.find(h => h._id.equals(s.hostelId))
    await Reservation.create({
      seatId: s._id, roomId: s.roomId, hostelId: s.hostelId,
      finderId: finders[i + 7]._id, ownerId: hostel.ownerId,
      status: 'expired', expiresAt: new Date(now.getTime() - 48 * 3600 * 1000),
    })
  }

  // 2 cancelled
  for (let i = 0; i < 2; i++) {
    const s = popSeat(); if (!s) break
    const hostel = hostels.find(h => h._id.equals(s.hostelId))
    await Reservation.create({
      seatId: s._id, roomId: s.roomId, hostelId: s.hostelId,
      finderId: finders[i + 9 < finders.length ? i + 9 : i]._id, ownerId: hostel.ownerId,
      status: 'cancelled', expiresAt: new Date(now.getTime() + 24 * 3600 * 1000),
      cancelReason: 'Changed plans',
    })
  }
  console.log('✓ Created reservations')

  // Conversations & Messages
  const chatPairs = [
    { fi: 0, hi: 0 }, { fi: 1, hi: 2 }, { fi: 2, hi: 4 }, { fi: 3, hi: 6 },
  ]
  const chatLines = [
    ['Assalamu alaikum, kya seat available hai?', 'Wa alaikum salam! Haan available hai, kab aana chahte hain?'],
    ['Next week se chahiye. Price negotiate ho sakti hai?', 'Thodi bahut ho sakti hai, aa ke baat karte hain.'],
    ['Meals ka kya arrangement hai?', 'Din mein do waqt ka khana milta hai, nashta bhi included.'],
    ['WiFi speed kaisi hai? Online classes ke liye chahiye.', 'WiFi theek hai, 50 Mbps hai, koi masla nahi hoga.'],
    ['Room sharing kitne logon ke sath hogi?', 'Standard mein 4 log hain, Deluxe mein 2-3 hain.'],
  ]

  for (const { fi, hi } of chatPairs) {
    const finder = finders[fi], hostel = hostels[hi]
    const owner = owners.find(o => o._id.equals(hostel.ownerId))
    const conv = await Conversation.create({
      hostelId: hostel._id, finderId: finder._id, ownerId: owner._id,
      lastMessageAt: new Date(),
      lastMessagePreview: chatLines[chatLines.length - 1][1].slice(0, 60),
    })
    const msgs = []
    for (let i = 0; i < chatLines.length; i++) {
      const base = now - (chatLines.length - i) * 10 * 60 * 1000
      msgs.push({ conversationId: conv._id, senderId: finder._id, text: chatLines[i][0], createdAt: new Date(base) })
      msgs.push({ conversationId: conv._id, senderId: owner._id, text: chatLines[i][1], createdAt: new Date(base + 60000) })
    }
    await Message.insertMany(msgs)
  }
  console.log('✓ Created conversations & messages')

  console.log('\n✅ Seed complete!')
  console.log('  admin@hostlr.test      / Admin@123')
  console.log('  owner1-4@hostlr.test   / Owner@123')
  console.log('  finder1-10@hostlr.test / Finder@123')

  await mongoose.disconnect()
}

seed().catch(err => { console.error(err); process.exit(1) })
