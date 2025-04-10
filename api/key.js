// api/key.js
import { nanoid } from 'nanoid';

const keys = {}; // Hafızada saklanan key'ler: { ip: { key, used } }

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  if (req.method === 'POST') {
    // Yeni key oluştur
    const key = nanoid(12);
    keys[ip] = { key, used: false };
    return res.status(200).json({ key });
  }

  if (req.method === 'GET') {
    const { key: providedKey } = req.query;

    if (!keys[ip]) return res.status(403).json({ success: false, message: "Key yok." });
    if (keys[ip].used) return res.status(403).json({ success: false, message: "Key zaten kullanıldı." });
    if (keys[ip].key !== providedKey) return res.status(403).json({ success: false, message: "Key yanlış." });

    keys[ip].used = true;
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ message: 'Method Not
