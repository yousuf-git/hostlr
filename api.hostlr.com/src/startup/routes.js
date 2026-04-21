import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import mongoose from 'mongoose'
import apRoutes from '../routes/ap/index.js'
import upRoutes from '../routes/up/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const healthTemplate = readFileSync(path.join(__dirname, '../templates/health.html'), 'utf8')

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m ${s}s`
  return `${m}m ${s}s`
}

export default function (app) {
  app.use('/api/ap', apRoutes)
  app.use('/api/up', upRoutes)

  app.get('/api/health', (req, res) => {
    const dbOk = mongoose.connection.readyState === 1
    const mem = process.memoryUsage()
    const overall = dbOk ? 'ok' : 'err'

    const html = healthTemplate
      .replace('{{STATUS_CLASS}}', overall)
      .replace('{{STATUS_TEXT}}', overall === 'ok' ? 'All Systems Operational' : 'Degraded — DB Unreachable')
      .replace('{{DB_CLASS}}',    dbOk ? 'ok' : 'err')
      .replace('{{DB_STATUS}}',   dbOk ? 'Connected' : 'Disconnected')
      .replace('{{ENV}}',         process.env.NODE_ENV || 'development')
      .replace('{{UPTIME}}',      formatUptime(process.uptime()))
      .replace('{{MEMORY_USED}}', (mem.rss / 1024 / 1024).toFixed(1))
      .replace('{{HEAP_TOTAL}}',  (mem.heapTotal / 1024 / 1024).toFixed(1))
      .replace('{{NODE_VERSION}}', process.version)
      .replace('{{TIMESTAMP}}',   new Date().toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'medium', hour12: true }))

    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'")
    res.send(html)
  })

  app.get('/api/health/json', (req, res) => {
    res.json({
      status: mongoose.connection.readyState === 1 ? 'ok' : 'degraded',
      service: 'hostlr-api',
      db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      memory: { rss: process.memoryUsage().rss, heapUsed: process.memoryUsage().heapUsed },
      node: process.version,
      timestamp: new Date(),
    })
  })
}
