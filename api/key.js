import { Low } from 'lowdb'
import { Memory } from 'lowdb'
import { nanoid } from 'nanoid'

const adapter = new Memory()
const db = new Low(adapter)

await db.read()
db.data ||= { keys: [] }

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  if (!ip) return res.status(400).send("IP alınamadı.")

  await db.read()

  if (req.method === 'GET') {
    let record = db.data.keys.find(entry => entry.ip === ip)

    if (record) {
      if (record.used) {
        return res.status(403).send("Key zaten kullanıldı.")
      }
      return res.status(200).send(record.key)
    }

    const key = nanoid(12)
    db.data.keys.push({ ip, key, used: false })
    return res.status(200).send(key)
  }

  return res.status(405).send("Method Not Allowed")
}
