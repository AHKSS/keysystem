import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { nanoid } from 'nanoid'
import path from 'path'

// Dosya yolu ayarla (Vercel'de doğru çalışması için tam yol)
const file = path.resolve('./db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)

// Veritabanını yükle
await db.read()
db.data ||= { keys: [] }

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

  if (!ip) return res.status(400).json({ message: "IP alınamadı." })

  // Yeni key üretme
  if (req.method === 'POST') {
    const existing = db.data.keys.find(entry => entry.ip === ip)

    if (existing && !existing.used) {
      return res.status(200).json({ key: existing.key })
    }

    const key = nanoid(12)
    db.data.keys.push({ ip, key, used: false })
    await db.write()

    return res.status(200).json({ key })
  }

  // Key doğrulama
  if (req.method === 'GET') {
    const { key: providedKey } = req.query

    const record = db.data.keys.find(entry => entry.ip === ip)

    if (!record) return res.status(403).json({ success: false, message: "Key bulunamadı." })
    if (record.used) return res.status(403).json({ success: false, message: "Key zaten kullanıldı." })
    if (record.key !== providedKey) return res.status(403).json({ success: false, message: "Key yanlış." })

    record.used = true
    await db.write()

    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ message: "Method Not Allowed" })
}
