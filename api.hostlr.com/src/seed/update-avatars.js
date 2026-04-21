import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'
import mongoose from 'mongoose'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../.env.dev') })

import User from '../models/user.model.js'

await mongoose.connect(process.env.MONGODB_URI)
console.log('Connected to MongoDB')

const users = await User.find({})
console.log(`Found ${users.length} users`)

let updated = 0
for (let i = 0; i < users.length; i++) {
  const user = users[i]
  if (!user.avatarUrl) {
    const imgNum = (i % 70) + 1
    user.avatarUrl = `https://i.pravatar.cc/150?img=${imgNum}`
    await user.save()
    updated++
    console.log(`Updated: ${user.name} (${user.email}) → img=${imgNum}`)
  }
}

console.log(`Done. Updated ${updated} users.`)
await mongoose.disconnect()
