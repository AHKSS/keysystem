import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { nanoid } from 'nanoid'
import path from 'path'

const file = path.resolve('./db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)

await db.read()
db.data ||= { keys: [] }

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

  if (!ip) return res.status(400).json({ message: "IP alınamadı." })

  if (req.method === 'GET') {
    let record = db.data.keys.find(entry => entry.ip === ip)

    if (record) {
      if (record.used) {
        return res.status(403).json({ success: false, message: "Key zaten kullanıldı." })
      }
      return res.status(200).json({ key: record.key })
    }

    // Yeni key üret
    const key = nanoid(12)
    db.data.keys.push({ ip, key, used: false })
    await db.write()

    return res.status(200).json({ key })
  }

  return res.status(405).json({ message: "Method Not Allowed" })
}
