/**
 * Vercel serverless entry — runs Express app per request.
 *
 * Known limitations on Vercel:
 * - Socket.IO (real-time chat) does not work — WebSockets require a persistent server.
 *   Host the socket server separately on Railway/Render and set SOCKET_SERVER_URL.
 * - File uploads via multer write to disk which is read-only on Vercel.
 *   Use Cloudinary/S3 for production image uploads.
 * - node-cron jobs do not run — use Vercel Cron triggers instead.
 */
import connectDatabase from '../src/database/database.js'
import { app } from '../src/app.js'

let dbConnected = false

export default async function handler(req, res) {
  if (!dbConnected) {
    try {
      await connectDatabase()
      dbConnected = true
    } catch (err) {
      return res.status(500).json({ message: 'Database connection failed' })
    }
  }
  app(req, res)
}
